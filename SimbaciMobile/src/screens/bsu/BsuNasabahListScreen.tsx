import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../../auth/AuthContext';
import {
  deleteNasabah,
  getNasabahByBsu,
  type NasabahBsu,
} from '../../api/nasabah';
import type {BsuAnggotaStackParamList} from '../../navigation/stacks/BsuAnggotaStackNavigator';
import {AppButton} from '../../components/ui/AppButton';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';

type Nav = NativeStackNavigationProp<BsuAnggotaStackParamList>;

type Row = {
  key: string;
  idNasabah: number;
  title: string;
  subtitle: string;
  meta?: string;
};

function getNamaNasabah(n: NasabahBsu): string {
  const anyN = n as any;
  const candidate =
    anyN?.nama ??
    anyN?.namaNasabah ??
    anyN?.nama_nasabah ??
    anyN?.nasabah?.nama ??
    anyN?.akun?.nama ??
    anyN?.akun?.namaAkun;
  const text = typeof candidate === 'string' ? candidate.trim() : '';
  return text || `Nasabah #${anyN?.idNasabah ?? '-'}`;
}

function getNoTelpNasabah(n: NasabahBsu): string {
  const anyN = n as any;
  const candidate =
    anyN?.noTelp ?? anyN?.no_telp ?? anyN?.telp ?? anyN?.telepon ?? anyN?.hp;
  const text = typeof candidate === 'string' ? candidate.trim() : '';
  return text;
}

function getNomorNasabah(n: NasabahBsu): string {
  const anyN = n as any;
  const candidate =
    anyN?.nomorNasabah ?? anyN?.nomor_nasabah ?? anyN?.noNasabah;
  const text = typeof candidate === 'string' ? candidate.trim() : '';
  return text;
}

function toRow(n: NasabahBsu): Row {
  const nomor = getNomorNasabah(n);
  const noTelp = getNoTelpNasabah(n);
  return {
    key: String(n.idNasabah),
    idNasabah: n.idNasabah,
    title: getNamaNasabah(n),
    subtitle: nomor
      ? `${noTelp || '-'} • ${nomor}`
      : noTelp || `ID: ${n.idNasabah}`,
    meta: `Saldo: ${Number(n.saldo ?? 0).toLocaleString('id-ID')}`,
  };
}

export function BsuNasabahListScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<NasabahBsu[]>([]);

  const rows = React.useMemo(() => items.map(toRow), [items]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    const idBsu = Number(user.idAkun);
    if (!Number.isFinite(idBsu) || idBsu <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      setItems([]);
      return;
    }

    const res = await getNasabahByBsu(user.token, idBsu);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat nasabah');
      setItems([]);
      return;
    }

    setItems(res.data ?? []);
  }, [user]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const onDelete = async (idNasabah: number) => {
    if (!user) {
      return;
    }

    setError(null);

    Alert.alert('Hapus nasabah?', 'Tindakan ini tidak bisa dibatalkan.', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const res = await deleteNasabah(user.token, idNasabah);
          if (!res.success) {
            setError(res.message ?? 'Gagal menghapus nasabah');
            return;
          }
          await load();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat nasabah…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {error ? <InlineAlert message={error} /> : null}

      <SectionTitle
        title="Anggota"
        subtitle="Daftar nasabah binaan di unit Anda"
      />

      <View style={styles.actionsRow}>
        <AppButton
          title="Tambah Nasabah"
          onPress={() => navigation.navigate('BsuNasabahForm')}
        />
      </View>

      <FlatList
        data={rows}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <Card style={styles.rowCard}>
            <Pressable
              onPress={() =>
                navigation.navigate('BsuNasabahForm', {
                  idNasabah: item.idNasabah,
                })
              }
              style={({pressed}) => [
                styles.rowPress,
                pressed ? styles.pressed : null,
              ]}>
              <View style={styles.rowTop}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                {item.meta ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.meta}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>

            <View style={styles.rowButtons}>
              <AppButton
                title="Edit"
                variant="secondary"
                onPress={() =>
                  navigation.navigate('BsuNasabahForm', {
                    idNasabah: item.idNasabah,
                  })
                }
              />
              <AppButton
                title="Hapus"
                variant="destructive"
                onPress={() => onDelete(item.idNasabah)}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Tidak ada data nasabah.</Text>
        }
      />
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
  actionsRow: {
    marginBottom: theme.spacing.sm,
  },
  rowCard: {
    marginBottom: theme.spacing.sm,
  },
  rowPress: {
    flexDirection: 'row',
    width: '100%',
  },
  rowTop: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  pressed: {
    opacity: 0.9,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.onSurface,
  },
  rowSubtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.onSurfaceVariant,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primaryOutlineSoft,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.onPrimaryContainer,
  },
  rowButtons: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
