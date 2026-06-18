import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {getNasabahAdmin, getNasabahByBsu} from '../api/nasabah';
import {useAuth} from '../auth/AuthContext';

type Row = {
  key: string;
  title: string;
  subtitle: string;
  meta?: string;
};

export function NasabahListScreen(): React.JSX.Element {
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

    const token = user.token;

    if (user.roleName === 'admin') {
      const res = await getNasabahAdmin(token);
      if (!res.success) {
        setError(res.message ?? 'Gagal memuat nasabah');
        setRows([]);
        return;
      }

      setRows(
        res.data.map(n => ({
          key: String(n.idNasabah),
          title: n.nama,
          subtitle: `${n.noTelp} • ${n.nomorNasabah}`,
          meta: `Saldo: ${Number(n.saldo ?? 0).toLocaleString('id-ID')} • Tx: ${
            n.totalTransaksi
          }`,
        })),
      );
      return;
    }

    if (user.roleName === 'bsu') {
      const idBsu = Number(user.idAkun);
      if (!Number.isFinite(idBsu) || idBsu <= 0) {
        setError('ID BSU tidak valid. Silakan login ulang.');
        setRows([]);
        return;
      }

      const res = await getNasabahByBsu(token, idBsu);
      if (!res.success) {
        setError(res.message ?? 'Gagal memuat nasabah');
        setRows([]);
        return;
      }

      setRows(
        res.data.map(n => ({
          key: String(n.idNasabah),
          title: n.nama,
          subtitle: `${n.noTelp} • ${n.nomorNasabah}`,
          meta: `Saldo: ${Number(n.saldo ?? 0).toLocaleString('id-ID')}`,
        })),
      );
      return;
    }

    setError('Role ini belum punya akses daftar nasabah.');
    setRows([]);
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
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.centerText}>Memuat nasabah…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={rows}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            {item.meta ? <Text style={styles.rowMeta}>{item.meta}</Text> : null}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Tidak ada data nasabah.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  centerText: {
    marginTop: 12,
    color: '#666',
  },
  error: {
    marginBottom: 12,
    color: '#b00020',
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowSubtitle: {
    marginTop: 4,
    color: '#444',
  },
  rowMeta: {
    marginTop: 4,
    color: '#666',
    fontSize: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
