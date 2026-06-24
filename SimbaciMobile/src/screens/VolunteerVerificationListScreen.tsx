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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  Building2,
  ChevronRight,
  ClipboardCheck,
  MapPin,
  Phone,
} from 'lucide-react-native';

import {useAuth} from '../auth/AuthContext';
import {
  getBsuForVerification,
  getVolunteerStats,
  type VolunteerBsuRow,
  type VolunteerStats,
} from '../api/volunteer';
import type {VolunteerVerificationStackParamList} from '../navigation/stacks/VolunteerVerificationStackNavigator';
import {Card} from '../components/ui/Card';
import {EmptyState} from '../components/ui/EmptyState';
import {InlineAlert} from '../components/ui/InlineAlert';
import {Screen} from '../components/ui/Screen';
import {SectionTitle} from '../components/ui/SectionTitle';
import {theme} from '../components/ui/theme';

type Nav = NativeStackNavigationProp<VolunteerVerificationStackParamList>;

type Row = {
  key: string;
  idBsu: number;
  name: string;
  phone: string;
  location: string;
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
        name: item.nama,
        phone: item.noTelp || '-',
        location:
          [item.kelurahan, item.kecamatan].filter(Boolean).join(', ') || '-',
        verified: Boolean(item.hasilverifikasi),
      })),
    );
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
      <FlatList
        data={rows}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <SectionTitle
              title="Tugas Verifikasi"
              subtitle="Survei BSU yang ditugaskan dan kirim dokumentasi kunjungan."
            />

            {error ? <InlineAlert message={error} /> : null}

            {stats ? (
              <Card style={styles.statsCard}>
                <View style={styles.statsHeading}>
                  <View style={styles.statsIcon}>
                    <ClipboardCheck color={theme.colors.onPrimary} size={22} />
                  </View>
                  <View style={styles.statsHeadingText}>
                    <Text style={styles.statsTitle}>Ringkasan Tugas</Text>
                    <Text style={styles.statsSubtitle}>
                      Pantau progres survei Anda
                    </Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statsBox}>
                    <Text style={styles.statsNumber}>
                      {stats.totalBelumSurvey}
                    </Text>
                    <Text style={styles.statsLabel}>Perlu disurvei</Text>
                  </View>
                  <View style={styles.statsDivider} />
                  <View style={styles.statsBox}>
                    <Text style={styles.statsNumber}>
                      {stats.totalSudahSurvey}
                    </Text>
                    <Text style={styles.statsLabel}>Sudah disurvei</Text>
                  </View>
                  <View style={styles.statsDivider} />
                  <View style={styles.statsBox}>
                    <Text style={styles.statsNumber}>
                      {stats.totalSayaSurvey}
                    </Text>
                    <Text style={styles.statsLabel}>Survei saya</Text>
                  </View>
                </View>
              </Card>
            ) : null}

            <View style={styles.listHeading}>
              <Text style={styles.listTitle}>Daftar BSU</Text>
              <Text style={styles.listCount}>{rows.length} tugas</Text>
            </View>
          </View>
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() =>
              navigation.navigate('VerificationForm', {
                bsuId: item.idBsu,
                bsuName: item.name,
              })
            }
            style={({pressed}) => [pressed ? styles.pressed : null]}>
            <Card style={styles.rowCard}>
              <View style={styles.rowTop}>
                <View style={styles.buildingIcon}>
                  <Building2 color={theme.colors.primary} size={22} />
                </View>
                <View style={styles.rowTopText}>
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  <View style={styles.detailRow}>
                    <MapPin color={theme.colors.muted} size={15} />
                    <Text style={styles.detailText} numberOfLines={2}>
                      {item.location}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone color={theme.colors.muted} size={15} />
                    <Text style={styles.detailText}>{item.phone}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.badge,
                    item.verified ? styles.badgeDone : styles.badgeTodo,
                  ]}>
                  <Text
                    style={[
                      styles.badgeText,
                      item.verified
                        ? styles.badgeTextDone
                        : styles.badgeTextTodo,
                    ]}>
                    {item.verified ? 'Selesai' : 'Ditugaskan'}
                  </Text>
                </View>
              </View>
              <View style={styles.rowAction}>
                <Text style={styles.rowHint}>Isi hasil kunjungan</Text>
                <ChevronRight color={theme.colors.primary} size={18} />
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Tidak ada tugas verifikasi"
            description="Daftar BSU baru yang perlu disurvei akan muncul di halaman ini."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: theme.spacing.xl,
    flexGrow: 1,
  },
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
    padding: theme.spacing.md,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  rowTopText: {
    flex: 1,
  },
  buildingIcon: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accentSoft,
  },
  statsCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statsIcon: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.onPrimaryRipple,
  },
  statsHeadingText: {
    marginLeft: theme.spacing.sm,
  },
  statsTitle: {
    ...theme.typography.titleMedium,
    color: theme.colors.onPrimary,
  },
  statsSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.onPrimary,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsBox: {
    flex: 1,
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.onPrimary,
  },
  statsLabel: {
    marginTop: theme.spacing.xs,
    fontSize: 11,
    color: theme.colors.onPrimary,
    fontWeight: '700',
    textAlign: 'center',
    opacity: 0.85,
  },
  statsDivider: {
    width: 1,
    height: 38,
    backgroundColor: theme.colors.onPrimaryDivider,
  },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  listTitle: {
    ...theme.typography.titleMedium,
    color: theme.colors.foreground,
  },
  listCount: {
    ...theme.typography.caption,
    color: theme.colors.muted,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.foreground,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  detailText: {
    flex: 1,
    ...theme.typography.caption,
    color: theme.colors.muted,
    fontWeight: '600',
  },
  rowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  rowHint: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '800',
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
});
