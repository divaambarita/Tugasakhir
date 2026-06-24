import React from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {deleteJenisSampah, upsertHargaSampahBsu} from '../../api/jenisSampah';
import type {BsuHargaSampahStackParamList} from '../../navigation/stacks/BsuHargaSampahStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type R = RouteProp<BsuHargaSampahStackParamList, 'BsuJenisSampahDetail'>;
type Nav = NativeStackNavigationProp<BsuHargaSampahStackParamList>;

export function BsuJenisSampahDetailScreen(): React.JSX.Element {
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const {idJenisSampah} = route.params;

  const [nama] = React.useState(route.params.nama);
  const [kategori] = React.useState(route.params.kategori);
  const [hargaBsi] = React.useState<number | null>(route.params.hargaBsi);

  const [hargaBsuText, setHargaBsuText] = React.useState(
    route.params.hargaBsu === null ? '' : String(route.params.hargaBsu),
  );

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const parseHargaBsu = (): number => {
    const normalized = hargaBsuText.trim().replace(/,/g, '.');
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return NaN;
    }
    return parsed;
  };

  const onSave = async () => {
    if (!user) {
      setError('Silakan login.');
      return;
    }

    setError(null);
    setSuccess(null);

    if (!hargaBsuText.trim()) {
      setError('Harga BSU wajib diisi.');
      return;
    }

    const hargaBsu = parseHargaBsu();
    if (Number.isNaN(hargaBsu)) {
      setError('Harga BSU harus berupa angka yang valid.');
      return;
    }

    if (hargaBsi !== null && hargaBsu < hargaBsi) {
      setError('Harga BSU tidak boleh lebih rendah daripada harga BSI.');
      return;
    }

    const bsuId = Number(user.idAkun);
    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await upsertHargaSampahBsu(user.token, {
        idJenisSampah,
        bsuId,
        nama,
        kategori,
        hargaBsi,
        hargaBsu,
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan perubahan.');
        return;
      }

      setSuccess('Harga BSU berhasil disimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteHargaBsu = async () => {
    if (!user) {
      return;
    }

    const bsuId = Number(user.idAkun);
    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      return;
    }

    Alert.alert(
      'Hapus Harga BSU',
      'Yakin ingin menghapus harga BSU untuk jenis sampah ini?',
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            setError(null);
            setSuccess(null);
            try {
              const res = await deleteJenisSampah(
                user.token,
                idJenisSampah,
                bsuId,
              );
              if (!res.success) {
                setError(res.message ?? 'Gagal menghapus data.');
                return;
              }
              navigation.goBack();
              Alert.alert(
                'Berhasil',
                'Jenis sampah berhasil dihapus dari daftar harga BSU.',
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen scroll>
      {error ? <InlineAlert message={error} /> : null}
      {success ? <InlineAlert tone="info" message={success} /> : null}

      <Card>
        <AppTextField label="Nama" value={nama} editable={false} />
        <AppTextField label="Kategori" value={kategori} editable={false} />
        <AppTextField
          label="Harga BSI"
          value={hargaBsi === null ? '-' : String(hargaBsi)}
          editable={false}
        />

        <AppTextField
          label="Harga BSU"
          value={hargaBsuText}
          onChangeText={setHargaBsuText}
          keyboardType="numeric"
          placeholder="Masukkan harga BSU"
        />

        <View style={styles.actions}>
          <AppButton
            title="Simpan"
            onPress={onSave}
            loading={submitting}
            disabled={submitting}
          />
          <AppButton
            title="Hapus Harga BSU"
            variant="destructive"
            onPress={onDeleteHargaBsu}
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
    gap: theme.spacing.sm,
  },
});
