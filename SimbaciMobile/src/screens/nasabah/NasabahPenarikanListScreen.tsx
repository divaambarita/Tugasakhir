import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {useAuth} from '../../auth/AuthContext';
import {getPenarikanByNasabah, type PenarikanRow} from '../../api/penarikan';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';
import {isoToJakartaYmd} from '../../utils/date';

type Row = {
  key: string;
  tanggal: string;
  metode: string;
  total: number;
  status: string;
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

function mapRow(p: PenarikanRow): Row {
  const tanggalIso = String(p.tanggalPenarikan);
  return {
    key: String(p.idPenarikan),
    tanggal: toDateOnly(tanggalIso),
    metode: String(p.metodePembayaran ?? ''),
    total: safeNumber(p.totalPenarikan),
    status: String(p.statusKonfirmasi ?? 'Diproses'),
  };
}

export function NasabahPenarikanListScreen(): React.JSX.Element {
  const {user} = useAuth();

  const hasLoadedOnce = React.useRef(false);

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<Row[]>([]);

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
      setItems([]);
      return;
    }

    const res = await getPenarikanByNasabah(user.token, nasabahId);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat penarikan.');
      setItems([]);
      return;
    }

    setItems((res.data ?? []).map(mapRow));
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
          <Text style={styles.centerText}>Memuat penarikan…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <FlatList
        data={items}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <Card style={styles.rowCard}>
            <View style={styles.rowTop}>
              <View style={styles.rowTopText}>
                <Text style={styles.rowTitle}>{item.tanggal}</Text>
                <Text style={styles.rowSubtitle}>Metode: {item.metode}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  item.status === 'Berhasil'
                    ? styles.badgeDone
                    : item.status === 'Ditolak'
                    ? styles.badgeReject
                    : styles.badgeProcess,
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    item.status === 'Berhasil'
                      ? styles.badgeTextDone
                      : item.status === 'Ditolak'
                      ? styles.badgeTextReject
                      : styles.badgeTextProcess,
                  ]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.rowAmount}>Rp {formatMoney(item.total)}</Text>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada data penarikan.</Text>
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
  rowAmount: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xxl,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeDone: {
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.successOutline,
  },
  badgeProcess: {
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: theme.colors.outline,
  },
  badgeReject: {
    backgroundColor: theme.colors.errorContainer,
    borderColor: theme.colors.errorOutline,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  badgeTextDone: {
    color: theme.colors.onPrimaryContainer,
  },
  badgeTextProcess: {
    color: theme.colors.onSurface,
  },
  badgeTextReject: {
    color: theme.colors.destructive,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
