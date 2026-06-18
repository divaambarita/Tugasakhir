import React from 'react';
import {
  ActivityIndicator,
  Alert,
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
import {
  deletePengurus,
  getPengurusByBsu,
  type PengurusRow,
} from '../../api/pengurus';
import type {BsuAnggotaStackParamList} from '../../navigation/stacks/BsuAnggotaStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<BsuAnggotaStackParamList>;

type Row = {
  key: string;
  idPengurus: number;
  title: string;
  subtitle: string;
};

function getNoTelpPengurus(p: PengurusRow): string {
  const anyP = p as any;
  const candidate =
    anyP?.noTelp ?? anyP?.no_telp ?? anyP?.telp ?? anyP?.telepon ?? anyP?.hp;
  const text = typeof candidate === 'string' ? candidate.trim() : '';
  return text;
}

function getNamaPengurus(p: PengurusRow): string {
  const anyP = p as any;
  const candidate =
    anyP?.namaPengurus ??
    anyP?.nama_pengurus ??
    anyP?.nama ??
    anyP?.pengurus?.namaPengurus ??
    anyP?.akun?.nama ??
    anyP?.akun?.namaAkun;
  const text = typeof candidate === 'string' ? candidate.trim() : '';
  return text || `Pengurus #${anyP?.idPengurus ?? '-'}`;
}

export function BsuPengurusListScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<PengurusRow[]>([]);

  const rows = React.useMemo<Row[]>(
    () =>
      items.map(p => ({
        key: String(p.idPengurus),
        idPengurus: p.idPengurus,
        title: getNamaPengurus(p),
        subtitle: `${p.jabatan ?? '-'} • ${getNoTelpPengurus(p) || '-'}`,
      })),
    [items],
  );

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const res = await getPengurusByBsu(user.token, Number(user.idAkun));
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat data pengurus');
      setItems([]);
      return;
    }

    setItems(res.data ?? []);
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          await load();
        } finally {
          if (!cancelled) {
            setLoading(false);
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

  const onDelete = async (idPengurus: number) => {
    if (!user) {
      return;
    }

    setError(null);

    Alert.alert('Hapus pengurus?', 'Tindakan ini tidak bisa dibatalkan.', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const res = await deletePengurus(user.token, idPengurus);
          if (!res.success) {
            setError(res.message ?? 'Gagal menghapus pengurus');
            return;
          }
          await load();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat pengurus…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <SectionTitle
        title="Pengurus"
        subtitle="Tim internal unit untuk koordinasi"
      />

      <View style={styles.actionsRow}>
        <AppButton
          title="Tambah Pengurus"
          onPress={() => navigation.navigate('BsuPengurusForm')}
        />
      </View>

      <FlatList
        data={rows}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <Card style={styles.rowCard}>
            <Pressable
              onPress={() =>
                navigation.navigate('BsuPengurusForm', {
                  idPengurus: item.idPengurus,
                })
              }
              style={({pressed}) => [
                styles.rowPress,
                pressed ? styles.pressed : null,
              ]}>
              <View style={styles.rowTop}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Pengurus</Text>
                </View>
              </View>
            </Pressable>

            <View style={styles.rowButtons}>
              <AppButton
                title="Edit"
                variant="secondary"
                onPress={() =>
                  navigation.navigate('BsuPengurusForm', {
                    idPengurus: item.idPengurus,
                  })
                }
              />
              <AppButton
                title="Hapus"
                variant="destructive"
                onPress={() => onDelete(item.idPengurus)}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada pengurus.</Text>
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
  rowPress: {
    flexDirection: 'row',
    width: '100%',
  },
  rowTop: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  pressed: {
    opacity: 0.9,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.onSurface,
  },
  rowSubtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.onSurfaceVariant,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: theme.colors.outline,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.onSurface,
  },
  rowButtons: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
