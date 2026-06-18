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
  deletePemasukan,
  deletePengeluaran,
  getPemasukanByBsu,
  getPengeluaranByBsu,
  getPenjualanByBsu,
  type PemasukanRow,
  type PengeluaranRow,
  type PenjualanGroupedRow,
} from '../../api/keuangan';
import type {BsuFinanceStackParamList} from '../../navigation/stacks/BsuFinanceStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';
import {isoToJakartaYmd} from '../../utils/date';

type Nav = NativeStackNavigationProp<BsuFinanceStackParamList>;

type KeuanganType = 'pemasukan' | 'pengeluaran' | 'penjualan';

type Row = {
  key: string;
  type: KeuanganType;
  tanggalIso: string;
  tanggal: string;
  uraian: string;
  amount: number;
  idPemasukan?: number;
  idPengeluaran?: number;
  idPenjualan?: number;
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

function mapPemasukan(p: PemasukanRow): Row {
  const tanggalIso = String(p.tanggal);
  return {
    key: `pemasukan-${p.idPemasukan}`,
    type: 'pemasukan',
    tanggalIso,
    tanggal: toDateOnly(tanggalIso),
    uraian: p.tujuan,
    amount: safeNumber(p.saldo),
    idPemasukan: p.idPemasukan,
  };
}

function mapPengeluaran(p: PengeluaranRow): Row {
  const tanggalIso = String(p.tanggal);
  return {
    key: `pengeluaran-${p.idPengeluaran}`,
    type: 'pengeluaran',
    tanggalIso,
    tanggal: toDateOnly(tanggalIso),
    uraian: p.tujuan,
    amount: -Math.abs(safeNumber(p.saldo)),
    idPengeluaran: p.idPengeluaran,
  };
}

function mapPenjualan(p: PenjualanGroupedRow): Row {
  const tanggalIso = String(p.tanggal);
  return {
    key: `penjualan-${p.idPenjualan}`,
    type: 'penjualan',
    tanggalIso,
    tanggal: toDateOnly(tanggalIso),
    uraian: p.tujuan,
    amount: safeNumber(p.saldo),
    idPenjualan: p.idPenjualan,
  };
}

function sortByTanggalDesc(a: Row, b: Row): number {
  const ta = new Date(a.tanggalIso).getTime();
  const tb = new Date(b.tanggalIso).getTime();
  if (ta === tb) {
    return 0;
  }
  return tb - ta;
}

function typeLabel(t: KeuanganType): string {
  if (t === 'pemasukan') {
    return 'Pemasukan';
  }
  if (t === 'pengeluaran') {
    return 'Pengeluaran';
  }
  return 'Penjualan';
}

export function BsuKeuanganListScreen(): React.JSX.Element {
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

    const [pemasukanRes, pengeluaranRes, penjualanRes] = await Promise.all([
      getPemasukanByBsu(user.token, bsuId),
      getPengeluaranByBsu(user.token, bsuId),
      getPenjualanByBsu(user.token, bsuId),
    ]);

    const errs: string[] = [];
    const pemasukan = pemasukanRes.success ? pemasukanRes.data ?? [] : [];
    const pengeluaran = pengeluaranRes.success ? pengeluaranRes.data ?? [] : [];
    const penjualan = penjualanRes.success ? penjualanRes.data ?? [] : [];

    if (!pemasukanRes.success) {
      errs.push(pemasukanRes.message ?? 'Gagal memuat pemasukan.');
    }
    if (!pengeluaranRes.success) {
      errs.push(pengeluaranRes.message ?? 'Gagal memuat pengeluaran.');
    }
    if (!penjualanRes.success) {
      errs.push(penjualanRes.message ?? 'Gagal memuat penjualan.');
    }

    if (errs.length > 0) {
      setError(errs[0]);
    }

    const rows = [
      ...pemasukan.map(mapPemasukan),
      ...pengeluaran.map(mapPengeluaran),
      ...penjualan.map(mapPenjualan),
    ].sort(sortByTanggalDesc);

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

  const onDeleteRow = (row: Row) => {
    if (!user) {
      return;
    }

    if (row.type === 'penjualan') {
      return;
    }

    Alert.alert('Konfirmasi', 'Hapus data ini?', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const token = user.token;
          let res = null;
          if (row.type === 'pemasukan' && row.idPemasukan) {
            res = await deletePemasukan(token, row.idPemasukan);
          } else if (row.type === 'pengeluaran' && row.idPengeluaran) {
            res = await deletePengeluaran(token, row.idPengeluaran);
          }

          if (!res) {
            return;
          }

          if (!res.success) {
            Alert.alert('Gagal', res.message ?? 'Gagal menghapus data.');
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
          <Text style={styles.centerText}>Memuat keuangan…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <View style={styles.actions}>
        <AppButton
          title="Tambah Pemasukan"
          onPress={() => navigation.navigate('BsuKeuanganAddPemasukan')}
        />
        <View style={styles.actionsGrid}>
          <AppButton
            title="Tambah Pengeluaran"
            variant="secondary"
            style={styles.actionHalf}
            onPress={() => navigation.navigate('BsuKeuanganAddPengeluaran')}
          />
          <AppButton
            title="Tambah Penjualan"
            variant="secondary"
            style={styles.actionHalf}
            onPress={() => navigation.navigate('BsuKeuanganAddPenjualan')}
          />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => {
          const isOut = item.amount < 0;
          const amountText = `${isOut ? '-' : '+'}${formatMoney(
            Math.abs(item.amount),
          )}`;
          return (
            <Card style={styles.rowCard}>
              <View style={styles.rowHeader}>
                <View style={styles.rowHeaderLeft}>
                  <Text style={styles.rowTitle}>{item.tanggal}</Text>
                  <Text style={styles.rowType}>{typeLabel(item.type)}</Text>
                </View>
                {item.type !== 'penjualan' ? (
                  <Pressable
                    onPress={() => onDeleteRow(item)}
                    style={({pressed}) => [
                      styles.deleteChip,
                      pressed ? styles.pressed : null,
                    ]}>
                    <Text style={styles.deleteChipText}>Hapus</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.rowSubtitle}>{item.uraian}</Text>
              <Text style={[styles.rowAmount, isOut ? styles.out : styles.in]}>
                {amountText}
              </Text>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada data keuangan.</Text>
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
  actions: {
    marginBottom: theme.spacing.sm,
  },
  actionsGrid: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionHalf: {
    flexBasis: '48%',
  },
  rowCard: {
    marginBottom: theme.spacing.sm,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowHeaderLeft: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.foreground,
  },
  rowType: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  rowSubtitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.muted,
  },
  rowAmount: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.xxl,
    fontWeight: '900',
  },
  in: {
    color: theme.colors.primary,
  },
  out: {
    color: theme.colors.destructive,
  },
  deleteChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  deleteChipText: {
    color: theme.colors.destructive,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
