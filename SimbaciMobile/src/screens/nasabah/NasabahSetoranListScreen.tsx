import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {
  getTransaksiByNasabah,
  type TransaksiSummary,
} from '../../api/transaksi';
import type {NasabahSetoranStackParamList} from '../../navigation/stacks/NasabahSetoranStackNavigator';
import {formatYmdIndonesian, isoToJakartaYmd} from '../../utils/date';

import {Card} from '../../components/ui/Card';
import {EmptyState} from '../../components/ui/EmptyState';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<NasabahSetoranStackParamList>;

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

export function NasabahSetoranListScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const hasLoadedOnce = React.useRef(false);

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<TransaksiSummary[]>([]);

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
      setRows([]);
      return;
    }

    const res = await getTransaksiByNasabah(user.token, nasabahId, 'all');
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat riwayat setoran.');
      setRows([]);
      return;
    }

    setRows(res.data ?? []);
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
          <Text style={styles.centerText}>Memuat riwayat setoran…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <SectionTitle title="Setoran" subtitle="Riwayat setoran milik Anda" />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {rows.length === 0 ? (
          <EmptyState
            title="Belum ada setoran"
            description="Setoran yang dicatat oleh petugas BSU akan muncul di halaman ini."
          />
        ) : (
          rows.map(r => {
            const dateYmd = isoToJakartaYmd(r.tanggal);
            const berat = safeNumber((r as any).beratsampah);
            const nilai = safeNumber((r as any).totalhargasampah);

            return (
              <Pressable
                key={`${r.idTransaksi}-${dateYmd}`}
                onPress={() =>
                  navigation.navigate('NasabahSetoranDetail', {
                    tanggalYmd: dateYmd,
                    totalBerat: berat,
                    totalNilai: nilai,
                  })
                }>
                <Card style={styles.card}>
                  <View style={styles.rowTop}>
                    <View style={styles.rowTopText}>
                      <Text style={styles.cardTitle}>
                        {formatYmdIndonesian(dateYmd)}
                      </Text>
                      <Text style={styles.hint}>
                        Ketuk untuk melihat detail
                      </Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        Rp {formatMoney(nilai)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.kpis}>
                    <View style={styles.kpiBox}>
                      <Text style={styles.kpiLabel}>Berat</Text>
                      <Text style={styles.kpiValue}>
                        {formatWeightKg(berat)} kg
                      </Text>
                    </View>
                    <View style={styles.kpiDivider} />
                    <View style={styles.kpiBox}>
                      <Text style={styles.kpiLabel}>Nilai</Text>
                      <Text style={styles.kpiValue}>
                        Rp {formatMoney(nilai)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
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
  card: {
    marginBottom: theme.spacing.sm,
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
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  hint: {
    color: theme.colors.muted,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryOutlineSoft,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  kpis: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kpiBox: {
    flex: 1,
    alignItems: 'center',
  },
  kpiDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.border,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.muted,
  },
  kpiValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
});
