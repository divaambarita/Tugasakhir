import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useAuth} from '../../auth/AuthContext';
import {getBsuAdminDetail, updateBsuProfile} from '../../api/bsu';
import {AppButton} from '../../components/ui/AppButton';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';

type DayKey =
  | 'senin'
  | 'selasa'
  | 'rabu'
  | 'kamis'
  | 'jumat'
  | 'sabtu'
  | 'minggu';

type ProfileDraft = {
  nama: string;
  alamat: string;
  fotoUrl: string;
  days: Record<DayKey, boolean>;
  jamMulai: string;
  jamSelesai: string;
};

const DAYS: Array<{key: DayKey; label: string}> = [
  {key: 'senin', label: 'Senin'},
  {key: 'selasa', label: 'Selasa'},
  {key: 'rabu', label: 'Rabu'},
  {key: 'kamis', label: 'Kamis'},
  {key: 'jumat', label: 'Jumat'},
  {key: 'sabtu', label: 'Sabtu'},
  {key: 'minggu', label: 'Minggu'},
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function normalizeTimeLike(input: string): string {
  const s = String(input ?? '').trim();
  if (!s) {
    return '';
  }

  const parts = s.split(':');
  if (parts.length !== 2) {
    return '';
  }

  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return '';
  }
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    return '';
  }
  return `${pad2(h)}:${pad2(m)}`;
}

function isValidTimeHHmm(s: string): boolean {
  return Boolean(normalizeTimeLike(s));
}

function getDefaultDayMap(): Record<DayKey, boolean> {
  return {
    senin: false,
    selasa: false,
    rabu: false,
    kamis: false,
    jumat: false,
    sabtu: false,
    minggu: false,
  };
}

function dayMapFromApi(hari: unknown): Record<DayKey, boolean> {
  const map = getDefaultDayMap();
  if (!Array.isArray(hari)) {
    return map;
  }

  for (const item of hari) {
    const key = (item as any)?.key as DayKey;
    const value = Boolean((item as any)?.value);
    if (key && key in map) {
      map[key] = value;
    }
  }

  return map;
}

export function BsuProfileScreen(): React.JSX.Element {
  const {user, logout} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [isEditing, setIsEditing] = React.useState(false);
  const [saved, setSaved] = React.useState<ProfileDraft | null>(null);
  const [draft, setDraft] = React.useState<ProfileDraft>({
    nama: '',
    alamat: '',
    fotoUrl: '',
    days: getDefaultDayMap(),
    jamMulai: '',
    jamSelesai: '',
  });

  const bsuId = React.useMemo(() => {
    const id = Number(user?.idAkun);
    return Number.isFinite(id) ? id : NaN;
  }, [user?.idAkun]);

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }

    setError(null);

    if (user.roleName !== 'bsu') {
      setError('Akses ditolak. Hanya BSU.');
      return;
    }

    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      return;
    }

    const res = await getBsuAdminDetail(user.token, bsuId);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat profil BSU.');
      return;
    }

    const data: any = res.data;
    const jadwal: any = data?.jadwal;

    const next: ProfileDraft = {
      nama: String(data?.nama ?? ''),
      alamat: String(data?.alamat ?? ''),
      fotoUrl: String(data?.foto ?? ''),
      days: dayMapFromApi(jadwal?.hari),
      jamMulai: normalizeTimeLike(String(jadwal?.jamMulai ?? '')),
      jamSelesai: normalizeTimeLike(String(jadwal?.jamSelesai ?? '')),
    };

    setSaved(next);
    setDraft(next);
    setIsEditing(false);
  }, [bsuId, user]);

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

  const toggleDay = (key: DayKey) => {
    setDraft(prev => ({...prev, days: {...prev.days, [key]: !prev.days[key]}}));
  };

  const onCancelEdit = () => {
    if (saved) {
      setDraft(saved);
    }
    setError(null);
    setIsEditing(false);
  };

  const submit = async () => {
    if (!user) {
      return;
    }

    setError(null);

    if (user.roleName !== 'bsu') {
      setError('Akses ditolak. Hanya BSU.');
      return;
    }

    const namaTrim = draft.nama.trim();
    const alamatTrim = draft.alamat.trim();

    if (namaTrim.length < 3) {
      setError('Nama Bank Sampah minimal 3 karakter.');
      return;
    }

    if (alamatTrim.length < 3) {
      setError('Alamat minimal 3 karakter.');
      return;
    }

    if (!isValidTimeHHmm(draft.jamMulai)) {
      setError('Jam mulai tidak valid. Gunakan format HH:MM.');
      return;
    }

    if (!isValidTimeHHmm(draft.jamSelesai)) {
      setError('Jam selesai tidak valid. Gunakan format HH:MM.');
      return;
    }

    const jamMulaiNorm = normalizeTimeLike(draft.jamMulai);
    const jamSelesaiNorm = normalizeTimeLike(draft.jamSelesai);

    if (jamMulaiNorm === jamSelesaiNorm) {
      setError('Jam mulai dan jam selesai tidak boleh sama.');
      return;
    }

    if (!Number.isFinite(bsuId) || bsuId <= 0) {
      setError('ID BSU tidak valid. Silakan login ulang.');
      return;
    }

    const arrHari = DAYS.map(d => ({
      key: d.key,
      nama: d.label,
      value: Boolean(draft.days[d.key]),
    }));

    setSaving(true);
    try {
      const res = await updateBsuProfile(user.token, {
        idAkun: bsuId,
        noTelp: user.noTelp,
        nama: namaTrim,
        alamat: alamatTrim,
        foto: draft.fotoUrl.trim() ? draft.fotoUrl.trim() : null,
        jadwal: {
          hari: JSON.stringify(arrHari),
          jamMulai: jamMulaiNorm,
          jamSelesai: jamSelesaiNorm,
          bsuId,
        },
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan profil.');
        return;
      }

      Alert.alert('Berhasil', 'Profil berhasil disimpan.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const scheduleSummary = React.useMemo(() => {
    const source = saved ?? draft;
    const activeDays = DAYS.filter(d => source.days[d.key]).map(d => d.label);
    const dayText = activeDays.length ? activeDays.join(', ') : '-';
    const timeText =
      source.jamMulai && source.jamSelesai
        ? `${source.jamMulai} - ${source.jamSelesai}`
        : '-';
    return {dayText, timeText};
  }, [draft, saved]);

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
          <Text style={styles.centerText}>Memuat profil…</Text>
        </View>
      </Screen>
    );
  }

  if (!saved) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text>Data tidak tersedia.</Text>
        </View>
      </Screen>
    );
  }

  if (!isEditing) {
    return (
      <Screen scroll>
        <SectionTitle
          title="Profil"
          subtitle="Informasi Bank Sampah dan akun yang sedang aktif"
        />

        {error ? <InlineAlert message={error} /> : null}

        <Card style={styles.profileCard}>
          <View style={styles.identity}>
            <Text style={styles.identityName}>{saved.nama || '-'}</Text>
            <Text style={styles.identityRole}>Bank Sampah Unit</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Alamat</Text>
            <Text style={styles.value}>{saved.alamat || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>No. Telp</Text>
            <Text style={styles.value}>{user.noTelp || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID Akun</Text>
            <Text style={styles.value}>{user.idAkun}</Text>
          </View>

          <View style={styles.actions}>
            <AppButton title="Edit Profil" onPress={() => setIsEditing(true)} />
          </View>
        </Card>

        <Card style={styles.cardSpacing}>
          <Text style={styles.sectionTitle}>Jadwal Operasional</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Hari</Text>
            <Text style={styles.value}>{scheduleSummary.dayText}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Jam</Text>
            <Text style={styles.value}>{scheduleSummary.timeText}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.actions}>
            <AppButton title="Logout" onPress={logout} variant="destructive" />
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <SectionTitle
        title="Edit Profil"
        subtitle="Perbarui informasi Bank Sampah dan jadwal operasional"
      />

      {error ? <InlineAlert message={error} /> : null}

      <Card style={styles.profileCard}>
        <View style={styles.identity}>
          <Text style={styles.identityName}>
            {draft.nama || saved.nama || '-'}
          </Text>
          <Text style={styles.identityRole}>Bank Sampah Unit</Text>
        </View>
      </Card>

      <Card style={styles.cardSpacing}>
        <Text style={styles.sectionTitle}>Data Utama</Text>

        <AppTextField
          label="Nama Bank Sampah"
          value={draft.nama}
          onChangeText={t => setDraft(prev => ({...prev, nama: t}))}
          placeholder="Masukkan nama"
        />

        <AppTextField
          label="Alamat"
          value={draft.alamat}
          onChangeText={t => setDraft(prev => ({...prev, alamat: t}))}
          placeholder="Masukkan alamat"
        />
      </Card>

      <Card style={styles.cardSpacing}>
        <Text style={styles.sectionTitle}>Jadwal Operasional</Text>
        <Text style={styles.meta}>Pilih hari operasional:</Text>

        <View style={styles.daysWrap}>
          {DAYS.map(d => {
            const active = Boolean(draft.days[d.key]);
            return (
              <Pressable
                key={d.key}
                onPress={() => toggleDay(d.key)}
                accessibilityRole="button"
                style={({pressed}) => [
                  styles.dayChip,
                  active ? styles.dayChipActive : null,
                  pressed ? styles.pressed : null,
                ]}>
                <Text
                  style={[
                    styles.dayText,
                    active ? styles.dayTextActive : null,
                  ]}>
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <AppTextField
          label="Jam Mulai"
          value={draft.jamMulai}
          onChangeText={t => setDraft(prev => ({...prev, jamMulai: t}))}
          placeholder="08:00"
        />

        <AppTextField
          label="Jam Selesai"
          value={draft.jamSelesai}
          onChangeText={t => setDraft(prev => ({...prev, jamSelesai: t}))}
          placeholder="17:00"
        />

        <View style={styles.actionsRow}>
          <View style={styles.actionLeft}>
            <AppButton
              title="Batal"
              onPress={onCancelEdit}
              variant="secondary"
              disabled={saving}
            />
          </View>
          <View style={styles.actionRight}>
            <AppButton
              title="Simpan"
              onPress={submit}
              loading={saving}
              disabled={saving}
            />
          </View>
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
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  meta: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  cardSpacing: {
    marginTop: theme.spacing.md,
  },
  profileCard: {
    gap: theme.spacing.md,
  },
  identity: {
    paddingVertical: theme.spacing.xs,
  },
  identityName: {
    color: theme.colors.foreground,
    fontSize: theme.fontSize.xl,
    lineHeight: 24,
    fontWeight: '900',
  },
  identityRole: {
    marginTop: 2,
    color: theme.colors.muted,
    fontWeight: '800',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.outline,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.muted,
    fontWeight: '800',
  },
  value: {
    flex: 1,
    color: theme.colors.foreground,
    fontWeight: '900',
    textAlign: 'right',
  },
  pressed: {
    opacity: 0.85,
  },
  daysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  dayChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.card,
  },
  dayChipActive: {
    borderColor: theme.colors.primary,
  },
  dayText: {
    fontWeight: '900',
    color: theme.colors.muted,
  },
  dayTextActive: {
    color: theme.colors.primary,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
  actionsRow: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionLeft: {
    flex: 1,
  },
  actionRight: {
    flex: 1,
  },
});
