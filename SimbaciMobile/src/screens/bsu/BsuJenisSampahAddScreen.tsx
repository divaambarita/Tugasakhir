import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Check, ChevronDown} from 'lucide-react-native';

import {getJenisSampahData, upsertHargaSampahBsu} from '../../api/jenisSampah';
import type {JenisSampahRow} from '../../api/jenisSampah';
import {useAuth} from '../../auth/AuthContext';
import {AppButton} from '../../components/ui/AppButton';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';
import type {BsuHargaSampahStackParamList} from '../../navigation/stacks/BsuHargaSampahStackNavigator';

type Nav = NativeStackNavigationProp<BsuHargaSampahStackParamList>;

function toNumber(input: unknown): number | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  const value = typeof input === 'string' ? Number(input) : (input as number);
  return Number.isFinite(value) ? value : null;
}

function formatMoney(input: number | null): string {
  return input === null ? '-' : `Rp ${input.toLocaleString('id-ID')}`;
}

export function BsuJenisSampahAddScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [items, setItems] = React.useState<JenisSampahRow[]>([]);
  const [selected, setSelected] = React.useState<JenisSampahRow | null>(null);
  const [hargaBsuText, setHargaBsuText] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!user) {
        setError('Silakan login terlebih dahulu.');
        setLoading(false);
        return;
      }

      const bsuId = Number(user.idAkun);
      if (user.roleName !== 'bsu' || !Number.isFinite(bsuId) || bsuId <= 0) {
        setError('Akses BSU tidak valid. Silakan login ulang.');
        setLoading(false);
        return;
      }

      const [allRes, bsuRes] = await Promise.all([
        getJenisSampahData(user.token, 0),
        getJenisSampahData(user.token, bsuId),
      ]);

      if (cancelled) {
        return;
      }

      if (!allRes.success) {
        setError(allRes.message ?? 'Gagal memuat master jenis sampah.');
        setLoading(false);
        return;
      }
      if (!bsuRes.success) {
        setError(bsuRes.message ?? 'Gagal memuat harga sampah BSU.');
        setLoading(false);
        return;
      }

      const activeIds = new Set(
        (bsuRes.data?.bsu ?? [])
          .filter(row => toNumber(row.hargasampahbsu) !== null)
          .map(row => row.idJenisSampah),
      );
      const available = (allRes.data?.bsi ?? [])
        .filter(row => !activeIds.has(row.idJenisSampah))
        .sort((a, b) => a.nama.localeCompare(b.nama));

      setItems(available);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const onSave = async () => {
    if (!user || !selected) {
      setError('Pilih jenis sampah terlebih dahulu.');
      return;
    }

    setError(null);
    const bsuId = Number(user.idAkun);
    const hargaBsi = toNumber(selected.hargasampahbsi);
    const hargaBsu = Number(hargaBsuText.trim().replace(/,/g, '.'));

    if (!Number.isFinite(hargaBsu) || hargaBsu < 0) {
      setError('Harga BSU harus berupa angka yang valid.');
      return;
    }
    if (hargaBsi !== null && hargaBsu < hargaBsi) {
      setError('Harga BSU tidak boleh lebih rendah daripada harga BSI.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await upsertHargaSampahBsu(user.token, {
        idJenisSampah: selected.idJenisSampah,
        bsuId,
        nama: selected.nama,
        kategori: selected.kategori,
        hargaBsi,
        hargaBsu,
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal menambahkan jenis sampah.');
        return;
      }

      navigation.goBack();
      Alert.alert(
        'Berhasil',
        'Jenis sampah berhasil ditambahkan ke daftar harga BSU.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Memuat jenis sampah…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <SectionTitle
        title="Tambah Jenis Sampah"
        subtitle="Pilih jenis dari master BSI, lalu tentukan harga untuk BSU Anda"
      />

      {error ? <InlineAlert message={error} /> : null}
      <InlineAlert
        tone="info"
        message="Harga BSU tidak boleh lebih rendah daripada harga BSI."
      />

      {items.length === 0 ? (
        <InlineAlert
          tone="info"
          message="Semua jenis sampah sudah ditambahkan. Hapus salah satu harga jika ingin menambahkannya kembali."
        />
      ) : (
        <View style={styles.dropdownSection}>
          <Text style={styles.dropdownLabel}>Jenis Sampah</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{expanded: dropdownOpen}}
            onPress={() => setDropdownOpen(open => !open)}
            style={({pressed}) => [
              styles.dropdownButton,
              dropdownOpen ? styles.dropdownButtonOpen : null,
              pressed ? styles.pressed : null,
            ]}>
            <View style={styles.dropdownCopy}>
              <Text
                style={[
                  styles.dropdownValue,
                  !selected ? styles.dropdownPlaceholder : null,
                ]}>
                {selected?.nama ?? 'Pilih jenis sampah'}
              </Text>
              {selected ? (
                <Text style={styles.dropdownCategory}>{selected.kategori}</Text>
              ) : null}
            </View>
            <ChevronDown
              color={theme.colors.muted}
              size={20}
              style={dropdownOpen ? styles.chevronOpen : undefined}
            />
          </Pressable>

          {dropdownOpen ? (
            <Card style={styles.dropdownMenu}>
              {items.map((item, index) => {
                const isSelected =
                  selected?.idJenisSampah === item.idJenisSampah;
                return (
                  <Pressable
                    key={item.idJenisSampah}
                    onPress={() => {
                      setSelected(item);
                      setHargaBsuText('');
                      setDropdownOpen(false);
                    }}
                    style={({pressed}) => [
                      styles.dropdownOption,
                      index < items.length - 1
                        ? styles.dropdownOptionBorder
                        : null,
                      isSelected ? styles.dropdownOptionSelected : null,
                      pressed ? styles.pressed : null,
                    ]}>
                    <View style={styles.optionCopy}>
                      <Text style={styles.optionName}>{item.nama}</Text>
                      <Text style={styles.optionMeta}>
                        {item.kategori} • Harga BSI{' '}
                        {formatMoney(toNumber(item.hargasampahbsi))}
                      </Text>
                    </View>
                    {isSelected ? (
                      <Check color={theme.colors.primary} size={20} />
                    ) : null}
                  </Pressable>
                );
              })}
            </Card>
          ) : null}
        </View>
      )}

      {selected ? (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Atur Harga BSU</Text>
          <Text style={styles.selectedName}>{selected.nama}</Text>
          <Text style={styles.referencePrice}>
            Harga BSI: {formatMoney(toNumber(selected.hargasampahbsi))}
          </Text>
          <AppTextField
            label="Harga BSU"
            value={hargaBsuText}
            onChangeText={setHargaBsuText}
            keyboardType="numeric"
            placeholder="Masukkan harga BSU"
          />
          <AppButton
            title="Tambah ke Daftar"
            onPress={onSave}
            loading={submitting}
            disabled={submitting || !hargaBsuText.trim()}
          />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  dropdownSection: {
    marginBottom: theme.spacing.md,
  },
  dropdownLabel: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.foreground,
    fontWeight: '800',
  },
  dropdownButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  dropdownButtonOpen: {
    borderColor: theme.colors.primary,
  },
  dropdownCopy: {
    flex: 1,
  },
  dropdownValue: {
    color: theme.colors.foreground,
    fontWeight: '800',
  },
  dropdownPlaceholder: {
    color: theme.colors.muted,
  },
  dropdownCategory: {
    marginTop: 2,
    color: theme.colors.muted,
    fontSize: theme.fontSize.sm,
  },
  chevronOpen: {
    transform: [{rotate: '180deg'}],
  },
  dropdownMenu: {
    marginTop: theme.spacing.xs,
    padding: theme.spacing.xs,
  },
  dropdownOption: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  dropdownOptionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.outline,
  },
  dropdownOptionSelected: {
    backgroundColor: theme.colors.primarySoft,
  },
  optionCopy: {
    flex: 1,
  },
  optionName: {
    color: theme.colors.foreground,
    fontWeight: '900',
  },
  optionMeta: {
    marginTop: 2,
    color: theme.colors.muted,
    fontSize: theme.fontSize.sm,
  },
  formCard: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  formTitle: {
    ...theme.typography.titleMedium,
    color: theme.colors.foreground,
  },
  selectedName: {
    color: theme.colors.foreground,
    fontWeight: '900',
  },
  referencePrice: {
    color: theme.colors.muted,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
