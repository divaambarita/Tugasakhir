import React from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
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

    if (buktiTrim.length < 3) {
      setError('Bukti minimal 3 karakter.');
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
        <AppTextField
          label="Bukti"
          value={bukti}
          onChangeText={setBukti}
          placeholder="Contoh: Nota #123"
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
