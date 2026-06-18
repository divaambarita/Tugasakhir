import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Svg, {G, Line, Rect, Text as SvgText} from 'react-native-svg';

import {useAuth} from '../../auth/AuthContext';
import {
  getNasabahSampahMonitoring,
  type NasabahSampahMonitoring,
} from '../../api/monitoring';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';

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

type AggMap = Record<
  string,
  {totalKeseluruhan: number; [kategori: string]: number}
>;

function safeNumber(input: unknown): number {
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : 0;
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

function getUniqueYears(months: MonthKey[]): number[] {
  const uniq = new Set<number>();
  for (const m of months) {
    uniq.add(m.year);
  }
  return Array.from(uniq).sort((a, b) => b - a);
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
  beratMap: NasabahSampahMonitoring['beratPerKategoriByMonthYear'] | undefined,
  emisiMap:
    | NasabahSampahMonitoring['emisiKarbonPerKategoriByMonthYear']
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
  const barW = Math.max(6, Math.min(18, groupW * 0.28));
  const gap = Math.max(4, barW * 0.55);

  const yTicks = 4;
  const axisColor = theme.colors.border;

  const yFor = (val: number) =>
    paddingTop + chartH - (safeNumber(val) / maxValue) * chartH;

  return (
    <View style={styles.chartWrap}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <G>
          <SvgText
            x={paddingLeft}
            y={24}
            fontSize={12}
            fontWeight="700"
            fill={theme.colors.muted}>
            {titleLeft}
          </SvgText>
          <SvgText
            x={width - 20}
            y={24}
            fontSize={12}
            fontWeight="700"
            textAnchor="end"
            fill={theme.colors.muted}>
            {titleRight}
          </SvgText>

          {Array.from({length: yTicks + 1}).map((_, i) => {
            const t = i / yTicks;
            const y = paddingTop + chartH - t * chartH;
            return (
              <Line
                key={i}
                x1={paddingLeft}
                y1={y}
                x2={width - 20}
                y2={y}
                stroke={axisColor}
                strokeWidth={1}
              />
            );
          })}

          {points.map((p, idx) => {
            const baseX = paddingLeft + idx * groupW + groupW / 2;
            const beratH = (safeNumber(p.beratKg) / maxValue) * chartH;
            const emisiH = (safeNumber(p.emisiKg) / maxValue) * chartH;

            return (
              <G key={p.label}>
                <Rect
                  x={baseX - gap / 2 - barW}
                  y={paddingTop + chartH - beratH}
                  width={barW}
                  height={Math.max(0, beratH)}
                  fill={theme.colors.primary}
                  rx={3}
                />
                <Rect
                  x={baseX + gap / 2}
                  y={paddingTop + chartH - emisiH}
                  width={barW}
                  height={Math.max(0, emisiH)}
                  fill={theme.colors.destructive}
                  rx={3}
                />
                <SvgText
                  x={baseX}
                  y={paddingTop + chartH + 18}
                  fontSize={11}
                  fontWeight="700"
                  fill={theme.colors.muted}
                  textAnchor="middle">
                  {p.label}
                </SvgText>
              </G>
            );
          })}

          <Line
            x1={paddingLeft}
            y1={paddingTop + chartH}
            x2={width - 20}
            y2={paddingTop + chartH}
            stroke={axisColor}
            strokeWidth={1.2}
          />

          <Line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + chartH}
            stroke={axisColor}
            strokeWidth={1.2}
          />

          <SvgText
            x={paddingLeft}
            y={height - 8}
            fontSize={12}
            fontWeight="800"
            fill={theme.colors.primary}>
            Berat
          </SvgText>
          <SvgText
            x={paddingLeft + 62}
            y={height - 8}
            fontSize={12}
            fontWeight="800"
            fill={theme.colors.destructive}>
            Emisi
          </SvgText>

          <SvgText
            x={width - 20}
            y={paddingTop + 14}
            fontSize={10}
            fill={theme.colors.muted}
            textAnchor="end">
            {maxValue.toFixed(0)}
          </SvgText>
          <SvgText
            x={width - 20}
            y={paddingTop + chartH + 14}
            fontSize={10}
            fill={theme.colors.muted}
            textAnchor="end">
            0
          </SvgText>

          <Line
            x1={width - 20}
            y1={yFor(maxValue)}
            x2={width - 16}
            y2={yFor(maxValue)}
            stroke={axisColor}
            strokeWidth={1}
          />
          <Line
            x1={width - 20}
            y1={yFor(0)}
            x2={width - 16}
            y2={yFor(0)}
            stroke={axisColor}
            strokeWidth={1}
          />
        </G>
      </Svg>
    </View>
  );
}

function getCategoryValue(
  byCategory: Record<string, number>,
  displayName: string,
): number {
  const name = displayName.toLowerCase();
  if (name.includes('plastik')) {
    return safeNumber(byCategory.plastik);
  }
  if (name.includes('kertas')) {
    return safeNumber(byCategory.kertas);
  }
  if (name.includes('logam')) {
    return safeNumber(byCategory.logam);
  }
  if (name.includes('kaca')) {
    return safeNumber(byCategory.kaca);
  }
  if (name.includes('karet')) {
    return safeNumber(byCategory.karet);
  }
  if (name.includes('tekstil')) {
    return safeNumber(byCategory.tekstil);
  }
  if (name.includes('organik')) {
    return safeNumber(byCategory.organik);
  }
  if (name.includes('b3')) {
    return safeNumber(byCategory.b3);
  }
  return 0;
}

export function NasabahMonitoringScreen(): React.JSX.Element {
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sampah, setSampah] = React.useState<NasabahSampahMonitoring | null>(
    null,
  );

  const [openDropdown, setOpenDropdown] = React.useState<
    'year' | 'month' | null
  >(null);

  const availableMonths = React.useMemo(() => {
    const berat = getAvailableMonths(sampah?.beratPerKategoriByMonthYear);
    const emisi = getAvailableMonths(sampah?.emisiKarbonPerKategoriByMonthYear);
    const merged = new Map<string, MonthKey>();
    for (const m of [...berat, ...emisi]) {
      merged.set(`${m.year}-${m.month}`, m);
    }
    const result = Array.from(merged.values());
    result.sort((a, b) => (a.year - b.year) * 100 + (a.month - b.month));
    return result;
  }, [sampah]);

  const yearOptions = React.useMemo(
    () => getUniqueYears(availableMonths),
    [availableMonths],
  );

  const defaultYear = yearOptions[0] ?? new Date().getFullYear();

  const [filterYear, setFilterYear] = React.useState<number>(defaultYear);
  const [filterMonth, setFilterMonth] = React.useState<number>(() => {
    const forYear = availableMonths.filter(m => m.year === defaultYear);
    return forYear.length ? forYear[forYear.length - 1].month : 1;
  });

  React.useEffect(() => {
    if (yearOptions.length === 0) {
      return;
    }
    setFilterYear(prev => (yearOptions.includes(prev) ? prev : yearOptions[0]));
  }, [yearOptions]);

  React.useEffect(() => {
    const monthsForYear = availableMonths
      .filter(m => m.year === filterYear)
      .map(m => m.month);
    if (monthsForYear.length === 0) {
      setFilterMonth(1);
      return;
    }
    if (!monthsForYear.includes(filterMonth)) {
      setFilterMonth(monthsForYear[monthsForYear.length - 1]);
    }
  }, [availableMonths, filterMonth, filterYear]);

  const monthOptionsForYear = React.useMemo(() => {
    const uniq = new Set<number>();
    for (const m of availableMonths) {
      if (m.year === filterYear) {
        uniq.add(m.month);
      }
    }
    return Array.from(uniq).sort((a, b) => a - b);
  }, [availableMonths, filterYear]);

  const selectedMonthLabel = React.useMemo(() => {
    if (!filterMonth) {
      return '-';
    }
    return monthNameId(filterMonth);
  }, [filterMonth]);

  const periodLabel = React.useMemo(() => {
    return `${monthNameId(filterMonth)} ${filterYear}`;
  }, [filterMonth, filterYear]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const nasabahId = Number(user.idAkun);
    if (!Number.isFinite(nasabahId) || nasabahId <= 0) {
      setError('ID Nasabah tidak valid. Silakan login ulang.');
      setSampah(null);
      return;
    }

    const res = await getNasabahSampahMonitoring(user.token, nasabahId);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat monitoring.');
      setSampah(null);
      return;
    }

    setSampah(res.data ?? null);
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

  const beratMap = sampah?.beratPerKategoriByMonthYear as AggMap | undefined;
  const emisiMap = sampah?.emisiKarbonPerKategoriByMonthYear as
    | AggMap
    | undefined;

  const beratAgg = beratMap
    ? sumMonthTotals(beratMap, filterYear, filterMonth)
    : {total: 0, byCategory: {}};

  const emisiAgg = emisiMap
    ? sumMonthTotals(emisiMap, filterYear, filterMonth)
    : {total: 0, byCategory: {}};

  const yearSeries = React.useMemo(() => {
    return buildYearSeries(
      sampah?.beratPerKategoriByMonthYear,
      sampah?.emisiKarbonPerKategoriByMonthYear,
      filterYear,
    );
  }, [filterYear, sampah]);

  const toggleDropdown = (which: 'year' | 'month') => {
    setOpenDropdown(prev => (prev === which ? null : which));
  };

  const onSelectYear = (y: number) => {
    setFilterYear(y);
    setOpenDropdown(null);
  };

  const onSelectMonth = (m: number) => {
    setFilterMonth(m);
    setOpenDropdown(null);
  };

  if (!user) {
    return (
      <Screen>
        <InlineAlert message="Silakan login terlebih dahulu." />
      </Screen>
    );
  }

  if (user.roleName !== 'nasabah') {
    return (
      <Screen>
        <InlineAlert message="Akses ditolak. Hanya Nasabah." />
      </Screen>
    );
  }

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
        title="Monitoring Nasabah"
        subtitle={
          user?.nama
            ? `Periode: ${periodLabel} • ${user.nama}`
            : `Periode: ${periodLabel}`
        }
      />

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
          <Text style={styles.statTitle}>Total Sampah</Text>
          <Text style={styles.statValue}>{formatWeightKg(beratAgg.total)}</Text>
        </Card>
        <Card style={[styles.statCard, styles.statCardHalf]}>
          <Text style={styles.statTitle}>Total Emisi Karbon</Text>
          <Text style={styles.statValue}>{formatCarbonKg(emisiAgg.total)}</Text>
        </Card>
      </View>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>
          Grafik Produksi Sampah & Emisi Karbon
        </Text>
        {yearSeries.length === 0 ? (
          <Text style={styles.empty}>Belum ada data grafik.</Text>
        ) : (
          <GroupedBarChart
            titleLeft="Berat (kg)"
            titleRight="Emisi (kg CO2-eq)"
            points={yearSeries}
          />
        )}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>Statistik per Kategori</Text>

        {categories.map(name => {
          const berat = getCategoryValue(beratAgg.byCategory, name);
          const emisi = getCategoryValue(emisiAgg.byCategory, name);
          return (
            <View key={name} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{name}</Text>
              <Text style={styles.categoryMeta}>
                Berat: {formatWeightKg(berat)}
              </Text>
              <Text style={styles.categoryMeta}>
                Emisi: {formatCarbonKg(emisi)}
              </Text>
            </View>
          );
        })}
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
  scrollContent: {
    paddingBottom: theme.spacing.xl,
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
  },
  dropdownRowSelected: {
    backgroundColor: theme.colors.primary,
  },
  dropdownRowText: {
    fontWeight: '800',
    color: theme.colors.foreground,
  },
  dropdownRowTextSelected: {
    color: theme.colors.onPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  statCard: {
    padding: theme.spacing.md,
  },
  statCardHalf: {
    flexBasis: '48%',
  },
  statTitle: {
    fontWeight: '900',
    color: theme.colors.muted,
  },
  statValue: {
    marginTop: theme.spacing.sm,
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  sectionCard: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  chartWrap: {
    marginTop: theme.spacing.sm,
  },
  categoryRow: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  categoryName: {
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  categoryMeta: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  empty: {
    marginTop: theme.spacing.sm,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
