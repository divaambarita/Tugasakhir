import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {G, Line, Rect, Text as SvgText} from 'react-native-svg';

import {useAuth} from '../../auth/AuthContext';
import {
  getBsuSampahMonitoring,
  type BsuSampahMonitoring,
} from '../../api/monitoring';
import {getTransaksiByBsu, type TransaksiSummary} from '../../api/transaksi';
import type {BsuMonitoringStackParamList} from '../../navigation/stacks/BsuMonitoringStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<BsuMonitoringStackParamList>;

const categories = [
  'Limbah B3',
  'Sampah Organik (Mudah Terurai)',
  'Sampah Anorganik (Plastik)',
  'Sampah Anorganik (Kertas)',
  'Sampah Anorganik (Logam)',
  'Sampah Anorganik (Kaca)',
  'Sampah Anorganik (Karet)',
  'Sampah Anorganik (Tekstil)',
] as const;

type MonthKey = {
  year: number;
  month: number;
};

type MonthPoint = {
  label: string;
  beratKg: number;
  emisiKg: number;
};

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
    return '0 kg';
  }
  return `${value.toLocaleString('id-ID')} kg`;
}

function formatCarbonKg(n: number): string {
  const value = Number(n ?? 0);
  if (!Number.isFinite(value)) {
    return '0.00 kg CO2-eq';
  }
  return `${value.toFixed(2)} kg CO2-eq`;
}

function monthNameId(month: number): string {
  const m = Math.min(12, Math.max(1, month));
  return new Date(2000, m - 1, 1).toLocaleString('id-ID', {month: 'long'});
}

function getUniqueYears(months: MonthKey[]): number[] {
  const uniq = new Set<number>();
  for (const m of months) {
    uniq.add(m.year);
  }
  return Array.from(uniq).sort((a, b) => b - a);
}

function getMonthsForYear(months: MonthKey[], year: number): number[] {
  const uniq = new Set<number>();
  for (const m of months) {
    if (m.year === year) {
      uniq.add(m.month);
    }
  }
  return Array.from(uniq).sort((a, b) => a - b);
}

function parseMonthKey(rawKey: string): MonthKey | null {
  // Supports: YYYY-MM, YYYY-M, YYYY-MM-DD, YYYY-M-D
  const parts = rawKey.split('-').map(p => p.trim());
  if (parts.length < 2) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return null;
  }
  if (year < 1990 || year > 3000 || month < 1 || month > 12) {
    return null;
  }

  return {year, month};
}

function getAvailableMonths(
  map: Record<string, unknown> | undefined,
): MonthKey[] {
  if (!map) {
    return [];
  }
  const uniq = new Map<string, MonthKey>();
  for (const key of Object.keys(map)) {
    const mk = parseMonthKey(key);
    if (!mk) {
      continue;
    }
    uniq.set(`${mk.year}-${mk.month}`, mk);
  }
  const result = Array.from(uniq.values());
  result.sort((a, b) => (a.year - b.year) * 100 + (a.month - b.month));
  return result;
}

function sumMonthTotals(
  map: Record<string, {totalKeseluruhan: number; [kategori: string]: number}>,
  year: number,
  month: number,
): {total: number; byCategory: Record<string, number>} {
  const byCategory: Record<string, number> = {};
  let total = 0;

  for (const key of Object.keys(map)) {
    const mk = parseMonthKey(key);
    if (!mk || mk.year !== year || mk.month !== month) {
      continue;
    }

    const row = map[key];
    for (const kategori of Object.keys(row)) {
      const value = safeNumber(row[kategori]);
      if (kategori === 'totalKeseluruhan') {
        total += value;
        continue;
      }
      byCategory[kategori] = safeNumber(byCategory[kategori]) + value;
    }
  }

  return {total, byCategory};
}

function buildYearSeries(
  beratMap: BsuSampahMonitoring['beratPerKategoriByMonthYear'] | undefined,
  emisiMap:
    | BsuSampahMonitoring['emisiKarbonPerKategoriByMonthYear']
    | undefined,
  year: number,
): MonthPoint[] {
  if (!beratMap || !emisiMap) {
    return [];
  }

  const months = getAvailableMonths(beratMap).filter(m => m.year === year);
  const points: MonthPoint[] = [];
  for (const m of months) {
    const berat = sumMonthTotals(beratMap, year, m.month).total;
    const emisi = sumMonthTotals(emisiMap, year, m.month).total;
    points.push({
      label: `${m.month}`,
      beratKg: berat,
      emisiKg: emisi,
    });
  }
  return points;
}

function GroupedBarChart({
  titleLeft,
  titleRight,
  points,
}: {
  titleLeft: string;
  titleRight: string;
  points: MonthPoint[];
}): React.JSX.Element {
  const height = 280;
  const width = 1000;
  const paddingLeft = 40;
  const paddingBottom = 36;
  const paddingTop = 44;
  const chartW = width - paddingLeft - 20;
  const chartH = height - paddingTop - paddingBottom;
  const n = Math.max(points.length, 1);

  const maxValue = Math.max(
    1,
    ...points.map(p => Math.max(safeNumber(p.beratKg), safeNumber(p.emisiKg))),
  );

  const groupW = chartW / n;
  const barW = Math.max(6, groupW * 0.28);
  const gap = Math.max(4, groupW * 0.06);

  const toY = (value: number) => paddingTop + (1 - value / maxValue) * chartH;

  return (
    <View style={styles.chartWrapper}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <G>
          <Rect x={0} y={0} width={width} height={height} fill="transparent" />

          {/* Axis */}
          <Line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - 20}
            y2={height - paddingBottom}
            stroke={theme.colors.border}
            strokeWidth={2}
          />
          <Line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={height - paddingBottom}
            stroke={theme.colors.border}
            strokeWidth={2}
          />

          {/* Legend */}
          <Rect
            x={paddingLeft}
            y={10}
            width={12}
            height={12}
            fill={theme.colors.primary}
          />
          <SvgText
            x={paddingLeft + 18}
            y={20}
            fontSize={12}
            fontWeight="700"
            fill={theme.colors.muted}>
            {titleLeft}
          </SvgText>
          <Rect
            x={paddingLeft + 230}
            y={10}
            width={12}
            height={12}
            fill={theme.colors.accent}
          />
          <SvgText
            x={paddingLeft + 248}
            y={20}
            fontSize={12}
            fontWeight="700"
            fill={theme.colors.muted}>
            {titleRight}
          </SvgText>

          {/* Bars */}
          {points.map((p, i) => {
            const xCenter = paddingLeft + i * groupW + groupW / 2;

            const beratV = Math.max(0, safeNumber(p.beratKg));
            const emisiV = Math.max(0, safeNumber(p.emisiKg));

            const beratY = toY(beratV);
            const emisiY = toY(emisiV);
            const baseY = height - paddingBottom;

            const beratH = Math.max(0, baseY - beratY);
            const emisiH = Math.max(0, baseY - emisiY);

            const xLeft = xCenter - barW - gap / 2;
            const xRight = xCenter + gap / 2;

            return (
              <G key={`${p.label}-${i}`}>
                <Rect
                  x={xLeft}
                  y={beratY}
                  width={barW}
                  height={beratH}
                  fill={theme.colors.primary}
                  rx={4}
                />
                <Rect
                  x={xRight}
                  y={emisiY}
                  width={barW}
                  height={emisiH}
                  fill={theme.colors.accent}
                  rx={4}
                />
                <SvgText
                  x={xCenter}
                  y={height - 10}
                  fontSize={11}
                  fontWeight="700"
                  fill={theme.colors.muted}
                  textAnchor="middle">
                  {p.label}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

export function BsuMonitoringScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();
  const hasLoadedOnce = React.useRef(false);

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [sampah, setSampah] = React.useState<BsuSampahMonitoring | null>(null);
  const [todayTransaksiCount, setTodayTransaksiCount] = React.useState(0);
  const [todayTotalBeratKg, setTodayTotalBeratKg] = React.useState(0);

  const now = React.useMemo(() => new Date(), []);
  const [filterYear, setFilterYear] = React.useState<number>(now.getFullYear());
  const [filterMonth, setFilterMonth] = React.useState<number>(
    now.getMonth() + 1,
  );

  const [openDropdown, setOpenDropdown] = React.useState<
    'year' | 'month' | null
  >(null);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const bsuId = Number(user.idAkun);
    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      setSampah(null);
      setTodayTransaksiCount(0);
      setTodayTotalBeratKg(0);
      return;
    }

    const [sampahRes, todayRes] = await Promise.all([
      getBsuSampahMonitoring(user.token, bsuId),
      getTransaksiByBsu(user.token, bsuId, 'today'),
    ]);

    if (!sampahRes.success) {
      setError(sampahRes.message ?? 'Gagal memuat monitoring.');
      setSampah(null);
    } else {
      setSampah(sampahRes.data ?? null);
    }

    if (!todayRes.success) {
      setTodayTransaksiCount(0);
      setTodayTotalBeratKg(0);
    } else {
      const rows: TransaksiSummary[] = todayRes.data ?? [];
      setTodayTransaksiCount(rows.length);
      const totalBerat = rows.reduce<number>(
        (acc, r) => acc + safeNumber((r as any)?.beratsampah),
        0,
      );
      setTodayTotalBeratKg(totalBerat);
    }
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

  const totalNasabah = safeNumber(sampah?.totalNasabah);
  const totalTabungan = safeNumber(sampah?.totalHargaKeseluruhan);

  const availableMonths = React.useMemo(() => {
    const berat = getAvailableMonths(sampah?.beratPerKategoriByMonthYear);
    if (berat.length > 0) {
      return berat;
    }
    return getAvailableMonths(sampah?.emisiKarbonPerKategoriByMonthYear);
  }, [sampah]);

  const yearOptions = React.useMemo(() => {
    const years = getUniqueYears(availableMonths);
    if (years.length > 0) {
      return years;
    }
    // fallback: show a small recent range
    return [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];
  }, [availableMonths, now]);

  const monthOptionsForYear = React.useMemo(() => {
    const monthsInYear = getMonthsForYear(availableMonths, filterYear);
    return monthsInYear.length > 0
      ? monthsInYear
      : Array.from({length: 12}, (_, i) => i + 1);
  }, [availableMonths, filterYear]);

  React.useEffect(() => {
    if (availableMonths.length === 0) {
      return;
    }

    const hasPeriod = availableMonths.some(
      m => m.year === filterYear && m.month === filterMonth,
    );
    if (hasPeriod) {
      return;
    }

    const monthsInYear = getMonthsForYear(availableMonths, filterYear);
    if (monthsInYear.length > 0) {
      setFilterMonth(monthsInYear[monthsInYear.length - 1]);
      return;
    }

    const last = availableMonths[availableMonths.length - 1];
    if (last) {
      setFilterYear(last.year);
      setFilterMonth(last.month);
    }
  }, [availableMonths, filterMonth, filterYear]);

  const selectedMonthLabel = `${monthNameId(filterMonth)}`;
  const periodLabel = `${selectedMonthLabel} ${filterYear}`;

  const beratAgg = sampah?.beratPerKategoriByMonthYear
    ? sumMonthTotals(
        sampah.beratPerKategoriByMonthYear,
        filterYear,
        filterMonth,
      )
    : {total: 0, byCategory: {}};

  const emisiAgg = sampah?.emisiKarbonPerKategoriByMonthYear
    ? sumMonthTotals(
        sampah.emisiKarbonPerKategoriByMonthYear,
        filterYear,
        filterMonth,
      )
    : {total: 0, byCategory: {}};

  const yearSeries = React.useMemo(
    () =>
      buildYearSeries(
        sampah?.beratPerKategoriByMonthYear,
        sampah?.emisiKarbonPerKategoriByMonthYear,
        filterYear,
      ),
    [filterYear, sampah],
  );

  const toggleDropdown = (target: 'year' | 'month') => {
    setOpenDropdown(prev => (prev === target ? null : target));
  };

  const onSelectYear = (year: number) => {
    setFilterYear(year);
    setOpenDropdown(null);
  };

  const onSelectMonth = (month: number) => {
    setFilterMonth(month);
    setOpenDropdown(null);
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat monitoring…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.scrollContent}>
      {error ? <InlineAlert message={error} /> : null}

      <SectionTitle
        title="Monitoring Bank Sampah BSU Mobile"
        subtitle={
          user?.nama
            ? `Periode: ${periodLabel} • ${user.nama}`
            : `Periode: ${periodLabel}`
        }
      />

      <Card style={styles.heroCard}>
        <Text style={styles.heroTitle}>Ringkasan Hari Ini</Text>
        <View style={styles.heroKpis}>
          <View style={styles.heroKpi}>
            <Text style={styles.heroKpiNumber}>{todayTransaksiCount}</Text>
            <Text style={styles.heroKpiLabel}>Transaksi</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroKpi}>
            <Text style={styles.heroKpiNumber}>
              {safeNumber(todayTotalBeratKg).toFixed(1)}
            </Text>
            <Text style={styles.heroKpiLabel}>Kg masuk</Text>
          </View>
        </View>
      </Card>

      <View style={styles.topActions}>
        <AppButton
          title="Leaderboard Nasabah"
          variant="secondary"
          onPress={() => navigation.navigate('BsuNasabahLeaderboard')}
        />
      </View>

      <View style={styles.filtersRow}>
        <Pressable
          onPress={() => toggleDropdown('year')}
          style={[
            styles.filterBtn,
            openDropdown === 'year' ? styles.filterBtnOpen : null,
          ]}>
          <Text style={styles.filterLabel}>Tahun:</Text>
          <Text style={styles.filterValue}>{filterYear}</Text>
        </Pressable>
        <Pressable
          onPress={() => toggleDropdown('month')}
          style={[
            styles.filterBtn,
            openDropdown === 'month' ? styles.filterBtnOpen : null,
          ]}>
          <Text style={styles.filterLabel}>Bulan:</Text>
          <Text style={styles.filterValue}>{selectedMonthLabel}</Text>
        </Pressable>
      </View>

      {openDropdown === 'year' ? (
        <Card style={styles.dropdownCard}>
          <View style={styles.dropdownList}>
            {yearOptions.map(y => (
              <Pressable
                key={y}
                onPress={() => onSelectYear(y)}
                style={[
                  styles.dropdownRow,
                  y === filterYear ? styles.dropdownRowSelected : null,
                ]}>
                <Text
                  style={[
                    styles.dropdownRowText,
                    y === filterYear ? styles.dropdownRowTextSelected : null,
                  ]}>
                  {y}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}

      {openDropdown === 'month' ? (
        <Card style={styles.dropdownCard}>
          <View style={styles.dropdownList}>
            {monthOptionsForYear.map(m => (
              <Pressable
                key={m}
                onPress={() => onSelectMonth(m)}
                style={[
                  styles.dropdownRow,
                  m === filterMonth ? styles.dropdownRowSelected : null,
                ]}>
                <Text
                  style={[
                    styles.dropdownRowText,
                    m === filterMonth ? styles.dropdownRowTextSelected : null,
                  ]}>
                  {monthNameId(m)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}

      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, styles.statCardHalf]}>
          <Text style={styles.statTitle}>Total Nasabah</Text>
          <Text style={styles.statValue}>{totalNasabah} Orang</Text>
        </Card>
        <Card style={[styles.statCard, styles.statCardHalf]}>
          <Text style={styles.statTitle}>Total Tabungan</Text>
          <Text style={styles.statValue}>Rp {formatMoney(totalTabungan)}</Text>
        </Card>
        <Card style={[styles.statCard, styles.statCardHalf]}>
          <Text style={styles.statTitle}>Total Sampah Terkumpul</Text>
          <Text style={styles.statValue}>{formatWeightKg(beratAgg.total)}</Text>
        </Card>
        <Card style={[styles.statCard, styles.statCardHalf]}>
          <Text style={styles.statTitle}>Total Emisi Karbon</Text>
          <Text style={styles.statValue}>{formatCarbonKg(emisiAgg.total)}</Text>
        </Card>
      </View>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>
          Grafik Produksi Sampah dan Emisi Karbon
        </Text>
        {yearSeries.length === 0 ? (
          <Text style={styles.emptyText}>Data grafik belum tersedia.</Text>
        ) : (
          <GroupedBarChart
            titleLeft="Berat (kg)"
            titleRight="Emisi (kg CO2-eq)"
            points={yearSeries}
          />
        )}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>
          Statistik Data Sampah per Kategori
        </Text>
        <View style={styles.categoryGrid}>
          {categories.map(kategori => {
            const value = safeNumber(beratAgg.byCategory[kategori]);
            return (
              <Card
                key={kategori}
                style={[styles.categoryCard, styles.statCardHalf]}>
                <Text style={styles.categoryTitle}>{kategori}</Text>
                <Text style={styles.categoryValue}>
                  {formatWeightKg(value)}
                </Text>
              </Card>
            );
          })}
        </View>
      </Card>
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
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
  },
  heroTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: '900',
    color: theme.colors.onPrimary,
    opacity: 0.95,
  },
  heroKpis: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroKpi: {
    flex: 1,
    alignItems: 'center',
  },
  heroDivider: {
    width: 1,
    height: 44,
    backgroundColor: theme.colors.onPrimaryDivider,
  },
  heroKpiNumber: {
    fontSize: theme.fontSize.display,
    fontWeight: '900',
    color: theme.colors.onPrimary,
  },
  heroKpiLabel: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    fontWeight: '800',
    color: theme.colors.onPrimary,
    opacity: 0.9,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  topActions: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: theme.spacing.md,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
  },
  filterBtnOpen: {
    borderColor: theme.colors.primary,
  },
  filterLabel: {
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  filterValue: {
    fontWeight: '800',
    color: theme.colors.muted,
  },
  dropdownCard: {
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  dropdownList: {
    flexDirection: 'column',
  },
  dropdownRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
  },
  dropdownRowSelected: {
    backgroundColor: theme.colors.primarySoft,
  },
  dropdownRowText: {
    fontWeight: '800',
    color: theme.colors.foreground,
  },
  dropdownRowTextSelected: {
    color: theme.colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    marginBottom: 0,
  },
  statCardHalf: {
    width: '48%',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  statValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  sectionCard: {
    marginTop: theme.spacing.md,
  },
  sectionCardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.muted,
    fontWeight: '700',
  },
  chartWrapper: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    padding: theme.spacing.md,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  categoryValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
});
