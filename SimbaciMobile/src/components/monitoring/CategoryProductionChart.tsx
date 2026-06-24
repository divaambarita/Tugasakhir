import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Text as SvgText} from 'react-native-svg';

import {theme} from '../ui/theme';

export const WASTE_CATEGORIES = [
  'Limbah B3',
  'Sampah Organik (Mudah Terurai)',
  'Sampah Anorganik (Plastik)',
  'Sampah Anorganik (Kertas)',
  'Sampah Anorganik (Logam)',
  'Sampah Anorganik (Kaca)',
  'Sampah Anorganik (Karet)',
  'Sampah Anorganik (Tekstil)',
] as const;

type WasteCategory = (typeof WASTE_CATEGORIES)[number];

const CATEGORY_COLORS: Record<WasteCategory, string> = {
  'Limbah B3': '#EF4444',
  'Sampah Organik (Mudah Terurai)': '#22C55E',
  'Sampah Anorganik (Plastik)': '#EAB308',
  'Sampah Anorganik (Kertas)': '#14B8A6',
  'Sampah Anorganik (Logam)': '#8B5CF6',
  'Sampah Anorganik (Kaca)': '#F97316',
  'Sampah Anorganik (Karet)': '#64748B',
  'Sampah Anorganik (Tekstil)': '#EC4899',
};

export const PIE_COLORS = [
  '#064E3B',
  '#059669',
  '#14B8A6',
  '#2563EB',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#EAB308',
  '#64748B',
  '#EF4444',
  '#0EA5E9',
  '#84CC16',
] as const;

export type PieSlice = {
  label: string;
  value: number;
  color: string;
};

export type CategoryMonthPoint = {
  label: string;
  byCategory: Record<string, number>;
};

function safeNumber(input: unknown): number {
  const value = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(value) ? value : 0;
}

export function MonitoringPieChart({
  slices,
  totalText,
}: {
  slices: PieSlice[];
  totalText: string;
}): React.JSX.Element {
  const activeSlices = slices.filter(slice => safeNumber(slice.value) > 0);
  const total = activeSlices.reduce(
    (sum, slice) => sum + safeNumber(slice.value),
    0,
  );
  const size = 220;
  const center = size / 2;
  const radius = 72;
  const strokeWidth = 36;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={theme.colors.surfaceVariant}
          strokeWidth={strokeWidth}
        />
        {activeSlices.map(slice => {
          const segmentLength = (slice.value / total) * circumference;
          const dashOffset = -offset;
          offset += segmentLength;
          return (
            <Circle
              key={slice.label}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${
                circumference - segmentLength
              }`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          );
        })}
        <SvgText
          x={center}
          y={center - 5}
          textAnchor="middle"
          fontSize={12}
          fontWeight="700"
          fill={theme.colors.muted}>
          Total
        </SvgText>
        <SvgText
          x={center}
          y={center + 17}
          textAnchor="middle"
          fontSize={14}
          fontWeight="900"
          fill={theme.colors.foreground}>
          {totalText}
        </SvgText>
      </Svg>

      <View style={styles.legend}>
        {activeSlices.map(slice => {
          const percentage = total > 0 ? (slice.value / total) * 100 : 0;
          return (
            <View key={slice.label} style={styles.legendItem}>
              <View
                style={[styles.legendDot, {backgroundColor: slice.color}]}
              />
              <View style={styles.legendCopy}>
                <Text style={styles.legendText}>{slice.label}</Text>
                <Text style={styles.legendValue}>
                  {slice.value.toLocaleString('id-ID')} ({percentage.toFixed(1)}
                  %)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function CategoryProductionChart({
  points,
}: {
  points: CategoryMonthPoint[];
}): React.JSX.Element {
  const slices = WASTE_CATEGORIES.map(category => ({
    label: category,
    value: points.reduce(
      (total, point) => total + safeNumber(point.byCategory[category]),
      0,
    ),
    color: CATEGORY_COLORS[category],
  }));
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <MonitoringPieChart
      slices={slices}
      totalText={`${total.toLocaleString('id-ID')} kg`}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  legend: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    marginTop: 3,
    borderRadius: 6,
  },
  legendCopy: {
    flex: 1,
  },
  legendText: {
    color: theme.colors.foreground,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  legendValue: {
    marginTop: 2,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
});
