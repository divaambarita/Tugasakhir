import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {getBsuAdminDetail} from '../../api/bsu';
import type {BsuFinanceStackParamList} from '../../navigation/stacks/BsuFinanceStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<BsuFinanceStackParamList>;

type Item = {
  key: string;
  title: string;
  value: string;
};

function safeNumber(input: unknown): number {
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number): string {
  return Number(n ?? 0).toLocaleString('id-ID');
}

export function BsuSaldoScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const hasLoadedOnce = React.useRef(false);

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saldo, setSaldo] = React.useState<number>(0);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const bsuId = Number(user.idAkun);
    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      setSaldo(0);
      return;
    }

    const res = await getBsuAdminDetail(user.token, bsuId);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat saldo.');
      setSaldo(0);
      return;
    }

    const s = safeNumber((res.data as any)?.saldo);
    setSaldo(s);
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
          <Text style={styles.centerText}>Memuat saldo…</Text>
        </View>
      </Screen>
    );
  }

  const items: Item[] = [
    {
      key: 'saldo',
      title: 'Saldo BSU',
      value: formatMoney(saldo),
    },
  ];

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
          <Card style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </Card>
        )}
        ListFooterComponent={
          <View style={styles.actions}>
            <AppButton
              title="Riwayat Penarikan"
              onPress={() => navigation.navigate('BsuPenarikanList')}
            />
            <AppButton
              title="Proses Penarikan"
              variant="secondary"
              style={styles.actionSpacing}
              onPress={() => navigation.navigate('BsuPenarikanCreate')}
            />
          </View>
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
  card: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  value: {
    marginTop: theme.spacing.sm,
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  actions: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  actionSpacing: {
    marginTop: theme.spacing.sm,
  },
});
