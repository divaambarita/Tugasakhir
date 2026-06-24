import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Ruler,
  ShieldCheck,
  Warehouse,
} from 'lucide-react-native';

import {useAuth} from '../auth/AuthContext';
import {getVolunteerRiwayat, type VolunteerRiwayatRow} from '../api/volunteer';
import type {VolunteerHistoryStackParamList} from '../navigation/stacks/VolunteerHistoryStackNavigator';
import {AppButton} from '../components/ui/AppButton';
import {Card} from '../components/ui/Card';
import {EmptyState} from '../components/ui/EmptyState';
import {InlineAlert} from '../components/ui/InlineAlert';
import {Screen} from '../components/ui/Screen';
import {SectionTitle} from '../components/ui/SectionTitle';
import {theme} from '../components/ui/theme';

type Row = VolunteerRiwayatRow & {key: string};
type Nav = NativeStackNavigationProp<VolunteerHistoryStackParamList>;

function fasilitasToText(value: unknown): string {
  if (!Array.isArray(value)) {
    return '';
  }

  return value
    .map(item => {
      if (typeof item === 'string') {
        return item;
      }
      if (!item || typeof item !== 'object') {
        return '';
      }

      const facility = item as Record<string, unknown>;
      if ('value' in facility && facility.value !== true) {
        return '';
      }

      const name = facility.nama ?? facility.name;
      return typeof name === 'string' ? name : '';
    })
    .filter(Boolean)
    .join(', ');
}

function formatDateTime(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusLabel(status?: string | null): string {
  if (status === 'Approved') {
    return 'Disetujui';
  }
  if (status === 'Rejected') {
    return 'Ditolak';
  }
  if (status === 'WaitApv') {
    return 'Menunggu Persetujuan';
  }
  return status || 'Status belum tersedia';
}

export function VolunteerRiwayatScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Row[]>([]);

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
    const res = await getVolunteerRiwayat(user.token);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat riwayat survei');
      setRows([]);
      return;
    }

    const data = res.data ?? [];
    setRows(
      data.map(item => ({
        ...item,
        key: String(item.idHasilVerifikasi),
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
          <Text style={styles.centerText}>Memuat riwayat…</Text>
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
              title="Riwayat Survei"
              subtitle="Dokumentasi hasil kunjungan yang sudah Anda kirim."
            />

            {error ? <InlineAlert message={error} /> : null}

            <Card style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <ShieldCheck color={theme.colors.onPrimary} size={25} />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.summaryNumber}>{rows.length}</Text>
                <Text style={styles.summaryLabel}>Total survei terkirim</Text>
              </View>
              <CheckCircle2 color={theme.colors.onPrimary} size={30} />
            </Card>

            <View style={styles.listHeading}>
              <Text style={styles.listTitle}>Hasil Kunjungan</Text>
              <Text style={styles.listCount}>{rows.length} data</Text>
            </View>
          </View>
        }
        renderItem={({item}) => {
          const bsuName = item.bsu?.nama ?? `BSU #${item.bsuId}`;
          const lokasi =
            item.bsu?.kecamatan || item.bsu?.kelurahan
              ? [item.bsu?.kelurahan, item.bsu?.kecamatan]
                  .filter(Boolean)
                  .join(', ')
              : '-';
          const status = item.bsu?.status;
          const isApproved = status === 'Approved';
          const isRejected = status === 'Rejected';
          return (
            <Card style={styles.rowCard}>
              <View style={styles.rowTop}>
                <View style={styles.buildingIcon}>
                  <Building2 color={theme.colors.primary} size={22} />
                </View>
                <View style={styles.rowTopText}>
                  <Text style={styles.rowTitle}>{bsuName}</Text>
                  <View style={styles.detailRow}>
                    <MapPin color={theme.colors.muted} size={15} />
                    <Text style={styles.detailText}>{lokasi}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.badge,
                    isApproved
                      ? styles.badgeApproved
                      : isRejected
                      ? styles.badgeRejected
                      : styles.badgeWaiting,
                  ]}>
                  <Text
                    style={[
                      styles.badgeText,
                      isApproved
                        ? styles.badgeTextApproved
                        : isRejected
                        ? styles.badgeTextRejected
                        : styles.badgeTextWaiting,
                    ]}>
                    {statusLabel(status)}
                  </Text>
                </View>
              </View>

              {item.fotoKunjungan ? (
                <Image
                  source={{uri: item.fotoKunjungan}}
                  style={styles.photo}
                  resizeMode="cover"
                  accessibilityLabel={`Dokumentasi kunjungan ${bsuName}`}
                />
              ) : null}

              <View style={styles.surveyLocation}>
                <MapPin color={theme.colors.primary} size={17} />
                <View style={styles.surveyLocationText}>
                  <Text style={styles.metaLabel}>Lokasi kunjungan</Text>
                  <Text style={styles.metaValue}>{item.lokasi || '-'}</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                  <Ruler color={theme.colors.accent} size={18} />
                  <Text style={styles.infoLabel}>Luas tempat</Text>
                  <Text style={styles.infoValue}>{item.luasTempat || '-'}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Warehouse color={theme.colors.accent} size={18} />
                  <Text style={styles.infoLabel}>Kondisi</Text>
                  <Text style={styles.infoValue} numberOfLines={2}>
                    {item.kondisiBangunan || '-'}
                  </Text>
                </View>
              </View>

              <View style={styles.dateRow}>
                <CalendarDays color={theme.colors.muted} size={15} />
                <Text style={styles.dateText}>
                  Dikirim {formatDateTime(item.updatedAt)}
                </Text>
              </View>

              {status === 'WaitApv' ? (
                <AppButton
                  title="Edit Hasil Survei"
                  variant="secondary"
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate('VerificationForm', {
                      bsuId: item.bsuId,
                      bsuName,
                      mode: 'edit',
                      initialData: {
                        lokasi: item.lokasi ?? '',
                        luasTempat: item.luasTempat ?? '',
                        kondisiBangunan: item.kondisiBangunan ?? '',
                        fasilitasText: fasilitasToText(item.fasilitas),
                        fotoKunjunganUrl: item.fotoKunjungan ?? '',
                      },
                    })
                  }
                />
              ) : null}
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="Belum ada riwayat survei"
            description="Hasil verifikasi yang sudah dikirim akan tersimpan di halaman ini."
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
  rowCard: {
    marginBottom: theme.spacing.md,
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.onPrimaryRipple,
  },
  summaryText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.onPrimary,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.onPrimary,
    opacity: 0.85,
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
  photo: {
    width: '100%',
    height: 170,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceVariant,
  },
  surveyLocation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  surveyLocationText: {
    flex: 1,
  },
  metaLabel: {
    ...theme.typography.caption,
    color: theme.colors.muted,
  },
  metaValue: {
    marginTop: 2,
    ...theme.typography.body,
    color: theme.colors.foreground,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  infoBox: {
    flex: 1,
    minHeight: 94,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceVariant,
  },
  infoLabel: {
    marginTop: theme.spacing.xs,
    ...theme.typography.caption,
    color: theme.colors.muted,
  },
  infoValue: {
    marginTop: 2,
    ...theme.typography.body,
    color: theme.colors.foreground,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.muted,
  },
  editButton: {
    marginTop: theme.spacing.md,
  },
  badge: {
    maxWidth: 105,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeApproved: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.successOutline,
  },
  badgeRejected: {
    backgroundColor: theme.colors.errorContainer,
    borderColor: theme.colors.errorOutline,
  },
  badgeWaiting: {
    backgroundColor: theme.colors.warningSoft,
    borderColor: theme.colors.warning,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  badgeTextApproved: {
    color: theme.colors.accent,
  },
  badgeTextRejected: {
    color: theme.colors.error,
  },
  badgeTextWaiting: {
    color: theme.colors.warning,
  },
});
