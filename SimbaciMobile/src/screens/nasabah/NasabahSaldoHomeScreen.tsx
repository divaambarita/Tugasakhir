import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {getNasabahDetail} from '../../api/nasabah';
import {getPenarikanByNasabah} from '../../api/penarikan';
import {getTransaksiByNasabah} from '../../api/transaksi';
import {getJenisSampahData, type JenisSampahRow} from '../../api/jenisSampah';
import type {NasabahSaldoStackParamList} from '../../navigation/stacks/NasabahSaldoStackNavigator';

import {AppButton} from '../../components/ui/AppButton';
import {Card} from '../../components/ui/Card';
import {EmptyState} from '../../components/ui/EmptyState';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<NasabahSaldoStackParamList>;

function safeNumber(input: unknown): number {
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number): string {
  return Number(n ?? 0).toLocaleString('id-ID');
}

export function NasabahSaldoHomeScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const hasLoadedOnce = React.useRef(false);

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [saldo, setSaldo] = React.useState<number>(0);
  const [totalPemasukan, setTotalPemasukan] = React.useState<number>(0);
  const [totalPengeluaran, setTotalPengeluaran] = React.useState<number>(0);
  const [bsuName, setBsuName] = React.useState('');
  const [hargaRows, setHargaRows] = React.useState<JenisSampahRow[]>([]);

  const nasabahId = React.useMemo(() => {
    const id = Number(user?.idAkun);
    return Number.isFinite(id) ? id : NaN;
  }, [user?.idAkun]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    if (!Number.isFinite(nasabahId) || nasabahId <= 0) {
      setError('ID nasabah tidak valid. Silakan login ulang.');
      setSaldo(0);
      setTotalPemasukan(0);
      setTotalPengeluaran(0);
      setBsuName('');
      setHargaRows([]);
      return;
    }

    const [nasabahRes, transaksiRes, penarikanRes] = await Promise.all([
      getNasabahDetail(user.token, nasabahId),
      getTransaksiByNasabah(user.token, nasabahId, 'all'),
      getPenarikanByNasabah(user.token, nasabahId),
    ]);

    if (!nasabahRes.success) {
      setError(nasabahRes.message ?? 'Gagal memuat saldo.');
    }

    if (!transaksiRes.success) {
      setError(
        prev => prev ?? transaksiRes.message ?? 'Gagal memuat transaksi.',
      );
    }

    if (!penarikanRes.success) {
      setError(
        prev => prev ?? penarikanRes.message ?? 'Gagal memuat penarikan.',
      );
    }

    const s = safeNumber((nasabahRes.success ? nasabahRes.data : null)?.saldo);
    setSaldo(s);

    if (nasabahRes.success) {
      const bsuId = Number(nasabahRes.data?.bsuId);
      setBsuName(String(nasabahRes.data?.bsu?.nama ?? ''));
      if (Number.isFinite(bsuId) && bsuId > 0) {
        const hargaRes = await getJenisSampahData(user.token, bsuId);
        if (!hargaRes.success) {
          setError(
            prev => prev ?? hargaRes.message ?? 'Gagal memuat katalog harga.',
          );
          setHargaRows([]);
        } else {
          const activePrices = (hargaRes.data?.bsu ?? [])
            .filter(
              row =>
                row.hargasampahbsu !== null && row.hargasampahbsu !== undefined,
            )
            .sort((a, b) => a.nama.localeCompare(b.nama));
          setHargaRows(activePrices);
        }
      } else {
        setHargaRows([]);
      }
    } else {
      setBsuName('');
      setHargaRows([]);
    }

    const transaksiRows = transaksiRes.success ? transaksiRes.data : [];
    const pemasukan = transaksiRows.reduce<number>(
      (acc, row) => acc + safeNumber((row as any)?.totalhargasampah),
      0,
    );
    setTotalPemasukan(pemasukan);

    const penarikanRows = penarikanRes.success ? penarikanRes.data : [];
    const pengeluaran = penarikanRows.reduce<number>((acc, row) => {
      const status = String((row as any)?.statusKonfirmasi ?? 'Diproses');
      if (status !== 'Berhasil') {
        return acc;
      }
      return acc + safeNumber((row as any)?.totalPenarikan);
    }, 0);
    setTotalPengeluaran(pengeluaran);
  }, [nasabahId, user]);

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
          <Text style={styles.centerText}>Memuat saldo…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <SectionTitle
          title={`Halo, ${user?.nama || 'Nasabah'}`}
          subtitle="Pantau tabungan dan riwayat setoran Anda"
        />

        <Card style={styles.heroCard}>
          <Text style={styles.heroTitle}>Saldo Saat Ini</Text>
          <Text style={styles.heroValue}>Rp {formatMoney(saldo)}</Text>
          <Text style={styles.heroMeta}>
            Ringkasan saldo Anda di Bank Sampah
          </Text>
        </Card>

        <View style={styles.kpisRow}>
          <Card style={[styles.kpiCard, styles.kpiLeft]}>
            <Text style={styles.kpiTitle}>Pemasukan</Text>
            <Text style={styles.kpiValue}>
              Rp {formatMoney(totalPemasukan)}
            </Text>
          </Card>
          <Card style={[styles.kpiCard, styles.kpiRight]}>
            <Text style={styles.kpiTitle}>Pengeluaran</Text>
            <Text style={styles.kpiValue}>
              Rp {formatMoney(totalPengeluaran)}
            </Text>
          </Card>
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Tarik Saldo"
            onPress={() => navigation.navigate('NasabahPenarikanCreate')}
          />
          <AppButton
            title="Riwayat Penarikan"
            variant="secondary"
            style={styles.actionSpacing}
            onPress={() => navigation.navigate('NasabahPenarikanList')}
          />
        </View>

        <SectionTitle
          title="Harga Sampah"
          subtitle={
            bsuName ? `Acuan harga dari ${bsuName}` : 'Acuan harga dari BSU'
          }
        />

        {hargaRows.length === 0 ? (
          <EmptyState
            title="Belum ada harga sampah"
            description="Harga sampah belum diatur oleh BSU Anda."
          />
        ) : (
          hargaRows.map(row => (
            <Card key={row.idJenisSampah} style={styles.priceCard}>
              <View style={styles.priceRow}>
                <View style={styles.priceCopy}>
                  <Text style={styles.priceName}>{row.nama}</Text>
                  <Text style={styles.priceCategory}>{row.kategori}</Text>
                </View>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceBadgeText}>
                    Rp {formatMoney(safeNumber(row.hargasampahbsu))}
                  </Text>
                </View>
              </View>
              <Text style={styles.priceHint}>Harga per kilogram</Text>
            </Card>
          ))
        )}
      </ScrollView>
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
  heroCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
  },
  heroTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: '900',
    color: theme.colors.onPrimary,
    opacity: 0.95,
  },
  heroValue: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.display,
    fontWeight: '900',
    color: theme.colors.onPrimary,
    letterSpacing: 0.2,
  },
  heroMeta: {
    marginTop: theme.spacing.xs,
    color: theme.colors.onPrimary,
    opacity: 0.9,
    fontWeight: '700',
  },
  kpisRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  kpiCard: {
    flex: 1,
    borderRadius: theme.radius.lg,
  },
  kpiLeft: {},
  kpiRight: {},
  kpiTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '900',
    color: theme.colors.muted,
  },
  kpiValue: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xxl,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  actions: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  actionSpacing: {
    marginTop: theme.spacing.sm,
  },
  priceCard: {
    marginBottom: theme.spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  priceCopy: {
    flex: 1,
  },
  priceName: {
    color: theme.colors.foreground,
    fontWeight: '900',
  },
  priceCategory: {
    marginTop: 2,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.successOutline,
  },
  priceBadgeText: {
    color: theme.colors.onPrimaryContainer,
    fontSize: theme.fontSize.sm,
    fontWeight: '900',
  },
  priceHint: {
    marginTop: theme.spacing.sm,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
