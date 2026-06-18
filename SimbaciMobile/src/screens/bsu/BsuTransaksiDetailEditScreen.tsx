import React from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NavigationProp, ParamListBase} from '@react-navigation/native';

import {useAuth} from '../../auth/AuthContext';
import {updateTransaksiDetail} from '../../api/transaksi';
import {AppButton} from '../../components/ui/AppButton';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type EditParams = {
  transaksiId: number;
  jenisSampahId: number;
  berat: number;
  nasabahName?: string;
  jenisSampahName?: string;
};

type ParamList = {
  BsuTransaksiDetailEdit: EditParams;
};

type R = RouteProp<ParamList, 'BsuTransaksiDetailEdit'>;

function toNumber(input: string): number | null {
  const cleaned = input.replace(/,/g, '.').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function BsuTransaksiDetailEditScreen(): React.JSX.Element {
  const route = useRoute<R>();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const {user} = useAuth();

  const {transaksiId, jenisSampahId, berat, nasabahName, jenisSampahName} =
    route.params;

  const [beratText, setBeratText] = React.useState(
    Number.isFinite(Number(berat)) ? String(berat) : '',
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async () => {
    if (!user) {
      return;
    }

    setError(null);

    if (user.roleName !== 'bsu') {
      setError('Akses ditolak. Hanya BSU.');
      return;
    }

    const beratNum = toNumber(beratText);
    if (!beratNum || beratNum <= 0) {
      setError('Berat sampah harus lebih dari 0.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateTransaksiDetail(
        user.token,
        transaksiId,
        jenisSampahId,
        {
          jenisSampahId,
          beratsampah: beratNum,
        },
      );
      if (!res.success) {
        setError(res.message ?? 'Gagal mengupdate detail transaksi.');
        return;
      }

      Alert.alert('Berhasil', 'Detail transaksi berhasil diupdate.');
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Screen>
        <InlineAlert message="Silakan login terlebih dahulu." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {error ? <InlineAlert message={error} /> : null}

      <Card>
        <Text style={styles.title}>Edit Detail Transaksi</Text>
        <Text style={styles.meta}>Nasabah: {nasabahName ?? '-'}</Text>
        <Text style={styles.meta}>Jenis Sampah: {jenisSampahName ?? '-'}</Text>

        <View style={styles.formGap}>
          <AppTextField
            label="Berat (kg)"
            value={beratText}
            onChangeText={setBeratText}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <AppButton
          title="Simpan"
          onPress={onSubmit}
          loading={submitting}
          disabled={submitting}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  meta: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  formGap: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
});
