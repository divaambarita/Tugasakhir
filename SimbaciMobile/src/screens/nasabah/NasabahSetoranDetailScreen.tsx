import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';

import {useAuth} from '../../auth/AuthContext';
import {
  getTransaksiDetailByDate,
  type TransaksiDetailRow,
} from '../../api/transaksi';
import type {NasabahSetoranStackParamList} from '../../navigation/stacks/NasabahSetoranStackNavigator';

import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type Route = RouteProp<NasabahSetoranStackParamList, 'NasabahSetoranDetail'>;

function safeNumber(input: unknown): number {
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number): string {
  return Number(n ?? 0).toLocaleString('id-ID');
}

function formatWeightKg(n: number): string {
  const value = Number(n ?? 0);
  if (!Number.isFinite(value)) {
    return '0';
  }
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

export function NasabahSetoranDetailScreen(): React.JSX.Element {
  const route = useRoute<Route>();
  const {user} = useAuth();

  const {tanggalYmd, totalBerat, totalNilai} = route.params;

  const hasLoadedOnce = React.useRef(false);

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<TransaksiDetailRow[]>([]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    // NOTE:
    // Endpoint detail per tanggal yang ada sekarang (/api/transaksi/detail/get/:date)
    // secara akses masih berorientasi BSU. Untuk role nasabah, bisa jadi response kosong.
    // Screen ini tetap disiapkan agar begitu endpoint di-backend mendukung nasabah,
    // detail (Jenis, Berat, Nilai) langsung tampil.
    const res = await getTransaksiDetailByDate(user.token, tanggalYmd);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat detail setoran.');
      setRows([]);
      return;
    }

    setRows(res.data ?? []);
  }, [tanggalYmd, user]);

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
          <Text style={styles.centerText}>Memuat detail setoran…</Text>
        </View>
      </Screen>
    );
  }

  const computedTotalBerat =
    rows.length > 0
      ? rows.reduce((acc, r) => acc + safeNumber((r as any).beratsampah), 0)
      : totalBerat;

  const computedTotalNilai =
    rows.length > 0
      ? rows.reduce(
          (acc, r) => acc + safeNumber((r as any).totalhargasampah),
          0,
        )
      : totalNilai;

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Card style={styles.summaryCard}>
          <Text style={styles.title}>{tanggalYmd}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Total Berat</Text>
            <Text style={styles.value}>
              {formatWeightKg(computedTotalBerat)} kg
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Nilai Ekonomi</Text>
            <Text style={styles.value}>
              Rp {formatMoney(computedTotalNilai)}
            </Text>
          </View>
        </Card>

        {rows.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>Detail belum tersedia</Text>
          </Card>
        ) : (
          rows.map((r, idx) => {
            const jenis =
              (r as any)?.jenisSampah?.nama ??
              (r as any)?.['jenisSampah.nama'] ??
              'Jenis Sampah';
            const berat = safeNumber((r as any).beratsampah);
            const nilai = safeNumber((r as any).totalhargasampah);

            return (
              <Card
                key={`${r.transaksiId}-${r.jenisSampahId}-${idx}`}
                style={styles.card}>
                <Text style={styles.cardTitle}>{jenis}</Text>

                <View style={styles.row}>
                  <Text style={styles.label}>Berat</Text>
                  <Text style={styles.value}>{formatWeightKg(berat)} kg</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Nilai</Text>
                  <Text style={styles.value}>Rp {formatMoney(nilai)}</Text>
                </View>
              </Card>
            );
          })
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
  summaryCard: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  card: {
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  label: {
    color: theme.colors.muted,
    fontWeight: '700',
  },
  value: {
    color: theme.colors.foreground,
    fontWeight: '900',
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  emptyDesc: {
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
