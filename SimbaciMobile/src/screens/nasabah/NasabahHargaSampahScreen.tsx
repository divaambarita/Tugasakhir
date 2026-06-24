import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {useAuth} from '../../auth/AuthContext';
import {getNasabahDetail} from '../../api/nasabah';
import {getJenisSampahData, type JenisSampahRow} from '../../api/jenisSampah';

import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';

function safeNumber(input: unknown): number {
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number): string {
  return Number(n ?? 0).toLocaleString('id-ID');
}

function getHarga(row: JenisSampahRow): number {
  const bsu = safeNumber(row.hargasampahbsu);
  if (bsu > 0) {
    return bsu;
  }
  return safeNumber(row.hargasampahbsi);
}

export function NasabahHargaSampahScreen(): React.JSX.Element {
  const {user} = useAuth();

  const hasLoadedOnce = React.useRef(false);

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [bsuName, setBsuName] = React.useState<string>('');
  const [rows, setRows] = React.useState<JenisSampahRow[]>([]);

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
      setRows([]);
      return;
    }

    const nasabahRes = await getNasabahDetail(user.token, nasabahId);
    if (!nasabahRes.success) {
      setError(nasabahRes.message ?? 'Gagal memuat data nasabah.');
      setRows([]);
      return;
    }

    const bsuId = Number((nasabahRes.data as any)?.bsuId);
    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('BSU tidak ditemukan pada data nasabah.');
      setRows([]);
      return;
    }

    const bsuNama = String((nasabahRes.data as any)?.bsu?.nama ?? '');
    setBsuName(bsuNama);

    const jenisRes = await getJenisSampahData(user.token, bsuId);
    if (!jenisRes.success) {
      setError(jenisRes.message ?? 'Gagal memuat katalog harga.');
      setRows([]);
      return;
    }

    const list = (jenisRes.data?.bsu ?? []).slice();
    list.sort((a, b) => a.nama.localeCompare(b.nama));
    setRows(list);
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
          <Text style={styles.centerText}>Memuat katalog harga…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <SectionTitle
          title="Harga Sampah"
          subtitle={
            bsuName ? `Acuan harga dari ${bsuName}` : 'Acuan harga dari BSU'
          }
        />

        {rows.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>Belum ada harga</Text>
            <Text style={styles.emptyDesc}>
              Harga sampah belum diatur oleh BSU/BSI.
            </Text>
          </Card>
        ) : (
          rows.map(r => {
            const harga = getHarga(r);
            return (
              <Card key={r.idJenisSampah} style={styles.card}>
                <View style={styles.rowTop}>
                  <View style={styles.rowTopText}>
                    <Text style={styles.cardTitle}>{r.nama}</Text>
                    <Text style={styles.category}>{r.kategori}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      Rp {formatMoney(harga)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.hint}>
                  Harga per kg (acuan sebelum menyetor)
                </Text>
              </Card>
            );
          })
        )}
      </ScrollView>
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
  cardTitle: {
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  category: {
    marginTop: 2,
    color: theme.colors.muted,
    fontWeight: '700',
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.successOutline,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.onPrimaryContainer,
  },
  hint: {
    marginTop: theme.spacing.sm,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  emptyDesc: {
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
