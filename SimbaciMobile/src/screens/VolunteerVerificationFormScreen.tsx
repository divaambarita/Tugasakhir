import React from 'react';
import {Alert, Image, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {launchImageLibrary} from 'react-native-image-picker';
import {Building2, Camera, ClipboardEdit} from 'lucide-react-native';

import {useAuth} from '../auth/AuthContext';
import {saveVerification} from '../api/volunteer';
import {uploadSingleImage} from '../api/fileUpload';
import type {VolunteerVerificationStackParamList} from '../navigation/stacks/VolunteerVerificationStackNavigator';
import {AppButton} from '../components/ui/AppButton';
import {AppTextField} from '../components/ui/AppTextField';
import {Card} from '../components/ui/Card';
import {InlineAlert} from '../components/ui/InlineAlert';
import {Screen} from '../components/ui/Screen';
import {SectionTitle} from '../components/ui/SectionTitle';
import {theme} from '../components/ui/theme';

type R = RouteProp<VolunteerVerificationStackParamList, 'VerificationForm'>;
type Nav = NativeStackNavigationProp<VolunteerVerificationStackParamList>;

function fasilitasToPayload(text: string): Array<Record<string, unknown>> {
  const items = text
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return items.map(name => ({name}));
}

export function VolunteerVerificationFormScreen(): React.JSX.Element {
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const {bsuId, bsuName, mode = 'create', initialData} = route.params;
  const isEditing = mode === 'edit';

  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [lokasi, setLokasi] = React.useState(initialData?.lokasi ?? '');
  const [luasTempat, setLuasTempat] = React.useState(
    initialData?.luasTempat ?? '',
  );
  const [kondisiBangunan, setKondisiBangunan] = React.useState(
    initialData?.kondisiBangunan ?? '',
  );
  const [fasilitasText, setFasilitasText] = React.useState(
    initialData?.fasilitasText ?? '',
  );
  const [fotoKunjunganUrl, setFotoKunjunganUrl] = React.useState(
    initialData?.fotoKunjunganUrl ?? '',
  );

  const pickAndUploadFoto = async () => {
    if (!user) {
      return;
    }

    setError(null);

    let result: Awaited<ReturnType<typeof launchImageLibrary>>;
    try {
      result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });
    } catch {
      setError('Fitur pilih foto tidak dapat dibuka. Silakan coba lagi.');
      return;
    }

    if (result.didCancel) {
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      setError('Gagal memilih foto.');
      return;
    }

    setUploading(true);
    try {
      const uploadRes = await uploadSingleImage(
        {
          uri: asset.uri,
          fileName: asset.fileName,
          type: asset.type,
        },
        'foto-kunjungan',
      );

      if (!uploadRes.success) {
        setError(uploadRes.message ?? 'Gagal mengunggah foto');
        return;
      }

      const url = uploadRes.data?.[0]?.path;
      if (!url) {
        setError('Gagal membaca hasil unggahan.');
        return;
      }

      setFotoKunjunganUrl(url);
      Alert.alert('Berhasil', 'Foto kunjungan berhasil diunggah.');
    } catch {
      setError('Gagal mengunggah foto kunjungan. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const validate = (): string | null => {
    if (!user) {
      return 'Silakan login.';
    }
    if (user.roleName !== 'volunteer') {
      return 'Akses ditolak. Hanya Volunteer.';
    }
    if (lokasi.trim().length < 3) {
      return 'Lokasi minimal 3 karakter.';
    }
    if (luasTempat.trim().length < 3) {
      return 'Luas tempat minimal 3 karakter.';
    }
    if (kondisiBangunan.trim().length < 3) {
      return 'Kondisi bangunan minimal 3 karakter.';
    }
    if (!fotoKunjunganUrl.trim()) {
      return 'Foto kunjungan wajib dipilih.';
    }
    return null;
  };

  const save = async () => {
    if (!user) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await saveVerification(user.token, {
        volunteerId: Number(user.idAkun),
        bsuId: Number(bsuId),
        lokasi: lokasi.trim(),
        dokumen: fotoKunjunganUrl.trim(),
        luasTempat: luasTempat.trim(),
        kondisiBangunan: kondisiBangunan.trim(),
        fasilitas: fasilitasToPayload(fasilitasText),
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan verifikasi');
        return;
      }

      Alert.alert(
        'Berhasil',
        isEditing
          ? 'Hasil survei berhasil diperbarui.'
          : 'Hasil verifikasi berhasil dikirim.',
        [
          {
            text: isEditing ? 'Kembali ke Riwayat' : 'Kembali ke Daftar',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch {
      setError(
        isEditing
          ? 'Gagal memperbarui hasil survei. Silakan coba lagi.'
          : 'Gagal mengirim hasil verifikasi. Silakan coba lagi.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submit = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    if (isEditing) {
      Alert.alert(
        'Konfirmasi Perubahan',
        'Simpan perubahan pada hasil survei ini?',
        [
          {text: 'Batal', style: 'cancel'},
          {
            text: 'Simpan',
            onPress: () => {
              save();
            },
          },
        ],
      );
      return;
    }

    save();
  };

  if (!user) {
    return (
      <Screen>
        <Text>Silakan login.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <SectionTitle
        title={isEditing ? 'Edit Hasil Survei' : 'Verifikasi BSU'}
        subtitle={
          isEditing
            ? 'Perbarui data kunjungan yang masih menunggu persetujuan.'
            : bsuName
        }
      />

      {error ? <InlineAlert message={error} /> : null}

      <Card style={styles.bsuCard}>
        <View style={styles.bsuIcon}>
          <Building2 color={theme.colors.onPrimary} size={25} />
        </View>
        <View style={styles.bsuText}>
          <Text style={styles.bsuLabel}>
            {isEditing ? 'Hasil survei untuk' : 'BSU yang akan disurvei'}
          </Text>
          <Text style={styles.bsuName}>{bsuName}</Text>
        </View>
      </Card>

      <Card style={styles.formCard}>
        <View style={styles.formHeading}>
          <View style={styles.formIcon}>
            <ClipboardEdit color={theme.colors.primary} size={20} />
          </View>
          <View style={styles.formHeadingText}>
            <Text style={styles.formTitle}>Data Kunjungan</Text>
            <Text style={styles.formSubtitle}>
              Lengkapi sesuai kondisi di lokasi.
            </Text>
          </View>
        </View>

        <AppTextField
          label="Lokasi Kunjungan"
          value={lokasi}
          onChangeText={setLokasi}
          placeholder="Alamat atau titik lokasi BSU"
        />

        <AppTextField
          label="Luas Tempat"
          value={luasTempat}
          onChangeText={setLuasTempat}
          placeholder="Contoh: 3x4 m"
        />

        <AppTextField
          label="Kondisi Bangunan"
          value={kondisiBangunan}
          onChangeText={setKondisiBangunan}
          placeholder="Contoh: Baik dan layak digunakan"
        />

        <AppTextField
          label="Fasilitas (pisahkan dengan koma)"
          value={fasilitasText}
          onChangeText={setFasilitasText}
          placeholder="Contoh: Timbangan, karung, gerobak"
        />

        <View style={styles.section}>
          <View style={styles.photoHeading}>
            <Camera color={theme.colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Dokumentasi Kunjungan</Text>
          </View>
          <Text style={styles.helperText}>
            Pastikan area dan kondisi BSU terlihat dengan jelas.
          </Text>
          {fotoKunjunganUrl ? (
            <Image
              source={{uri: fotoKunjunganUrl}}
              style={styles.photoPreview}
              accessibilityLabel={`Foto kunjungan ${bsuName}`}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <View style={styles.photoPlaceholderIcon}>
                <Camera color={theme.colors.muted} size={26} />
              </View>
              <Text style={styles.photoPlaceholderTitle}>
                Belum ada foto kunjungan
              </Text>
              <Text style={styles.photoPlaceholderText}>
                Pilih satu foto yang paling jelas.
              </Text>
            </View>
          )}
          <AppButton
            title={fotoKunjunganUrl ? 'Ganti Foto' : 'Pilih Foto'}
            onPress={pickAndUploadFoto}
            variant="secondary"
            disabled={uploading || submitting}
            loading={uploading}
          />
        </View>

        <View style={styles.actions}>
          <AppButton
            title={isEditing ? 'Simpan Perubahan' : 'Kirim Hasil Verifikasi'}
            onPress={submit}
            disabled={uploading || submitting}
            loading={submitting}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bsuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  bsuIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.onPrimaryRipple,
  },
  bsuText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  bsuLabel: {
    ...theme.typography.caption,
    color: theme.colors.onPrimary,
    opacity: 0.8,
  },
  bsuName: {
    marginTop: 2,
    ...theme.typography.titleMedium,
    color: theme.colors.onPrimary,
  },
  formCard: {
    borderRadius: theme.radius.lg,
  },
  formHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  formIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accentSoft,
  },
  formHeadingText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  formTitle: {
    ...theme.typography.titleMedium,
    color: theme.colors.foreground,
  },
  formSubtitle: {
    marginTop: 2,
    ...theme.typography.caption,
    color: theme.colors.muted,
  },
  section: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  photoHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  helperText: {
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  photoPreview: {
    width: '100%',
    height: 180,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.md,
    resizeMode: 'cover',
    backgroundColor: theme.colors.surfaceVariant,
  },
  photoPlaceholder: {
    height: 155,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.inputBorder,
    backgroundColor: theme.colors.surfaceVariant,
  },
  photoPlaceholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  photoPlaceholderTitle: {
    marginTop: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.foreground,
  },
  photoPlaceholderText: {
    marginTop: 2,
    ...theme.typography.caption,
    color: theme.colors.muted,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
});
