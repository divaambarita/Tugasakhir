import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {useAuth} from '../../auth/AuthContext';
import {
  getPenarikanRequestsByBsu,
  type PenarikanRow,
  updatePenarikanStatus,
} from '../../api/penarikan';
import {AppButton} from '../../components/ui/AppButton';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';
import {isoToJakartaYmd} from '../../utils/date';

type Row = {
  key: string;
  idPenarikan: number;
  tanggal: string;
  namaNasabah: string;
  metode: string;
  total: number;
  status: string;
  tanggalKonfirmasi?: string | null;
};

function safeNumber(input: unknown): number {
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number): string {
  return Number(n ?? 0).toLocaleString('id-ID');
}

function toDateOnly(iso: string | null | undefined): string {
  if (!iso) {
    return '-';
  }
  return isoToJakartaYmd(String(iso));
}

function mapRow(p: PenarikanRow): Row {
  const tanggalIso = String(p.tanggalPenarikan);
  return {
    key: String(p.idPenarikan),
    idPenarikan: Number(p.idPenarikan),
    tanggal: toDateOnly(tanggalIso),
    namaNasabah: (p.nasabah?.nama ?? `#${p.nasabahId}`) as string,
    metode: String(p.metodePembayaran ?? ''),
    total: safeNumber(p.totalPenarikan),
    status: String(p.statusKonfirmasi ?? 'Diproses'),
    tanggalKonfirmasi: p.tanggalKonfirmasi ?? null,
  };
}

export function BsuPenarikanRequestListScreen(): React.JSX.Element {
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<Row[]>([]);
  const [updatingId, setUpdatingId] = React.useState<number | null>(null);

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

    const res = await getPenarikanRequestsByBsu(user.token, bsuId);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat permintaan penarikan.');
      setItems([]);
      return;
    }

    setItems((res.data ?? []).map(mapRow));
  }, [user]);

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

  const confirmUpdate = (
    idPenarikan: number,
    statusKonfirmasi: 'Berhasil' | 'Ditolak',
  ) => {
    if (!user) {
      return;
    }

    const label = statusKonfirmasi === 'Berhasil' ? 'Berhasil' : 'Ditolak';
    Alert.alert('Konfirmasi Penarikan', `Set status menjadi "${label}"?`, [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Ya',
        style: statusKonfirmasi === 'Ditolak' ? 'destructive' : 'default',
        onPress: async () => {
          setUpdatingId(idPenarikan);
          setError(null);
          try {
            const res = await updatePenarikanStatus(user.token, idPenarikan, {
              statusKonfirmasi,
            });
            if (!res.success) {
              setError(res.message ?? 'Gagal mengubah status penarikan.');
              return;
            }

            Alert.alert('Berhasil', 'Status penarikan berhasil diperbarui.');
            await load();
          } finally {
            setUpdatingId(null);
          }
        },
      },
    ]);
  };

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

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat permintaan penarikan…</Text>
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
        renderItem={({item}) => {
          const isDiproses = item.status === 'Diproses' || !item.status;
          const busy = updatingId === item.idPenarikan;

          return (
            <Card style={styles.rowCard}>
              <Text style={styles.rowTitle}>{item.tanggal}</Text>
              <Text style={styles.rowSubtitle}>{item.namaNasabah}</Text>
              <Text style={styles.rowSubtitle}>Metode: {item.metode}</Text>
              <Text style={styles.rowSubtitle}>Status: {item.status}</Text>
              {item.tanggalKonfirmasi ? (
                <Text style={styles.rowSubtitle}>
                  Tgl Konfirmasi: {toDateOnly(item.tanggalKonfirmasi)}
                </Text>
              ) : null}
              <Text style={styles.rowAmount}>Rp {formatMoney(item.total)}</Text>

              {isDiproses ? (
                <View style={styles.actionRow}>
                  <AppButton
                    title="Berhasil"
                    onPress={() => confirmUpdate(item.idPenarikan, 'Berhasil')}
                    disabled={busy}
                    loading={busy}
                    style={styles.flexBtn}
                  />
                  <AppButton
                    title="Tolak"
                    variant="destructive"
                    onPress={() => confirmUpdate(item.idPenarikan, 'Ditolak')}
                    disabled={busy}
                    loading={busy}
                    style={styles.flexBtn}
                  />
                </View>
              ) : null}
            </Card>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada permintaan penarikan.</Text>
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
  rowAmount: {
    marginTop: theme.spacing.sm,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
