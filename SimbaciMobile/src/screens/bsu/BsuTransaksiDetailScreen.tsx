import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {
  deleteTransaksiDetail,
  getTransaksiDetailByDate,
  type TransaksiDetailRow,
} from '../../api/transaksi';
import type {BsuHomeStackParamList} from '../../navigation/stacks/BsuHomeStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type R = RouteProp<BsuHomeStackParamList, 'BsuTransaksiDetail'>;
type Nav = NativeStackNavigationProp<BsuHomeStackParamList>;

function formatMoney(n: number): string {
  return Number(n ?? 0).toLocaleString('id-ID');
}

function safeNumber(input: unknown): number {
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : 0;
}

export function BsuTransaksiDetailScreen(): React.JSX.Element {
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const date = route.params.date;

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<TransaksiDetailRow[]>([]);
  const [deletingKey, setDeletingKey] = React.useState<string | null>(null);

  const hasLoadedOnce = React.useRef(false);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const res = await getTransaksiDetailByDate(user.token, date);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat detail transaksi.');
      setItems([]);
      return;
    }

    setItems(res.data ?? []);
  }, [date, user]);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;

      (async () => {
        const first = !hasLoadedOnce.current;
        if (first) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        try {
          await load();
          hasLoadedOnce.current = true;
        } finally {
          if (!cancelled) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const onDelete = (row: TransaksiDetailRow) => {
    if (!user) {
      return;
    }

    if (user.roleName !== 'bsu') {
      setError('Akses ditolak. Hanya BSU.');
      return;
    }

    const key = `${row.transaksiId}-${row.jenisSampahId}`;

    Alert.alert('Hapus Detail?', 'Tindakan ini tidak bisa dibatalkan.', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setDeletingKey(key);
          setError(null);
          try {
            const res = await deleteTransaksiDetail(
              user.token,
              row.transaksiId,
              row.jenisSampahId,
            );
            if (!res.success) {
              setError(res.message ?? 'Gagal menghapus detail transaksi.');
              return;
            }
            await load();
          } finally {
            setDeletingKey(null);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat detail…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <FlatList
        data={items}
        keyExtractor={(item, idx) =>
          `${item.transaksiId}-${item.jenisSampahId}-${idx}`
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <Card style={styles.rowCard}>
            <Text style={styles.rowTitle}>
              {item.nasabah?.nama ?? '-'} • {item.jenisSampah?.nama ?? '-'}
            </Text>
            <Text style={styles.rowSubtitle}>
              Berat: {safeNumber(item.beratsampah).toFixed(2)} kg
            </Text>
            <Text style={styles.rowSubtitle}>
              Harga/kg: {formatMoney(safeNumber(item.hargasatuan))}
            </Text>
            <Text style={styles.rowSubtitle}>
              Total: {formatMoney(safeNumber(item.totalhargasampah))}
            </Text>

            <View style={styles.rowActions}>
              <AppButton
                title="Edit"
                variant="secondary"
                onPress={() =>
                  navigation.navigate('BsuTransaksiDetailEdit', {
                    transaksiId: item.transaksiId,
                    jenisSampahId: item.jenisSampahId,
                    berat: safeNumber(item.beratsampah),
                    nasabahName: item.nasabah?.nama,
                    jenisSampahName: item.jenisSampah?.nama,
                  })
                }
                style={styles.actionBtn}
              />
              <AppButton
                title="Hapus"
                variant="destructive"
                onPress={() => onDelete(item)}
                loading={
                  deletingKey === `${item.transaksiId}-${item.jenisSampahId}`
                }
                disabled={Boolean(deletingKey)}
                style={styles.actionBtn}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Tidak ada data detail.</Text>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  rowCard: {
    marginBottom: theme.spacing.sm,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  rowSubtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
  },
  rowActions: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
