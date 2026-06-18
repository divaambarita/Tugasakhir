import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useAuth} from '../auth/AuthContext';
import {getVolunteerRiwayat, type VolunteerRiwayatRow} from '../api/volunteer';
import {Card} from '../components/ui/Card';
import {InlineAlert} from '../components/ui/InlineAlert';
import {Screen} from '../components/ui/Screen';
import {SectionTitle} from '../components/ui/SectionTitle';
import {theme} from '../components/ui/theme';

type Row = VolunteerRiwayatRow & {key: string};

export function VolunteerRiwayatScreen(): React.JSX.Element {
  const {user} = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }
    if (user.roleName !== 'volunteer') {
      setError('Akses ditolak. Hanya Volunteer.');
      setRows([]);
      return;
    }

    setError(null);
    const res = await getVolunteerRiwayat(user.token);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat riwayat survey');
      setRows([]);
      return;
    }

    const data = res.data ?? [];
    setRows(
      data.map(item => ({
        ...item,
        key: String(item.idHasilVerifikasi),
      })),
    );
  }, [user]);

  React.useEffect(() => {
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
  }, [load]);

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
        <View style={styles.center}>
          <Text>Silakan login.</Text>
        </View>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat riwayat…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionTitle
        title="Riwayat Survey"
        subtitle="Survey yang pernah Anda submit"
      />

      {error ? <InlineAlert message={error} /> : null}

      <FlatList
        data={rows}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => {
          const bsuName = item.bsu?.nama ?? `BSU #${item.bsuId}`;
          const lokasi = item.bsu?.kecamatan || item.bsu?.kelurahan
            ? `${item.bsu?.kecamatan ?? '-'} / ${item.bsu?.kelurahan ?? '-'}`
            : '-';
          const status = item.bsu?.status ?? '-';
          return (
            <Card style={styles.rowCard}>
              <View style={styles.rowTop}>
                <View style={styles.rowTopText}>
                  <Text style={styles.rowTitle}>{bsuName}</Text>
                  <Text style={styles.rowSubtitle}>{lokasi}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{status}</Text>
                </View>
              </View>
              <Text style={styles.rowMeta}>Lokasi: {item.lokasi}</Text>
              <Text style={styles.rowMeta}>
                Update: {new Date(item.updatedAt).toLocaleString()}
              </Text>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada riwayat survey.</Text>
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
  rowCard: {
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
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.foreground,
  },
  rowSubtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
  },
  rowMeta: {
    marginTop: theme.spacing.xs,
    fontSize: 12,
    color: theme.colors.muted,
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

