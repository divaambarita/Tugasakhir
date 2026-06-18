import React from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';

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

function fasilitasToPayload(text: string): Array<Record<string, unknown>> {
  const items = text
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return items.map(name => ({name}));
}

export function VolunteerVerificationFormScreen(): React.JSX.Element {
  const route = useRoute<R>();
  const {user} = useAuth();

  const {bsuId, bsuName} = route.params;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [lokasi, setLokasi] = React.useState('');
  const [luasTempat, setLuasTempat] = React.useState('');
  const [kondisiBangunan, setKondisiBangunan] = React.useState('');
  const [fasilitasText, setFasilitasText] = React.useState('');
  const [fotoKunjunganUrl, setFotoKunjunganUrl] = React.useState('');

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
      setError(
        'Fitur pilih foto belum tersedia di build ini. Coba rebuild Android: `cd android && ./gradlew clean` lalu `npm run android`.',
      );
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

    setLoading(true);
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
        setError(uploadRes.message ?? 'Gagal upload foto');
        return;
      }

      const url = uploadRes.data?.[0]?.path;
      if (!url) {
        setError('Gagal membaca hasil upload.');
        return;
      }

      setFotoKunjunganUrl(url);
    } finally {
      setLoading(false);
    }
  };

  const validate = (): string | null => {
    if (!user) {
      return 'Silakan login.';
    }
    if (user.roleName !== 'volunteer') {
      return 'Akses ditolak. Hanya Volunteer.';
    }
    if (!lokasi.trim()) {
      return 'Lokasi wajib diisi.';
    }
    if (!luasTempat.trim()) {
      return 'Luas tempat wajib diisi.';
    }
    if (!kondisiBangunan.trim()) {
      return 'Kondisi bangunan wajib diisi.';
    }
    if (!fotoKunjunganUrl.trim()) {
      return 'Foto kunjungan wajib diupload.';
    }
    return null;
  };

  const submit = async () => {
    if (!user) {
      return;
    }

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
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

      Alert.alert('Berhasil', 'Verifikasi berhasil disimpan.');
    } finally {
      setLoading(false);
    }
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
        title="Form Verifikasi"
        subtitle={`${bsuName} (ID: ${bsuId})`}
      />

      {error ? <InlineAlert message={error} /> : null}

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Memproses…</Text>
        </View>
      ) : null}

      <Card style={styles.formCard}>
        <AppTextField
          label="Lokasi"
          value={lokasi}
          onChangeText={setLokasi}
          placeholder="Alamat / titik lokasi"
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
          placeholder="Contoh: baik"
        />

        <AppTextField
          label="Fasilitas (pisahkan dengan koma)"
          value={fasilitasText}
          onChangeText={setFasilitasText}
          placeholder="contoh: timbangan, karung, gerobak"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foto Kunjungan</Text>
          <AppButton
            title={fotoKunjunganUrl ? 'Foto Terupload' : 'Upload Foto'}
            onPress={pickAndUploadFoto}
            variant={fotoKunjunganUrl ? 'secondary' : 'primary'}
            disabled={loading}
          />
          {fotoKunjunganUrl ? (
            <Text style={styles.meta} numberOfLines={1}>
              {fotoKunjunganUrl}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Simpan"
            onPress={submit}
            disabled={loading}
            loading={loading}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  formCard: {
    borderRadius: theme.radius.lg,
  },
  section: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionTitle: {
    fontWeight: '900',
    marginBottom: theme.spacing.sm,
    color: theme.colors.foreground,
  },
  meta: {
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
});
