import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {launchImageLibrary} from 'react-native-image-picker';

import {useAuth} from '../../auth/AuthContext';
import {uploadSingleImage} from '../../api/fileUpload';
import {
  createPengeluaran,
  type CreatePengeluaranRequest,
} from '../../api/keuangan';
import type {BsuFinanceStackParamList} from '../../navigation/stacks/BsuFinanceStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {AppDateField} from '../../components/ui/AppDateField';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<BsuFinanceStackParamList>;

function isValidDate(input: string): boolean {
  return !Number.isNaN(Date.parse(input));
}

export function BsuKeuanganAddPengeluaranScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [tanggal, setTanggal] = React.useState('');
  const [tujuan, setTujuan] = React.useState('');
  const [saldo, setSaldo] = React.useState('');
  const [bukti, setBukti] = React.useState('');

  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const bsuId = React.useMemo(() => {
    const id = Number(user?.idAkun);
    return Number.isFinite(id) ? id : NaN;
  }, [user?.idAkun]);

  const pickAndUploadBukti = async () => {
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
      setError('Foto bukti tidak berhasil dipilih.');
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
        'bukti-pengeluaran',
      );

      if (!uploadRes.success) {
        setError(uploadRes.message ?? 'Gagal mengunggah bukti pengeluaran.');
        return;
      }

      const url = uploadRes.data?.[0]?.path;
      if (!url) {
        setError('Hasil unggahan bukti tidak dapat dibaca.');
        return;
      }

      setBukti(url);
      Alert.alert('Berhasil', 'Bukti pengeluaran berhasil diunggah.');
    } catch {
      setError('Gagal mengunggah bukti pengeluaran. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

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
    const tujuanTrim = tujuan.trim();
    const saldoTrim = saldo.trim();
    const buktiTrim = bukti.trim();

    if (!tanggalTrim || !isValidDate(tanggalTrim)) {
      setError('Tanggal tidak valid.');
      return;
    }

    if (tujuanTrim.length < 3) {
      setError('Tujuan minimal 3 karakter.');
      return;
    }

    if (!saldoTrim || Number.isNaN(Number(saldoTrim))) {
      setError('Saldo harus berupa angka.');
      return;
    }

    if (!buktiTrim) {
      setError('Bukti pengeluaran wajib dipilih.');
      return;
    }

    const payload: CreatePengeluaranRequest = {
      bsuId,
      tanggal: tanggalTrim,
      tujuan: tujuanTrim,
      saldo: saldoTrim,
      bukti: buktiTrim,
    };

    setSubmitting(true);
    try {
      const res = await createPengeluaran(user.token, payload);
      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan pengeluaran.');
        return;
      }

      Alert.alert('Berhasil', 'Pengeluaran berhasil disimpan.');
      navigation.goBack();
    } catch {
      setError('Gagal menyimpan pengeluaran. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
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
    <Screen scroll>
      {error ? <InlineAlert message={error} /> : null}

      <Card>
        <Text style={styles.title}>Tambah Pengeluaran</Text>

        <AppDateField label="Tanggal" value={tanggal} onChange={setTanggal} />
        <AppTextField
          label="Tujuan"
          value={tujuan}
          onChangeText={setTujuan}
          placeholder="Contoh: Operasional"
        />
        <AppTextField
          label="Saldo"
          value={saldo}
          onChangeText={setSaldo}
          keyboardType="numeric"
          placeholder="Contoh: 25000"
        />
        <View style={styles.proofSection}>
          <Text style={styles.proofLabel}>Bukti Pengeluaran</Text>
          <Text style={styles.proofHelp}>
            Pilih foto nota atau struk pengeluaran yang terlihat jelas.
          </Text>

          {bukti ? (
            <Image
              source={{uri: bukti}}
              style={styles.proofImage}
              resizeMode="cover"
              accessibilityLabel="Pratinjau bukti pengeluaran"
            />
          ) : (
            <View style={styles.proofPlaceholder}>
              <Text style={styles.proofPlaceholderText}>
                Belum ada bukti yang dipilih
              </Text>
            </View>
          )}

          <AppButton
            title={bukti ? 'Ganti Bukti' : 'Pilih Bukti'}
            onPress={pickAndUploadBukti}
            loading={uploading}
            disabled={uploading || submitting}
            variant="secondary"
          />
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Simpan"
            onPress={onSubmit}
            loading={submitting}
            disabled={submitting || uploading}
          />
        </View>
      </Card>
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
  proofSection: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  proofLabel: {
    ...theme.typography.label,
    color: theme.colors.foreground,
  },
  proofHelp: {
    ...theme.typography.caption,
    color: theme.colors.muted,
  },
  proofImage: {
    width: '100%',
    height: 190,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceVariant,
  },
  proofPlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.inputBorder,
    backgroundColor: theme.colors.surfaceVariant,
  },
  proofPlaceholderText: {
    ...theme.typography.caption,
    color: theme.colors.muted,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
});
