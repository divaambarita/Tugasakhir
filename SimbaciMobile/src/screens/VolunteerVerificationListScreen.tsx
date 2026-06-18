import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuth} from '../auth/AuthContext';
import {
  getBsuForVerification,
  getVolunteerStats,
  type VolunteerBsuRow,
  type VolunteerStats,
} from '../api/volunteer';
import type {VolunteerVerificationStackParamList} from '../navigation/stacks/VolunteerVerificationStackNavigator';
import {Card} from '../components/ui/Card';
import {InlineAlert} from '../components/ui/InlineAlert';
import {Screen} from '../components/ui/Screen';
import {SectionTitle} from '../components/ui/SectionTitle';
import {theme} from '../components/ui/theme';

type Nav = NativeStackNavigationProp<VolunteerVerificationStackParamList>;

type Row = {
  key: string;
  idBsu: number;
  title: string;
  subtitle: string;
  verified: boolean;
};

export function VolunteerVerificationListScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [stats, setStats] = React.useState<VolunteerStats | null>(null);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    if (user.roleName !== 'volunteer') {
      setError('Akses ditolak. Hanya Volunteer.');
      setRows([]);
      return;
    }

    setError(null);

    const [listRes, statsRes] = await Promise.all([
      getBsuForVerification(user.token, 'WaitApv'),
      getVolunteerStats(user.token, 'WaitApv'),
    ]);

    if (!listRes.success) {
      setError(listRes.message ?? 'Gagal memuat daftar BSU');
      setRows([]);
      setStats(null);
      return;
    }

    setStats(statsRes.success ? statsRes.data ?? null : null);

    const data: VolunteerBsuRow[] = listRes.data ?? [];
    setRows(
      data.map(item => ({
        key: String(item.idBsu),
        idBsu: item.idBsu,
        title: item.nama,
        subtitle: `${item.noTelp} • ${item.kecamatan ?? '-'} / ${
          item.kelurahan ?? '-'
        }`,
        verified: Boolean(item.hasilverifikasi),
      })),
    );
  }, [user]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text>Silakan login.</Text>
        </View>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Memuat daftar BSU…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionTitle title="Verifikasi" subtitle="Daftar BSU status WaitApv" />

      {error ? <InlineAlert message={error} /> : null}

      {stats ? (
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statsBox}>
              <Text style={styles.statsNumber}>{stats.totalSudahSurvey}</Text>
              <Text style={styles.statsLabel}>Sudah survey</Text>
            </View>
            <View style={styles.statsBox}>
              <Text style={styles.statsNumber}>{stats.totalBelumSurvey}</Text>
              <Text style={styles.statsLabel}>Belum survey</Text>
            </View>
            <View style={styles.statsBox}>
              <Text style={styles.statsNumber}>{stats.totalSayaSurvey}</Text>
              <Text style={styles.statsLabel}>Survey saya</Text>
            </View>
          </View>
        </Card>
      ) : null}

      <FlatList
        data={rows}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() =>
              navigation.navigate('VerificationForm', {
                bsuId: item.idBsu,
                bsuName: item.title,
              })
            }
            style={({pressed}) => [pressed ? styles.pressed : null]}>
            <Card style={styles.rowCard}>
              <View style={styles.rowTop}>
                <View style={styles.rowTopText}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    item.verified ? styles.badgeDone : styles.badgeTodo,
                  ]}>
                  <Text
                    style={[
                      styles.badgeText,
                      item.verified ? styles.badgeTextDone : styles.badgeTextTodo,
                    ]}>
                    {item.verified ? 'Sudah' : 'Belum'}
                  </Text>
                </View>
              </View>
              <Text style={styles.rowHint}>Tap untuk isi form verifikasi</Text>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Tidak ada BSU status WaitApv.</Text>
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
  pressed: {
    opacity: 0.85,
  },
  rowCard: {
    marginBottom: theme.spacing.sm,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowTopText: {
    flex: 1,
  },
  statsCard: {
    marginBottom: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsBox: {
    flex: 1,
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.foreground,
  },
  statsLabel: {
    marginTop: theme.spacing.xs,
    fontSize: 12,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.foreground,
  },
  rowSubtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
  },
  rowHint: {
    marginTop: theme.spacing.sm,
    fontSize: 12,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeDone: {
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.successOutline,
  },
  badgeTodo: {
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: theme.colors.outline,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  badgeTextDone: {
    color: theme.colors.onPrimaryContainer,
  },
  badgeTextTodo: {
    color: theme.colors.onSurface,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
