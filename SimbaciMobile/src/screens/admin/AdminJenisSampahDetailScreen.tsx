import React from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';

import {useAuth} from '../../auth/AuthContext';
import {deleteJenisSampah, updateJenisSampah} from '../../api/jenisSampah';
import {getKategoriSampah, type KategoriSampah} from '../../api/master';
import type {AdminJenisSampahStackParamList} from '../../navigation/stacks/AdminJenisSampahStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type R = RouteProp<AdminJenisSampahStackParamList, 'AdminJenisSampahDetail'>;

export function AdminJenisSampahDetailScreen(): React.JSX.Element {
  const route = useRoute<R>();
  const {user} = useAuth();

  const idJenisSampah = route.params.idJenisSampah;

  const [nama, setNama] = React.useState(route.params.nama);
  const [kategori, setKategori] = React.useState(route.params.kategori);
  const [hargaBsiText, setHargaBsiText] = React.useState(
    route.params.hargaBsi === null ? '' : String(route.params.hargaBsi),
  );

  const [kategoriLoading, setKategoriLoading] = React.useState(true);
  const [kategoriError, setKategoriError] = React.useState<string | null>(null);
  const [kategoriOptions, setKategoriOptions] = React.useState<
    KategoriSampah[]
  >([]);
  const [kategoriDropdownOpen, setKategoriDropdownOpen] = React.useState(false);

  const loadKategori = React.useCallback(async () => {
    setKategoriError(null);
    setKategoriLoading(true);
    try {
      try {
        const res = await getKategoriSampah(user?.token);
        if (!res.success) {
          setKategoriError(res.message ?? 'Gagal memuat kategori sampah.');
          setKategoriOptions([]);
          return;
        }
        const list = (res.data ?? []).filter(k => (k.nama ?? '').trim());
        setKategoriOptions(list);
      } catch {
        setKategoriError('Gagal memuat kategori sampah.');
        setKategoriOptions([]);
      }
    } finally {
      setKategoriLoading(false);
    }
  }, [user?.token]);

  React.useEffect(() => {
    loadKategori();
  }, [loadKategori]);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const parseHarga = (): number | null => {
    if (!hargaBsiText.trim()) {
      return null;
    }
    const normalized = hargaBsiText.replace(/,/g, '.');
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return NaN;
    }
    return parsed;
  };

  const onSave = async () => {
    if (!user) {
      setError('Silakan login.');
      return;
    }

    setError(null);
    setSuccess(null);

    if (!nama.trim()) {
      setError('Nama jenis sampah wajib diisi.');
      return;
    }
    if (kategoriLoading) {
      setError('Kategori masih dimuat. Silakan tunggu.');
      return;
    }
    if (!kategori.trim()) {
      setError('Kategori wajib diisi.');
      return;
    }

    const hargaBsi = parseHarga();
    if (Number.isNaN(hargaBsi)) {
      setError('Harga BSI harus berupa angka yang valid.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateJenisSampah(user.token, {
        idJenisSampah,
        nama: nama.trim(),
        kategori: kategori.trim(),
        hargaBsi,
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan perubahan.');
        return;
      }

      setSuccess('Perubahan berhasil disimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!user) {
      return;
    }

    Alert.alert(
      'Hapus Jenis Sampah',
      'Yakin ingin menghapus jenis sampah ini?',
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            setError(null);
            setSuccess(null);
            try {
              const res = await deleteJenisSampah(user.token, idJenisSampah);
              if (!res.success) {
                setError(res.message ?? 'Gagal menghapus data.');
                return;
              }
              Alert.alert('Sukses', 'Jenis sampah berhasil dihapus.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen scroll>
      {error ? <InlineAlert message={error} /> : null}
      {success ? <InlineAlert tone="info" message={success} /> : null}

      <Card>
        <AppTextField label="Nama" value={nama} onChangeText={setNama} />

        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Kategori</Text>
          <Pressable
            onPress={() =>
              setKategoriDropdownOpen(prev => (kategoriLoading ? prev : !prev))
            }
            style={({pressed}) => [
              styles.selectBox,
              kategoriDropdownOpen ? styles.selectBoxOpen : null,
              pressed && !kategoriLoading ? styles.selectBoxPressed : null,
              kategoriLoading ? styles.selectBoxDisabled : null,
            ]}
            disabled={kategoriLoading}>
            <Text
              style={[
                styles.selectValue,
                kategori ? null : styles.selectPlaceholder,
              ]}
              numberOfLines={1}>
              {kategoriLoading
                ? 'Memuat kategori…'
                : kategori || 'Pilih kategori'}
            </Text>
          </Pressable>
          {kategoriError ? (
            <Text style={styles.helperError}>{kategoriError}</Text>
          ) : null}
        </View>

        {kategoriDropdownOpen ? (
          <Card style={styles.dropdownCard}>
            <View style={styles.dropdownList}>
              {kategoriOptions.length === 0 ? (
                <Text style={styles.dropdownEmpty}>
                  Kategori belum tersedia.
                </Text>
              ) : (
                kategoriOptions.map(opt => {
                  const name = String(opt.nama ?? '').trim();
                  const selected = name === kategori;
                  return (
                    <Pressable
                      key={String(opt.idKategoriSampah)}
                      onPress={() => {
                        setKategori(name);
                        setKategoriDropdownOpen(false);
                      }}
                      style={[
                        styles.dropdownRow,
                        selected ? styles.dropdownRowSelected : null,
                      ]}>
                      <Text
                        style={[
                          styles.dropdownRowText,
                          selected ? styles.dropdownRowTextSelected : null,
                        ]}>
                        {name}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </View>
            <View style={styles.dropdownActions}>
              <AppButton
                title="Muat Ulang"
                variant="secondary"
                onPress={() => {
                  loadKategori();
                }}
                disabled={kategoriLoading}
              />
              <AppButton
                title="Tutup"
                variant="secondary"
                onPress={() => setKategoriDropdownOpen(false)}
              />
            </View>
          </Card>
        ) : null}
        <AppTextField
          label="Harga BSI (opsional)"
          value={hargaBsiText}
          onChangeText={setHargaBsiText}
          keyboardType="numeric"
        />

        <View style={styles.actions}>
          <AppButton
            title="Simpan"
            onPress={onSave}
            loading={submitting}
            disabled={submitting}
          />
          <AppButton
            title="Hapus"
            variant="destructive"
            onPress={onDelete}
            disabled={submitting}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  fieldWrapper: {
    marginTop: theme.spacing.sm,
  },
  fieldLabel: {
    marginBottom: theme.spacing.xs,
    fontWeight: '800',
    color: theme.colors.foreground,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
  },
  selectBoxOpen: {
    borderColor: theme.colors.primary,
  },
  selectBoxPressed: {
    opacity: 0.85,
  },
  selectBoxDisabled: {
    opacity: 0.6,
  },
  selectValue: {
    color: theme.colors.foreground,
  },
  selectPlaceholder: {
    color: theme.colors.muted2,
  },
  helperError: {
    marginTop: 6,
    color: theme.colors.error,
    fontWeight: '700',
  },
  dropdownCard: {
    marginTop: theme.spacing.sm,
  },
  dropdownList: {
    gap: theme.spacing.xs,
  },
  dropdownRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dropdownRowSelected: {
    borderColor: theme.colors.primary,
  },
  dropdownRowText: {
    color: theme.colors.foreground,
    fontWeight: '800',
  },
  dropdownRowTextSelected: {
    color: theme.colors.primary,
  },
  dropdownEmpty: {
    color: theme.colors.muted,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
  },
  dropdownActions: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
