import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {getTransaksiByBsu, type TransaksiSummary} from '../../api/transaksi';
import type {BsuHomeStackParamList} from '../../navigation/stacks/BsuHomeStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';
import {isoToJakartaYmd} from '../../utils/date';

type Nav = NativeStackNavigationProp<BsuHomeStackParamList>;

type Row = {
  key: string;
  date: string;
  tanggalIso: string;
  totalBerat: number;
  totalHarga: number;
};

function formatMoney(n: number): string {
  return Number(n ?? 0).toLocaleString('id-ID');
}

function toDateOnly(iso: string): string {
  return isoToJakartaYmd(String(iso));
}

function safeNumber(input: unknown): number {
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : 0;
}

function toRow(t: TransaksiSummary): Row {
  const dateOnly = toDateOnly(t.tanggal);
  return {
    key: `${dateOnly}-${t.idTransaksi}`,
    date: dateOnly,
    tanggalIso: t.tanggal,
    totalBerat: safeNumber(t.beratsampah),
    totalHarga: safeNumber(t.totalhargasampah),
  };
}

export function BsuTransaksiListScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const hasLoadedOnce = React.useRef(false);

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const bsuId = Number(user.idAkun);
    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      setItems([]);
      return;
    }

    const res = await getTransaksiByBsu(user.token, bsuId, 'all');
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat transaksi.');
      setItems([]);
      return;
    }

    const rows = (res.data ?? []).map(toRow);
    setItems(rows);
  }, [user]);

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

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat transaksi…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <View style={styles.actionsRow}>
        <AppButton
          title="Tambah Transaksi"
          onPress={() => navigation.navigate('BsuTransaksiCreate')}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() =>
              navigation.navigate('BsuTransaksiDetail', {date: item.date})
            }
            style={({pressed}) => [pressed ? styles.pressed : null]}>
            <Card style={styles.rowCard}>
              <View style={styles.rowTop}>
                <View style={styles.rowTopText}>
                  <Text style={styles.rowTitle}>{item.date}</Text>
                  <Text style={styles.rowHint}>Tap untuk lihat detail</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.totalBerat.toFixed(2)} kg</Text>
                </View>
              </View>

              <Text style={styles.rowAmount}>Rp {formatMoney(item.totalHarga)}</Text>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada transaksi.</Text>
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
  actionsRow: {
    marginBottom: theme.spacing.sm,
  },
  rowCard: {
    marginBottom: theme.spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowTopText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.foreground,
  },
  rowHint: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  rowAmount: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xxl,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.cardAlt,
    borderColor: theme.colors.border,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
