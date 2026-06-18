import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {
  getNasabahDetail,
  upsertNasabah,
  type UpsertNasabahRequest,
} from '../../api/nasabah';
import type {BsuAnggotaStackParamList} from '../../navigation/stacks/BsuAnggotaStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {AppDateField} from '../../components/ui/AppDateField';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<BsuAnggotaStackParamList>;

type Props = NativeStackScreenProps<BsuAnggotaStackParamList, 'BsuNasabahForm'>;

type Gender = 'Male' | 'Female';

function normalizeDateInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed;
}

function toIsoDateString(dateLike: string): string | null {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString();
}

export function BsuNasabahFormScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const {user} = useAuth();

  const idNasabah = route.params?.idNasabah;
  const isEdit = Boolean(idNasabah);

  const [loading, setLoading] = React.useState(isEdit);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [nomorNasabah, setNomorNasabah] = React.useState('');
  const [nama, setNama] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [jenisKelamin, setJenisKelamin] = React.useState<Gender>('Male');
  const [nik, setNik] = React.useState('');
  const [noTelp, setNoTelp] = React.useState('');
  const [alamat, setAlamat] = React.useState('');
  const [tempatLahir, setTempatLahir] = React.useState('');
  const [tglLahir, setTglLahir] = React.useState('');
  const [kelurahan, setKelurahan] = React.useState('');
  const [kecamatan, setKecamatan] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    if (!isEdit || !user || !idNasabah) {
      return;
    }

    let cancelled = false;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await getNasabahDetail(user.token, idNasabah);
        if (!res.success) {
          setError(res.message ?? 'Gagal memuat data nasabah');
          return;
        }

        const n = res.data;
        if (!n) {
          setError('Data nasabah tidak ditemukan.');
          return;
        }

        if (cancelled) {
          return;
        }

        setNomorNasabah(n.nomorNasabah ?? '');
        setNama(n.nama ?? '');
        setEmail(n.email ?? '');
        setJenisKelamin((n.jenisKelamin as Gender) ?? 'Male');
        setNik(n.Nik ?? '');
        setNoTelp(n.noTelp ?? '');
        setAlamat(n.alamat ?? '');
        setTempatLahir(n.tempatLahir ?? '');
        setTglLahir(n.tglLahir ? String(n.tglLahir).slice(0, 10) : '');
        setKelurahan(n.kelurahan ?? '');
        setKecamatan(n.kecamatan ?? '');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idNasabah, isEdit, user]);

  const onSubmit = async () => {
    if (!user) {
      return;
    }

    setError(null);

    if (!nama.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    if (noTelp.trim().length < 9) {
      setError('No. Telp minimal 9 digit.');
      return;
    }
    if (!tempatLahir.trim()) {
      setError('Tempat lahir wajib diisi.');
      return;
    }
    if (!normalizeDateInput(tglLahir)) {
      setError('Tanggal lahir wajib diisi.');
      return;
    }

    const tglLahirIso = toIsoDateString(normalizeDateInput(tglLahir));
    if (!tglLahirIso) {
      setError('Tanggal lahir tidak valid.');
      return;
    }
    if (!nik.trim()) {
      setError('NIK wajib diisi.');
      return;
    }
    if (!isEdit && password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    const payload: UpsertNasabahRequest = {
      fromBsu: 1,
      ...(idNasabah ? {idNasabah} : {}),
      nomorNasabah: nomorNasabah.trim(),
      nama: nama.trim(),
      email: email.trim() ? email.trim() : null,
      jenisKelamin,
      Nik: nik.trim(),
      noTelp: noTelp.trim(),
      alamat: alamat.trim() ? alamat.trim() : null,
      tempatLahir: tempatLahir.trim(),
      tglLahir: tglLahirIso,
      kelurahan: kelurahan.trim() ? kelurahan.trim() : null,
      kecamatan: kecamatan.trim() ? kecamatan.trim() : null,
      foto: null,
      saldo: null,
      ...(password.trim() ? {password: password.trim()} : {}),
      roleId: 6,
      bsuId: Number(user.idAkun),
    };

    setSubmitting(true);
    try {
      const res = await upsertNasabah(payload, user.token);
      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan nasabah');
        return;
      }

      Alert.alert(
        'Berhasil',
        isEdit ? 'Nasabah diperbarui.' : 'Nasabah ditambahkan.',
      );
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
    <Screen scroll>
      {error ? <InlineAlert message={error} /> : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kb}>
        <Card>
          <AppTextField
            label="Nomor Nasabah (opsional)"
            value={nomorNasabah}
            onChangeText={setNomorNasabah}
            placeholder="Biarkan kosong jika belum ada"
          />
          <AppTextField
            label="Nama"
            value={nama}
            onChangeText={setNama}
            placeholder="Nama lengkap"
          />
          <AppTextField
            label="Email (opsional)"
            value={email}
            onChangeText={setEmail}
            placeholder="email@contoh.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Jenis Kelamin</Text>
          <View style={styles.genderRow}>
            <AppButton
              title="Laki-laki"
              onPress={() => setJenisKelamin('Male')}
              variant={jenisKelamin === 'Male' ? 'primary' : 'secondary'}
              style={styles.genderBtn}
            />
            <AppButton
              title="Perempuan"
              onPress={() => setJenisKelamin('Female')}
              variant={jenisKelamin === 'Female' ? 'primary' : 'secondary'}
              style={styles.genderBtn}
            />
          </View>

          <AppTextField
            label="NIK"
            value={nik}
            onChangeText={setNik}
            placeholder="NIK"
            keyboardType="number-pad"
          />
          <AppTextField
            label="No. Telp"
            value={noTelp}
            onChangeText={setNoTelp}
            placeholder="08xxxxxxxxxx"
            keyboardType="phone-pad"
          />
          <AppTextField
            label="Alamat (opsional)"
            value={alamat}
            onChangeText={setAlamat}
            placeholder="Alamat"
          />
          <AppTextField
            label="Tempat Lahir"
            value={tempatLahir}
            onChangeText={setTempatLahir}
            placeholder="Tempat lahir"
          />
          <AppDateField
            label="Tanggal Lahir"
            value={tglLahir}
            onChange={setTglLahir}
            maximumDate={new Date()}
          />
          <AppTextField
            label="Kelurahan (opsional)"
            value={kelurahan}
            onChangeText={setKelurahan}
            placeholder="Kelurahan"
          />
          <AppTextField
            label="Kecamatan (opsional)"
            value={kecamatan}
            onChangeText={setKecamatan}
            placeholder="Kecamatan"
          />

          <AppTextField
            label={isEdit ? 'Password (opsional)' : 'Password'}
            value={password}
            onChangeText={setPassword}
            placeholder={
              isEdit ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'
            }
            secureTextEntry
          />

          <View style={styles.submitRow}>
            <AppButton
              title={isEdit ? 'Simpan Perubahan' : 'Tambah Nasabah'}
              onPress={onSubmit}
              loading={submitting}
              disabled={submitting}
            />
          </View>
        </Card>
      </KeyboardAvoidingView>
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
  kb: {
    flex: 1,
  },
  label: {
    marginTop: theme.spacing.sm,
    color: theme.colors.foreground,
    fontWeight: '900',
  },
  genderRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  genderBtn: {
    flex: 1,
  },
  submitRow: {
    marginTop: theme.spacing.md,
  },
});
