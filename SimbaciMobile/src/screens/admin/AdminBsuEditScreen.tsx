import React from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';

import {useAuth} from '../../auth/AuthContext';
import {
  getBsuAdminDetail,
  updateBsuAdmin,
  type UpdateBsuAdminRequest,
} from '../../api/bsu';
import type {AdminBsuStackParamList} from '../../navigation/stacks/AdminBsuStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type R = RouteProp<AdminBsuStackParamList, 'AdminBsuEdit'>;

export function AdminBsuEditScreen(): React.JSX.Element {
  const route = useRoute<R>();
  const {user} = useAuth();

  const idBsu = route.params.idBsu;

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [nama, setNama] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [noTelp, setNoTelp] = React.useState('');
  const [alamat, setAlamat] = React.useState('');
  const [kecamatan, setKecamatan] = React.useState('');
  const [kelurahan, setKelurahan] = React.useState('');

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const res = await getBsuAdminDetail(user.token, idBsu);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat data BSU.');
      return;
    }

    const data = res.data;
    if (!data) {
      setError('Data BSU tidak ditemukan.');
      return;
    }

    setNama(data.nama ?? '');
    setEmail(data.email ?? '');
    setNoTelp(data.noTelp ?? '');
    setAlamat(data.alamat ?? '');
    setKecamatan(data.kecamatan ?? '');
    setKelurahan(data.kelurahan ?? '');
  }, [idBsu, user]);

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

  const onSave = async () => {
    if (!user) {
      setError('Silakan login.');
      return;
    }

    setError(null);

    if (!nama.trim()) {
      setError('Nama BSU wajib diisi.');
      return;
    }

    if (noTelp.trim().length < 9) {
      setError('Nomor telepon minimal 9 karakter.');
      return;
    }

    const payload: UpdateBsuAdminRequest = {
      idBsu,
      nama: nama.trim(),
      email: email.trim() ? email.trim() : null,
      noTelp: noTelp.trim(),
      alamat: alamat.trim() ? alamat.trim() : null,
      kecamatan: kecamatan.trim() ? kecamatan.trim() : null,
      kelurahan: kelurahan.trim() ? kelurahan.trim() : null,
      foto: null,
      roleId: 4,
      saldo: null,
    };

    setSubmitting(true);
    try {
      const res = await updateBsuAdmin(user.token, payload);
      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan perubahan.');
        return;
      }

      Alert.alert('Sukses', 'Data BSU berhasil diupdate.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat data…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {error ? <InlineAlert message={error} /> : null}

      <Card>
        <AppTextField label="Nama" value={nama} onChangeText={setNama} />
        <AppTextField
          label="Email (opsional)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppTextField
          label="No. Telp"
          value={noTelp}
          onChangeText={setNoTelp}
          keyboardType="phone-pad"
        />
        <AppTextField
          label="Alamat (opsional)"
          value={alamat}
          onChangeText={setAlamat}
        />
        <AppTextField
          label="Kecamatan (opsional)"
          value={kecamatan}
          onChangeText={setKecamatan}
        />
        <AppTextField
          label="Kelurahan (opsional)"
          value={kelurahan}
          onChangeText={setKelurahan}
        />

        <View style={styles.actions}>
          <AppButton
            title="Simpan"
            onPress={onSave}
            loading={submitting}
            disabled={submitting}
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
  actions: {
    marginTop: theme.spacing.md,
  },
});
