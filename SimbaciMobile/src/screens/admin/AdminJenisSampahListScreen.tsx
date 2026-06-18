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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {getJenisSampahData, type JenisSampahRow} from '../../api/jenisSampah';
import type {AdminJenisSampahStackParamList} from '../../navigation/stacks/AdminJenisSampahStackNavigator';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<AdminJenisSampahStackParamList>;

function formatMoneyLike(input: unknown): string {
  if (input === null || input === undefined) {
    return '-';
  }
  const n = typeof input === 'string' ? Number(input) : (input as number);
  if (!Number.isFinite(n)) {
    return String(input);
  }
  return n.toLocaleString('id-ID');
}

function toHargaNumber(input: unknown): number | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : null;
}

export function AdminJenisSampahListScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const hasLoadedOnce = React.useRef(false);

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<JenisSampahRow[]>([]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const res = await getJenisSampahData(user.token, Number(user.idAkun));
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat jenis sampah.');
      setItems([]);
      return;
    }

    const bsi = res.data?.bsi ?? [];
    setItems(bsi);
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
          <Text style={styles.centerText}>Memuat jenis sampah…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <FlatList
        data={items}
        keyExtractor={item => String(item.idJenisSampah)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() =>
              navigation.navigate('AdminJenisSampahDetail', {
                idJenisSampah: item.idJenisSampah,
                nama: item.nama,
                kategori: item.kategori,
                hargaBsi: toHargaNumber(item.hargasampahbsi),
              })
            }
            style={({pressed}) => [pressed ? styles.pressed : null]}>
            <Card style={styles.rowCard}>
              <Text style={styles.rowTitle}>{item.nama}</Text>
              <Text style={styles.rowSubtitle}>
                {item.kategori} • Harga BSI:{' '}
                {formatMoneyLike(item.hargasampahbsi)}
              </Text>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada jenis sampah.</Text>
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
  pressed: {
    opacity: 0.85,
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
