import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';

import {useAuth} from '../../auth/AuthContext';
import {getNasabahByBsu, type NasabahBsu} from '../../api/nasabah';
import type {AdminBsuStackParamList} from '../../navigation/stacks/AdminBsuStackNavigator';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type R = RouteProp<AdminBsuStackParamList, 'AdminBsuNasabahList'>;

type Row = {
  key: string;
  title: string;
  subtitle: string;
};

function toRow(item: NasabahBsu): Row {
  const title = item.nama?.trim() ? item.nama : `Nasabah #${item.idNasabah}`;
  const nomor = item.nomorNasabah?.trim() ? item.nomorNasabah : '-';
  const noTelp = item.noTelp?.trim() ? item.noTelp : '-';

  return {
    key: String(item.idNasabah),
    title,
    subtitle: `${nomor} • ${noTelp}`,
  };
}

export function AdminBsuNasabahListScreen(): React.JSX.Element {
  const route = useRoute<R>();
  const {user} = useAuth();

  const idBsu = route.params.idBsu;

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const res = await getNasabahByBsu(user.token, idBsu);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat daftar nasabah.');
      setRows([]);
      return;
    }

    setRows((res.data ?? []).map(toRow));
  }, [idBsu, user]);

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
          <Text style={styles.centerText}>Memuat daftar nasabah…</Text>
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
        renderItem={({item}) => (
          <Card style={styles.rowCard}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada nasabah di BSU ini.</Text>
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
