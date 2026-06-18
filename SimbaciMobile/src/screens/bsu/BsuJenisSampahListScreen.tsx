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
import type {BsuHomeStackParamList} from '../../navigation/stacks/BsuHomeStackNavigator';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<BsuHomeStackParamList>;

type Row = {
  key: string;
  idJenisSampah: number;
  nama: string;
  kategori: string;
  hargaBsi: number | null;
  hargaBsu: number | null;
};

function toNumber(input: unknown): number | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : null;
}

function formatMoneyLike(input: number | null): string {
  if (input === null) {
    return '-';
  }
  return input.toLocaleString('id-ID');
}

export function BsuJenisSampahListScreen(): React.JSX.Element {
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

    const [allRes, bsuRes] = await Promise.all([
      getJenisSampahData(user.token, 0),
      getJenisSampahData(user.token, bsuId),
    ]);

    if (!allRes.success) {
      setError(allRes.message ?? 'Gagal memuat jenis sampah.');
      setItems([]);
      return;
    }
    if (!bsuRes.success) {
      setError(bsuRes.message ?? 'Gagal memuat harga BSU.');
      setItems([]);
      return;
    }

    const all = allRes.data?.bsi ?? [];
    const bsu = bsuRes.data?.bsu ?? [];

    const mapBsuHarga = new Map<number, number | null>();
    for (const r of bsu) {
      mapBsuHarga.set(r.idJenisSampah, toNumber(r.hargasampahbsu));
    }

    const merged: Row[] = all.map((r: JenisSampahRow) => ({
      key: String(r.idJenisSampah),
      idJenisSampah: r.idJenisSampah,
      nama: r.nama,
      kategori: r.kategori,
      hargaBsi: toNumber(r.hargasampahbsi),
      hargaBsu: mapBsuHarga.get(r.idJenisSampah) ?? null,
    }));

    merged.sort((a, b) => {
      const aHas = a.hargaBsu !== null;
      const bHas = b.hargaBsu !== null;
      if (aHas !== bHas) {
        return aHas ? -1 : 1;
      }
      return a.nama.localeCompare(b.nama);
    });

    setItems(merged);
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
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() =>
              navigation.navigate('BsuJenisSampahDetail', {
                idJenisSampah: item.idJenisSampah,
                nama: item.nama,
                kategori: item.kategori,
                hargaBsi: item.hargaBsi,
                hargaBsu: item.hargaBsu,
              })
            }
            style={({pressed}) => [pressed ? styles.pressed : null]}>
            <Card style={styles.rowCard}>
              <Text style={styles.rowTitle}>{item.nama}</Text>
              <Text style={styles.rowSubtitle}>{item.kategori}</Text>
              <Text style={styles.rowMeta}>
                Harga BSI: {formatMoneyLike(item.hargaBsi)} • Harga BSU:{' '}
                {formatMoneyLike(item.hargaBsu)}
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
    fontWeight: '700',
  },
  rowMeta: {
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
