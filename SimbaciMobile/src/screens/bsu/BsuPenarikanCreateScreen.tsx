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
import {createPenarikan} from '../../api/penarikan';
import {getNasabahByBsu, type NasabahBsu} from '../../api/nasabah';
import type {BsuFinanceStackParamList} from '../../navigation/stacks/BsuFinanceStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {AppDateField} from '../../components/ui/AppDateField';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';
import {todayYmdJakarta} from '../../utils/date';

type Nav = NativeStackNavigationProp<BsuFinanceStackParamList>;

function safeNumber(input: unknown): number {
  const n = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number): string {
  return Number(n ?? 0).toLocaleString('id-ID');
}

function todayDateOnly(): string {
  return todayYmdJakarta();
}

function isValidDate(input: string): boolean {
  return !Number.isNaN(Date.parse(input));
}

function normalizeText(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .trim();
}

export function BsuPenarikanCreateScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [nasabahSearch, setNasabahSearch] = React.useState('');
  const [nasabahList, setNasabahList] = React.useState<NasabahBsu[]>([]);
  const [selectedNasabah, setSelectedNasabah] =
    React.useState<NasabahBsu | null>(null);

  const [tanggal, setTanggal] = React.useState<string>(() => todayDateOnly());
  const [metode, setMetode] = React.useState('Tunai');
  const [total, setTotal] = React.useState('');

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
      return;
    }

    const res = await getNasabahByBsu(user.token, bsuId);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat nasabah.');
      setNasabahList([]);
      return;
    }

    const list = res.data ?? [];
    setNasabahList(list);

    setSelectedNasabah(prev => {
      if (!prev) {
        return prev;
      }
      const exists = list.find(n => n.idNasabah === prev.idNasabah);
      return exists ?? null;
    });
  }, [bsuId, user]);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!user) {
        return;
      }

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
  }, [load, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredNasabah = React.useMemo(() => {
    const q = normalizeText(nasabahSearch);
    if (!q) {
      return nasabahList;
    }

    return nasabahList.filter(n => {
      const hay = [n.nama, n.noTelp, n.nomorNasabah]
        .map(normalizeText)
        .join(' ');
      return hay.includes(q);
    });
  }, [nasabahList, nasabahSearch]);

  const selectedSaldo = selectedNasabah ? safeNumber(selectedNasabah.saldo) : 0;

  const onSubmit = async () => {
    if (!user) {
      return;
    }

    setError(null);

    if (!selectedNasabah) {
      setError('Silakan pilih nasabah terlebih dahulu.');
      return;
    }

    const dateOnly = String(tanggal ?? '').trim();
    if (!dateOnly) {
      setError('Tanggal wajib diisi.');
      return;
    }
    if (!isValidDate(dateOnly)) {
      setError('Tanggal tidak valid.');
      return;
    }

    const metodeTrim = String(metode ?? '').trim();
    if (!metodeTrim) {
      setError('Metode pembayaran wajib diisi.');
      return;
    }

    const totalNum = Number(String(total ?? '0').replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(totalNum) || totalNum <= 0) {
      setError('Total penarikan harus lebih dari 0.');
      return;
    }
    if (totalNum > selectedSaldo) {
      setError(`Saldo tidak mencukupi. Saldo: ${formatMoney(selectedSaldo)}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPenarikan(user.token, {
        nasabahId: selectedNasabah.idNasabah,
        totalPenarikan: String(totalNum),
        metodePembayaran: metodeTrim,
        tanggalPenarikan: new Date(dateOnly).toISOString(),
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal memproses penarikan.');
        return;
      }

      Alert.alert('Berhasil', 'Penarikan berhasil diproses.');
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
          <Text style={styles.centerText}>Memuat nasabah…</Text>
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
              onPress={() => setSelectedNasabah(item)}
              accessibilityRole="button"
              style={({pressed}) => [
                styles.nasabahRow,
                selected ? styles.nasabahRowSelected : null,
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.nasabahName}>{item.nama}</Text>
              <Text style={styles.nasabahMeta}>
                No. Nasabah: {item.nomorNasabah}
              </Text>
              <Text style={styles.nasabahMeta}>
                Saldo: {formatMoney(safeNumber(item.saldo))}
              </Text>
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
          <Text style={styles.empty}>Tidak ada nasabah.</Text>
        }
        ListFooterComponent={
          <Card style={styles.cardSpacing}>
            <Text style={styles.sectionTitle}>Detail Penarikan</Text>
            <Text style={styles.helper}>
              Nasabah:{' '}
              {selectedNasabah
                ? selectedNasabah.nama ?? `#${selectedNasabah.idNasabah}`
                : 'Belum memilih'}
            </Text>
            <Text style={styles.helper}>
              Saldo nasabah terpilih: {formatMoney(selectedSaldo)}
            </Text>

            <AppDateField
              label="Tanggal"
              value={tanggal}
              onChange={setTanggal}
            />

            <AppTextField
              label="Metode Pembayaran"
              value={metode}
              onChangeText={setMetode}
              placeholder="Tunai / Transfer"
            />

            <AppTextField
              label="Total Penarikan"
              value={total}
              onChangeText={setTotal}
              keyboardType="numeric"
              placeholder="0"
            />

            <View style={styles.submitRow}>
              <AppButton
                title="Proses"
                onPress={onSubmit}
                loading={submitting}
                disabled={submitting}
              />
            </View>
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
  helper: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  nasabahRow: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.card,
  },
  nasabahRowSelected: {
    borderColor: theme.colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  nasabahName: {
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  nasabahMeta: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  cardSpacing: {
    marginTop: theme.spacing.md,
  },
  submitRow: {
    marginTop: theme.spacing.md,
  },
});
