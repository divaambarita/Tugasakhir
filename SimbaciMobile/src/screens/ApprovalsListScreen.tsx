import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../auth/AuthContext';
import {getApprovals} from '../api/approver';
import type {ApproverRow} from '../api/approver';
import type {ApprovalsStackParamList} from '../navigation/stacks/ApprovalsStackNavigator';
import {Card} from '../components/ui/Card';
import {InlineAlert} from '../components/ui/InlineAlert';
import {Screen} from '../components/ui/Screen';
import {theme} from '../components/ui/theme';

type Nav = NativeStackNavigationProp<ApprovalsStackParamList>;

type Row = {
  key: string;
  title: string;
  subtitle: string;
  idApprover: number;
};

export function ApprovalsListScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [approvals, setApprovals] = React.useState<ApproverRow[]>([]);

  const rows = React.useMemo<Row[]>(
    () =>
      approvals.map(item => ({
        key: String(item.idApprover),
        idApprover: item.idApprover,
        title: item.akun?.nama ?? `BSU #${item.userId}`,
        subtitle: `${item.akun?.noTelp ?? '-'} • Status: ${item.status}`,
      })),
    [approvals],
  );

  const {pendingCount, approvedCount, rejectedCount} = React.useMemo(() => {
    const approved = approvals.filter(a => a.status === 'Approved').length;
    const rejected = approvals.filter(a => a.status === 'Rejected').length;
    const pending = approvals.length - approved - rejected;
    return {
      pendingCount: pending,
      approvedCount: approved,
      rejectedCount: rejected,
    };
  }, [approvals]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const res = await getApprovals(user.token, Number(user.idAkun));
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat data approval');
      setApprovals([]);
      return;
    }

    setApprovals(res.data ?? []);
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

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat approval…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <FlatList
        data={rows}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.statsWrap}>
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Menunggu verifikasi</Text>
                <Text style={styles.statValue}>{pendingCount}</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Terverifikasi</Text>
                <Text style={styles.statValue}>{approvedCount}</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Ditolak</Text>
                <Text style={styles.statValue}>{rejectedCount}</Text>
              </Card>
            </View>
          </View>
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() =>
              navigation.navigate('ApprovalDetail', {
                idApprover: item.idApprover,
              })
            }
            style={({pressed}) => [pressed ? styles.pressed : null]}>
            <Card style={styles.rowCard}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Tidak ada approval. Pastikan verifikasi volunteer sudah diisi.
          </Text>
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
  statsWrap: {
    marginBottom: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
  },
  statLabel: {
    color: theme.colors.muted,
    fontWeight: '800',
    fontSize: 12,
  },
  statValue: {
    marginTop: theme.spacing.xs,
    color: theme.colors.foreground,
    fontWeight: '900',
    fontSize: 20,
  },
  centerText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
  rowCard: {
    marginBottom: theme.spacing.sm,
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
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
