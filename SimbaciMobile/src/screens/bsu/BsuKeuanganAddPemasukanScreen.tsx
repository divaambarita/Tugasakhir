import React from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {
  createPemasukanLainnya,
  type CreatePemasukanLainnyaRequest,
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

export function BsuKeuanganAddPemasukanScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [tanggal, setTanggal] = React.useState('');
  const [tujuan, setTujuan] = React.useState('');
  const [saldo, setSaldo] = React.useState('');
  const [keterangan, setKeterangan] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const bsuId = React.useMemo(() => {
    const id = Number(user?.idAkun);
    return Number.isFinite(id) ? id : NaN;
  }, [user?.idAkun]);

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
    const ketTrim = keterangan.trim();

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

    if (ketTrim.length < 3) {
      setError('Keterangan minimal 3 karakter.');
      return;
    }

    const payload: CreatePemasukanLainnyaRequest = {
      bsuId,
      tanggal: tanggalTrim,
      tujuan: tujuanTrim,
      saldo: saldoTrim,
      keterangan: ketTrim,
    };

    setSubmitting(true);
    try {
      const res = await createPemasukanLainnya(user.token, payload);
      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan pemasukan.');
        return;
      }

      Alert.alert('Berhasil', 'Pemasukan berhasil disimpan.');
      navigation.goBack();
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
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <Card>
        <Text style={styles.title}>Tambah Pemasukan</Text>

        <AppDateField label="Tanggal" value={tanggal} onChange={setTanggal} />
        <AppTextField
          label="Tujuan"
          value={tujuan}
          onChangeText={setTujuan}
          placeholder="Contoh: Donasi / Sponsor"
        />
        <AppTextField
          label="Saldo"
          value={saldo}
          onChangeText={setSaldo}
          keyboardType="numeric"
          placeholder="Contoh: 50000"
        />
        <AppTextField
          label="Keterangan"
          value={keterangan}
          onChangeText={setKeterangan}
          placeholder="Catatan pemasukan"
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
  actions: {
    marginTop: theme.spacing.md,
  },
});
