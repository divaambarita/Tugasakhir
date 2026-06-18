import React from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {
  deleteBsuAdmin,
  getBsuAdminDetail,
  type BsuAdminDetail,
} from '../../api/bsu';
import type {AdminBsuStackParamList} from '../../navigation/stacks/AdminBsuStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {theme} from '../../components/ui/theme';

type R = RouteProp<AdminBsuStackParamList, 'AdminBsuDetail'>;

type Nav = NativeStackNavigationProp<AdminBsuStackParamList>;

export function AdminBsuDetailScreen(): React.JSX.Element {
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<BsuAdminDetail | null>(null);

  const idBsu = route.params.idBsu;

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const res = await getBsuAdminDetail(user.token, idBsu);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat detail BSU.');
      setData(null);
      return;
    }

    setData(res.data ?? null);
  }, [idBsu, user]);

  useFocusEffect(
    React.useCallback(() => {
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
    }, [load]),
  );

  const onDelete = async () => {
    if (!user) {
      return;
    }

    Alert.alert('Hapus BSU', 'Yakin ingin menghapus BSU ini?', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          setError(null);
          try {
            const res = await deleteBsuAdmin(user.token, idBsu);
            if (!res.success) {
              setError(res.message ?? 'Gagal menghapus BSU.');
              return;
            }

            Alert.alert('Sukses', 'BSU berhasil dihapus.');
            navigation.popToTop();
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat detail…</Text>
        </View>
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        {error ? <InlineAlert message={error} /> : null}
        <Text style={styles.meta}>Data tidak ditemukan.</Text>
      </Screen>
    );
  }

  const title = data.nama?.trim() ? data.nama : `BSU #${data.idBsu}`;
  const noTelp = data.noTelp?.trim() ? data.noTelp : '-';
  const alamat = data.alamat?.trim() ? data.alamat : '-';
  const kecamatan = data.kecamatan?.trim() ? data.kecamatan : '-';
  const kelurahan = data.kelurahan?.trim() ? data.kelurahan : '-';
  const status = data.status ?? '-';

  return (
    <Screen scroll>
      {error ? <InlineAlert message={error} /> : null}

      <Card style={styles.cardGap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>ID: {data.idBsu}</Text>
        <Text style={styles.meta}>No. Telp: {noTelp}</Text>
        <Text style={styles.meta}>Status: {status}</Text>
        <Text style={styles.meta}>
          Alamat: {alamat} ({kecamatan} / {kelurahan})
        </Text>
      </Card>

      <Card style={styles.cardGap}>
        <Text style={styles.sectionTitle}>Data BSU</Text>
        <View style={styles.actions}>
          <AppButton
            title="Edit BSU"
            variant="secondary"
            onPress={() => navigation.navigate('AdminBsuEdit', {idBsu})}
            disabled={deleting}
          />
          <AppButton
            title="Daftar Nasabah"
            variant="secondary"
            onPress={() =>
              navigation.navigate('AdminBsuNasabahList', {
                idBsu,
                bsuName: title,
              })
            }
            disabled={deleting}
          />
          <AppButton
            title="Daftar Pengurus"
            variant="secondary"
            onPress={() =>
              navigation.navigate('AdminBsuPengurusList', {
                idBsu,
                bsuName: title,
              })
            }
            disabled={deleting}
          />
          <AppButton
            title="Konfirmasi Penarikan"
            variant="secondary"
            onPress={() =>
              navigation.navigate('AdminBsuPenarikanRequests', {
                idBsu,
                bsuName: title,
              })
            }
            disabled={deleting}
          />
          <AppButton
            title="Hapus BSU"
            variant="destructive"
            onPress={onDelete}
            loading={deleting}
            disabled={deleting}
          />
        </View>
      </Card>

      {data.keteranganApprover ? (
        <Card style={styles.cardGap}>
          <Text style={styles.sectionTitle}>Keterangan Approver</Text>
          <Text style={styles.meta}>{data.keteranganApprover}</Text>
        </Card>
      ) : null}
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
  cardGap: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  meta: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  actions: {
    gap: theme.spacing.sm,
  },
});
