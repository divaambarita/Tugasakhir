import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {getPenarikanByBsu, type PenarikanRow} from '../../api/penarikan';
import type {BsuFinanceStackParamList} from '../../navigation/stacks/BsuFinanceStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';
import {isoToJakartaYmd} from '../../utils/date';

type Nav = NativeStackNavigationProp<BsuFinanceStackParamList>;

type Row = {
  key: string;
  tanggal: string;
  namaNasabah: string;
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
    namaNasabah: (p.nasabah?.nama ?? `#${p.nasabahId}`) as string,
    metode: String(p.metodePembayaran ?? ''),
    total: safeNumber(p.totalPenarikan),
    status: String(p.statusKonfirmasi ?? 'Diproses'),
  };
}

export function BsuPenarikanListScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const hasLoadedOnce = React.useRef(false);

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const bsuId = Number(user.idAkun);
    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      setItems([]);
      return;
    }

    const res = await getPenarikanByBsu(user.token, bsuId);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat penarikan.');
      setItems([]);
      return;
    }

    setItems((res.data ?? []).map(mapRow));
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

      <View style={styles.actions}>
        <AppButton
          title="Konfirmasi Penarikan"
          variant="secondary"
          onPress={() => navigation.navigate('BsuPenarikanRequests')}
        />
        <AppButton
          title="Proses Penarikan"
          onPress={() => navigation.navigate('BsuPenarikanCreate')}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <Card style={styles.rowCard}>
            <Text style={styles.rowTitle}>{item.tanggal}</Text>
            <Text style={styles.rowSubtitle}>{item.namaNasabah}</Text>
            <Text style={styles.rowSubtitle}>Metode: {item.metode}</Text>
            <Text style={styles.rowSubtitle}>Status: {item.status}</Text>
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
  actions: {
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
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
  rowAmount: {
    marginTop: theme.spacing.sm,
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
