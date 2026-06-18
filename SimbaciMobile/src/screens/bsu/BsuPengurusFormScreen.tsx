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
  getPengurusDetail,
  upsertPengurus,
  type UpsertPengurusRequest,
} from '../../api/pengurus';
import type {BsuAnggotaStackParamList} from '../../navigation/stacks/BsuAnggotaStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {AppDateField} from '../../components/ui/AppDateField';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<BsuAnggotaStackParamList>;

type Props = NativeStackScreenProps<
  BsuAnggotaStackParamList,
  'BsuPengurusForm'
>;

type Gender = 'Male' | 'Female';

function normalizeDateInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  // Allow YYYY-MM-DD and pass through; backend accepts Date parsing.
  return trimmed;
}

export function BsuPengurusFormScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const {user} = useAuth();

  const idPengurus = route.params?.idPengurus;
  const isEdit = Boolean(idPengurus);

  const [loading, setLoading] = React.useState(isEdit);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [namaPengurus, setNamaPengurus] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [jenisKelamin, setJenisKelamin] = React.useState<Gender>('Male');
  const [noTelp, setNoTelp] = React.useState('');
  const [alamat, setAlamat] = React.useState('');
  const [tempatLahir, setTempatLahir] = React.useState('');
  const [tglLahir, setTglLahir] = React.useState('');
  const [jabatan, setJabatan] = React.useState('');
  const [pekerjaan, setPekerjaan] = React.useState('');

  React.useEffect(() => {
    if (!isEdit || !user || !idPengurus) {
      return;
    }

    let cancelled = false;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await getPengurusDetail(user.token, idPengurus);
        if (!res.success) {
          setError(res.message ?? 'Gagal memuat data pengurus');
          return;
        }
        const p = res.data;
        if (!p) {
          setError('Data pengurus tidak ditemukan.');
          return;
        }

        if (cancelled) {
          return;
        }

        setNamaPengurus((p.namaPengurus ?? p.nama ?? '') || '');
        setEmail(p.email ?? '');
        setJenisKelamin((p.jenisKelamin as Gender) ?? 'Male');
        setNoTelp(p.noTelp ?? '');
        setAlamat(p.alamat ?? '');
        setTempatLahir(p.tempatLahir ?? '');
        setTglLahir(p.tglLahir ? String(p.tglLahir).slice(0, 10) : '');
        setJabatan(p.jabatan ?? '');
        setPekerjaan(p.pekerjaan ?? '');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idPengurus, isEdit, user]);

  const onSubmit = async () => {
    if (!user) {
      return;
    }

    setError(null);

    if (!namaPengurus.trim()) {
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
    if (!jabatan.trim()) {
      setError('Jabatan wajib diisi.');
      return;
    }

    const payload: UpsertPengurusRequest = {
      ...(idPengurus ? {idPengurus} : {}),
      bsuId: Number(user.idAkun),
      namaPengurus: namaPengurus.trim(),
      email: email.trim() ? email.trim() : null,
      jenisKelamin,
      noTelp: noTelp.trim(),
      alamat: alamat.trim() ? alamat.trim() : null,
      tempatLahir: tempatLahir.trim(),
      tglLahir: normalizeDateInput(tglLahir),
      jabatan: jabatan.trim(),
      pekerjaan: pekerjaan.trim() ? pekerjaan.trim() : null,
    };

    setSubmitting(true);
    try {
      const res = await upsertPengurus(user.token, payload);
      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan pengurus');
        return;
      }

      Alert.alert(
        'Berhasil',
        isEdit ? 'Pengurus diperbarui.' : 'Pengurus ditambahkan.',
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
            label="Nama"
            value={namaPengurus}
            onChangeText={setNamaPengurus}
            placeholder="Nama pengurus"
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
            label="Jabatan"
            value={jabatan}
            onChangeText={setJabatan}
            placeholder="Jabatan"
          />
          <AppTextField
            label="Pekerjaan (opsional)"
            value={pekerjaan}
            onChangeText={setPekerjaan}
            placeholder="Pekerjaan"
          />

          <View style={styles.submitRow}>
            <AppButton
              title={isEdit ? 'Simpan Perubahan' : 'Tambah Pengurus'}
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
