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
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {
  createPenjualan,
  type CreatePenjualanItemRequest,
} from '../../api/keuangan';
import {getJenisSampahData, type JenisSampahRow} from '../../api/jenisSampah';
import type {BsuFinanceStackParamList} from '../../navigation/stacks/BsuFinanceStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {AppDateField} from '../../components/ui/AppDateField';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<BsuFinanceStackParamList>;

type NumMap = Record<number, string>;

function isValidDate(input: string): boolean {
  return !Number.isNaN(Date.parse(input));
}

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

function calcItemTotal(
  beratById: NumMap,
  hargaById: NumMap,
  row: JenisSampahRow,
): number {
  const beratText = beratById[row.idJenisSampah] ?? '';
  const hargaText = hargaById[row.idJenisSampah] ?? '';
  const berat = toNumber(beratText.replace(/,/g, '.'));
  const harga = toNumber(hargaText.replace(/,/g, '.'));
  if (!berat || berat <= 0 || !harga || harga <= 0) {
    return 0;
  }
  return berat * harga;
}

export function BsuKeuanganAddPenjualanScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  const [tanggal, setTanggal] = React.useState('');
  const [nama, setNama] = React.useState('');

  const [jenisSampah, setJenisSampah] = React.useState<JenisSampahRow[]>([]);
  const [beratById, setBeratById] = React.useState<NumMap>({});
  const [hargaById, setHargaById] = React.useState<NumMap>({});

  const bsuId = React.useMemo(() => {
    const id = Number(user?.idAkun);
    return Number.isFinite(id) ? id : NaN;
  }, [user?.idAkun]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const res = await getJenisSampahData(user.token, 0);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat jenis sampah.');
      setJenisSampah([]);
      return;
    }

    setJenisSampah(res.data?.bsi ?? []);
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

  const setBerat = (idJenisSampah: number, value: string) => {
    setBeratById(prev => ({...prev, [idJenisSampah]: value}));
  };

  const setHarga = (idJenisSampah: number, value: string) => {
    setHargaById(prev => ({...prev, [idJenisSampah]: value}));
  };

  const totalHarga = React.useMemo(() => {
    return jenisSampah.reduce(
      (sum, r) => sum + calcItemTotal(beratById, hargaById, r),
      0,
    );
  }, [beratById, hargaById, jenisSampah]);

  const onSubmit = async () => {
    if (!user) {
      return;
    }

    setError(null);

    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      return;
    }

    const tanggalTrim = tanggal.trim();
    const namaTrim = nama.trim();

    if (!tanggalTrim || !isValidDate(tanggalTrim)) {
      setError('Tanggal tidak valid.');
      return;
    }

    if (namaTrim.length < 3) {
      setError('Nama pengepul minimal 3 karakter.');
      return;
    }

    if (jenisSampah.length === 0) {
      setError('Jenis sampah kosong.');
      return;
    }

    const penjualanItems: CreatePenjualanItemRequest[] = [];

    for (const r of jenisSampah) {
      const beratText = beratById[r.idJenisSampah] ?? '';
      const hargaText = hargaById[r.idJenisSampah] ?? '';

      const berat = toNumber(beratText.replace(/,/g, '.'));
      const harga = toNumber(hargaText.replace(/,/g, '.'));

      if (!berat || berat <= 0) {
        continue;
      }

      if (!harga || harga <= 0) {
        setError(`Harga untuk ${r.nama} belum valid.`);
        return;
      }

      penjualanItems.push({
        jenisSampahId: r.idJenisSampah,
        berat,
        harga,
      });
    }

    if (penjualanItems.length === 0) {
      setError('Masukkan minimal 1 item penjualan.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPenjualan(user.token, {
        tanggal: tanggalTrim,
        nama: namaTrim,
        bsuId,
        penjualanItems,
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan penjualan.');
        return;
      }

      Alert.alert('Berhasil', 'Penjualan berhasil disimpan.');
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
        data={jenisSampah}
        keyExtractor={item => String(item.idJenisSampah)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {error ? <InlineAlert message={error} /> : null}
            <Card>
              <Text style={styles.title}>Tambah Penjualan Sampah</Text>
              <AppDateField
                label="Tanggal"
                value={tanggal}
                onChange={setTanggal}
              />
              <AppTextField
                label="Nama Pengepul"
                value={nama}
                onChangeText={setNama}
                placeholder="Nama pengepul"
              />
              <Text style={styles.section}>Item Penjualan</Text>
              <Text style={styles.helper}>
                Isi berat dan harga untuk jenis sampah yang dijual.
              </Text>
            </Card>
          </>
        }
        renderItem={({item}) => {
          const itemTotal = calcItemTotal(beratById, hargaById, item);
          return (
            <Card style={styles.itemCard}>
              <Text style={styles.itemTitle}>{item.nama}</Text>
              <AppTextField
                label="Berat (kg)"
                value={beratById[item.idJenisSampah] ?? ''}
                onChangeText={v => setBerat(item.idJenisSampah, v)}
                keyboardType="numeric"
                placeholder="0"
              />
              <AppTextField
                label="Harga/kg"
                value={hargaById[item.idJenisSampah] ?? ''}
                onChangeText={v => setHarga(item.idJenisSampah, v)}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={styles.itemMeta}>
                Total: {formatMoney(itemTotal)}
              </Text>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Tidak ada data jenis sampah.</Text>
        }
        ListFooterComponent={
          <Card style={styles.footerCard}>
            <Text style={styles.totalText}>
              Total Penjualan: {formatMoney(totalHarga)}
            </Text>
            <AppButton
              title="Simpan Penjualan"
              onPress={onSubmit}
              loading={submitting}
              disabled={submitting}
              style={styles.submitButton}
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
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  section: {
    marginTop: theme.spacing.md,
    fontSize: 13,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  helper: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
  },
  itemCard: {
    marginTop: theme.spacing.sm,
  },
  itemTitle: {
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  itemMeta: {
    marginTop: theme.spacing.sm,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  footerCard: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  totalText: {
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  submitButton: {
    marginTop: theme.spacing.sm,
  },
});
