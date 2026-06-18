import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {useAuth} from '../../auth/AuthContext';
import {
  getNasabahLeaderboard,
  type LeaderboardNasabahRow,
} from '../../api/monitoring';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';

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

type Row = LeaderboardNasabahRow & {key: string};

function toRow(item: LeaderboardNasabahRow, idx: number): Row {
  const nomor = item.nomorNasabah?.trim() ? item.nomorNasabah : `#${idx + 1}`;
  const nama = item.nama?.trim() ? item.nama : '-';
  return {
    ...item,
    key: `${nomor}-${idx}`,
    nomorNasabah: nomor,
    nama,
    totalTabungan: safeNumber(item.totalTabungan),
    totalSampah: safeNumber(item.totalSampah),
  };
}

function LeaderboardBody({
  title,
  subtitle,
  fetchRows,
}: {
  title: string;
  subtitle?: string;
  fetchRows: (token: string) => Promise<Row[]>;
}): React.JSX.Element {
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);
    try {
      const next = await fetchRows(user.token);
      setRows(next);
    } catch {
      setError('Gagal memuat leaderboard.');
      setRows([]);
    }
  }, [fetchRows, user]);

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

  if (!user) {
    return (
      <Screen>
        <InlineAlert message="Silakan login terlebih dahulu." />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat leaderboard…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {error ? <InlineAlert message={error} /> : null}

      <SectionTitle title={title} subtitle={subtitle} />

      {rows.length === 0 ? (
        <Text style={styles.empty}>Belum ada data leaderboard.</Text>
      ) : null}

      {rows.map((r, idx) => (
        <Card key={r.key} style={styles.rowCard}>
          <Text style={styles.rowTitle}>
            #{idx + 1} • {r.nama} ({r.nomorNasabah ?? '-'})
          </Text>
          <Text style={styles.rowSubtitle}>
            Total Sampah: {formatWeightKg(r.totalSampah)}
          </Text>
          <Text style={styles.rowSubtitle}>
            Total Tabungan: Rp {formatMoney(r.totalTabungan)}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

export function AdminNasabahLeaderboardScreen(): React.JSX.Element {
  const {user} = useAuth();

  if (!user) {
    return (
      <Screen>
        <InlineAlert message="Silakan login terlebih dahulu." />
      </Screen>
    );
  }

  if (user.roleName !== 'admin') {
    return (
      <Screen>
        <InlineAlert message="Akses ditolak. Hanya Admin." />
      </Screen>
    );
  }

  return (
    <LeaderboardBody
      title="Leaderboard Nasabah"
      subtitle="Urut berdasarkan total sampah"
      fetchRows={async token => {
        const res = await getNasabahLeaderboard(token, undefined);
        if (!res.success) {
          throw new Error(res.message ?? 'Gagal memuat leaderboard.');
        }
        return (res.data ?? []).map(toRow);
      }}
    />
  );
}

export function BsuNasabahLeaderboardScreen(): React.JSX.Element {
  const {user} = useAuth();

  if (!user) {
    return (
      <Screen>
        <InlineAlert message="Silakan login terlebih dahulu." />
      </Screen>
    );
  }

  if (user.roleName !== 'bsu') {
    return (
      <Screen>
        <InlineAlert message="Akses ditolak. Hanya BSU." />
      </Screen>
    );
  }

  const bsuId = Number(user.idAkun);
  if (!Number.isFinite(bsuId) || bsuId <= 0) {
    return (
      <Screen>
        <InlineAlert message="ID BSU tidak valid. Silakan login ulang." />
      </Screen>
    );
  }

  return (
    <LeaderboardBody
      title="Leaderboard Nasabah"
      subtitle="Urut berdasarkan total sampah"
      fetchRows={async token => {
        const res = await getNasabahLeaderboard(token, bsuId);
        if (!res.success) {
          throw new Error(res.message ?? 'Gagal memuat leaderboard.');
        }
        return (res.data ?? []).map(toRow);
      }}
    />
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
    marginTop: theme.spacing.sm,
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
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
