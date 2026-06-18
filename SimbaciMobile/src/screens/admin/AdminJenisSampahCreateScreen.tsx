import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {useAuth} from '../../auth/AuthContext';
import {createJenisSampah} from '../../api/jenisSampah';
import {getKategoriSampah, type KategoriSampah} from '../../api/master';
import {AppButton} from '../../components/ui/AppButton';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';

export function AdminJenisSampahCreateScreen(): React.JSX.Element {
  const {user} = useAuth();

  const [nama, setNama] = React.useState('');
  const [kategori, setKategori] = React.useState('');
  const [hargaBsiText, setHargaBsiText] = React.useState('');

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

  const onSubmit = async () => {
    if (!user) {
      setError('Silakan login.');
      return;
    }

    if (user.roleName !== 'admin') {
      setError('Akses ditolak. Hanya Admin.');
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

    let hargaBsi: number | null = null;
    if (hargaBsiText.trim()) {
      const normalized = hargaBsiText.replace(/,/g, '.');
      const parsed = Number(normalized);
      if (!Number.isFinite(parsed) || parsed < 0) {
        setError('Harga BSI harus berupa angka yang valid.');
        return;
      }
      hargaBsi = parsed;
    }

    setSubmitting(true);
    try {
      const res = await createJenisSampah(user.token, {
        nama: nama.trim(),
        kategori: kategori.trim(),
        hargaBsi,
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal menambahkan jenis sampah.');
        return;
      }

      setSuccess('Jenis sampah berhasil ditambahkan.');
      setNama('');
      setKategori('');
      setHargaBsiText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <SectionTitle title="Jenis Sampah" subtitle="Tambah jenis sampah baru" />

      {error ? <InlineAlert message={error} /> : null}
      {success ? <InlineAlert tone="info" message={success} /> : null}

      <Card>
        <AppTextField
          label="Nama"
          value={nama}
          onChangeText={setNama}
          placeholder="Contoh: Plastik"
        />

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
          placeholder="Contoh: 1000"
          keyboardType="numeric"
        />

        <View style={styles.actions}>
          <AppButton
            title="Simpan"
            onPress={onSubmit}
            loading={submitting}
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
