import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {
  createTransaksi,
  type CreateTransaksiItem,
  type CreateTransaksiRequest,
} from '../../api/transaksi';
import {getNasabahByBsu, type NasabahBsu} from '../../api/nasabah';
import {getJenisSampahData, type JenisSampahRow} from '../../api/jenisSampah';
import type {BsuHomeStackParamList} from '../../navigation/stacks/BsuHomeStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {EmptyState} from '../../components/ui/EmptyState';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<BsuHomeStackParamList>;

type BeratMap = Record<number, string>;

function toNumber(input: unknown): number | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : null;
}

function formatMoney(n: number): string {
  return Number(n ?? 0).toLocaleString('id-ID');
}

function calcItemTotal(beratById: BeratMap, row: JenisSampahRow): number {
  const beratText = beratById[row.idJenisSampah] ?? '';
  const berat = toNumber(beratText.replace(/,/g, '.'));
  if (!berat || berat <= 0) {
    return 0;
  }
  const hargaSatuan = toNumber(row.hargasampahbsu) ?? 0;
  return hargaSatuan * berat;
}

export function BsuTransaksiCreateScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [nasabahSearch, setNasabahSearch] = React.useState('');
  const [nasabahList, setNasabahList] = React.useState<NasabahBsu[]>([]);
  const [selectedNasabah, setSelectedNasabah] =
    React.useState<NasabahBsu | null>(null);

  const [jenisSampah, setJenisSampah] = React.useState<JenisSampahRow[]>([]);
  const [beratById, setBeratById] = React.useState<BeratMap>({});

  const [submitting, setSubmitting] = React.useState(false);

  const bsuId = React.useMemo(() => {
    const id = Number(user?.idAkun);
    return Number.isFinite(id) ? id : NaN;
  }, [user?.idAkun]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      setNasabahList([]);
      setJenisSampah([]);
      return;
    }

    const [nasabahRes, jenisRes] = await Promise.all([
      getNasabahByBsu(user.token, bsuId),
      getJenisSampahData(user.token, bsuId),
    ]);

    if (!nasabahRes.success) {
      setError(nasabahRes.message ?? 'Gagal memuat nasabah.');
      setNasabahList([]);
      setJenisSampah([]);
      return;
    }

    if (!jenisRes.success) {
      setError(jenisRes.message ?? 'Gagal memuat jenis sampah.');
      setNasabahList(nasabahRes.data ?? []);
      setJenisSampah([]);
      return;
    }

    setNasabahList(nasabahRes.data ?? []);
    setJenisSampah(jenisRes.data?.bsu ?? []);
  }, [bsuId, user]);

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

  const filteredNasabah = React.useMemo(() => {
    const q = nasabahSearch.trim().toLowerCase();
    if (!q) {
      return nasabahList;
    }
    return nasabahList.filter(n => {
      const name = (n.nama ?? '').toLowerCase();
      const telp = (n.noTelp ?? '').toLowerCase();
      const nomor = (n.nomorNasabah ?? '').toLowerCase();
      return name.includes(q) || telp.includes(q) || nomor.includes(q);
    });
  }, [nasabahList, nasabahSearch]);

  const setBerat = (idJenisSampah: number, value: string) => {
    setBeratById(prev => ({...prev, [idJenisSampah]: value}));
  };

  const totalHarga = React.useMemo(() => {
    return jenisSampah.reduce((sum, r) => sum + calcItemTotal(beratById, r), 0);
  }, [beratById, jenisSampah]);

  const onSubmit = async () => {
    if (!user) {
      return;
    }

    setError(null);

    if (!selectedNasabah) {
      setError('Silakan pilih nasabah.');
      return;
    }

    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      return;
    }

    if (jenisSampah.length === 0) {
      setError('Belum ada jenis sampah/harga BSU. Atur di menu Harga Sampah.');
      return;
    }

    const items: CreateTransaksiItem[] = [];
    for (const r of jenisSampah) {
      const beratText = beratById[r.idJenisSampah] ?? '';
      const berat = toNumber(beratText.replace(/,/g, '.'));
      if (!berat || berat <= 0) {
        continue;
      }

      const hargaSatuan = toNumber(r.hargasampahbsu);
      if (!hargaSatuan || hargaSatuan <= 0) {
        setError(`Harga BSU untuk ${r.nama} belum valid.`);
        return;
      }

      items.push({
        idJenisSampah: r.idJenisSampah,
        berat,
        harga: hargaSatuan * berat,
      });
    }

    if (items.length === 0) {
      setError('Masukkan berat sampah minimal 1 item.');
      return;
    }

    const payload: CreateTransaksiRequest = {
      idNasabah: selectedNasabah.idNasabah,
      items,
      bsuId,
    };

    setSubmitting(true);
    try {
      const res = await createTransaksi(user.token, payload);
      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan transaksi.');
        return;
      }

      Alert.alert('Berhasil', 'Transaksi berhasil disimpan.');
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={filteredNasabah}
        keyExtractor={item => String(item.idNasabah)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        renderItem={({item}) => {
          const selected = selectedNasabah?.idNasabah === item.idNasabah;
          return (
            <Pressable
              onPress={() => {
                setSelectedNasabah(item);
                setNasabahSearch(item.nama);
              }}
              style={({pressed}) => [
                styles.nasabahRow,
                selected ? styles.nasabahRowSelected : null,
                pressed ? styles.pressed : null,
              ]}>
              <View style={styles.nasabahTitleRow}>
                <Text style={styles.nasabahName}>{item.nama}</Text>
                {selected ? (
                  <Text style={styles.selectedLabel}>Dipilih</Text>
                ) : null}
              </View>
              <Text style={styles.nasabahMeta}>{item.noTelp}</Text>
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <>
            {error ? <InlineAlert message={error} /> : null}
            <Card>
              <Text style={styles.sectionTitle}>Pilih Nasabah</Text>
              <AppTextField
                label="Cari"
                value={nasabahSearch}
                onChangeText={setNasabahSearch}
                placeholder="Nama / No. Telp / Nomor Nasabah"
              />
            </Card>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="Nasabah tidak ditemukan"
            description="Periksa kata pencarian atau tambahkan nasabah melalui menu Anggota."
          />
        }
        ListFooterComponent={
          <Card style={styles.cardSpacing}>
            <Text style={styles.sectionTitle}>Input Berat Sampah (kg)</Text>
            {jenisSampah.length === 0 ? (
              <Text style={styles.empty}>
                Belum ada harga BSU. Atur dulu di menu Harga Sampah.
              </Text>
            ) : null}

            {jenisSampah.map(r => {
              const hargaSatuan = toNumber(r.hargasampahbsu) ?? 0;
              const itemTotal = calcItemTotal(beratById, r);
              return (
                <View key={r.idJenisSampah} style={styles.itemRow}>
                  <Text style={styles.itemTitle}>{r.nama}</Text>
                  <Text style={styles.itemMeta}>
                    Harga/kg: {formatMoney(hargaSatuan)}
                  </Text>
                  <AppTextField
                    label="Berat (kg)"
                    value={beratById[r.idJenisSampah] ?? ''}
                    onChangeText={v => setBerat(r.idJenisSampah, v)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <Text style={styles.itemMeta}>
                    Total: {formatMoney(itemTotal)}
                  </Text>
                </View>
              );
            })}

            <View style={styles.totalRow}>
              <Text style={styles.totalText}>
                Total Nilai Setoran: Rp {formatMoney(totalHarga)}
              </Text>
            </View>

            <AppButton
              title="Simpan Transaksi"
              onPress={onSubmit}
              loading={submitting}
              disabled={submitting || !selectedNasabah || totalHarga <= 0}
            />
          </Card>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  nasabahRow: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
  },
  nasabahRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  pressed: {
    opacity: 0.85,
  },
  nasabahName: {
    flex: 1,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  nasabahTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  selectedLabel: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '900',
  },
  nasabahMeta: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  cardSpacing: {
    marginTop: theme.spacing.md,
  },
  itemRow: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outline,
  },
  itemTitle: {
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  itemMeta: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
  },
  totalRow: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  totalText: {
    fontWeight: '900',
    color: theme.colors.foreground,
  },
});
