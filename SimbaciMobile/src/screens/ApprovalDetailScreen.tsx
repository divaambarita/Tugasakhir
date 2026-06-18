import React from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';

import {useAuth} from '../auth/AuthContext';
import {
  getApprovalDetail,
  updateApprovalStatus,
  type ApprovalDetail,
} from '../api/approver';
import {uploadSingleImage} from '../api/fileUpload';
import type {ApprovalsStackParamList} from '../navigation/stacks/ApprovalsStackNavigator';
import {AppButton} from '../components/ui/AppButton';
import {AppTextField} from '../components/ui/AppTextField';
import {Card} from '../components/ui/Card';
import {InlineAlert} from '../components/ui/InlineAlert';
import {Screen} from '../components/ui/Screen';
import {theme} from '../components/ui/theme';

type R = RouteProp<ApprovalsStackParamList, 'ApprovalDetail'>;

export function ApprovalDetailScreen(): React.JSX.Element {
  const route = useRoute<R>();
  const {user} = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<ApprovalDetail | null>(null);

  const [keterangan, setKeterangan] = React.useState('');
  const [dokumenUrl, setDokumenUrl] = React.useState<string>('');

  const idApprover = route.params.idApprover;

  const load = React.useCallback(async () => {
    if (!user) {
      return;
    }
    setError(null);

    const res = await getApprovalDetail(user.token, idApprover);
    if (!res.success) {
      setError(res.message ?? 'Gagal memuat detail');
      setData(null);
      return;
    }

    setData(res.data);
  }, [idApprover, user]);

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

  const pickAndUploadDokumen = async () => {
    setError(null);

    let result: Awaited<ReturnType<typeof launchImageLibrary>>;
    try {
      result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });
    } catch {
      setError(
        'Fitur pilih foto belum tersedia di build ini. Coba rebuild Android: `cd android && ./gradlew clean` lalu `npm run android`.',
      );
      return;
    }

    if (result.didCancel) {
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      setError('Gagal memilih foto.');
      return;
    }

    setSaving(true);
    try {
      const uploadRes = await uploadSingleImage(
        {
          uri: asset.uri,
          fileName: asset.fileName,
          type: asset.type,
        },
        'sk-pendirian',
      );

      if (!uploadRes.success) {
        setError(uploadRes.message ?? 'Gagal upload dokumen');
        return;
      }

      const url = uploadRes.data?.[0]?.path;
      if (!url) {
        setError('Gagal membaca hasil upload.');
        return;
      }

      setDokumenUrl(url);
    } finally {
      setSaving(false);
    }
  };

  const submit = async (status: 'Approved' | 'Rejected') => {
    if (!user) {
      return;
    }

    if (status === 'Rejected' && !keterangan.trim()) {
      setError('Keterangan wajib diisi untuk penolakan.');
      return;
    }

    if (status === 'Approved' && user.roleName === 'dlh' && !dokumenUrl) {
      setError('DLH wajib melampirkan foto SK Pendirian BSU.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await updateApprovalStatus(user.token, {
        idApprover,
        createdBy: Number(user.idAkun),
        status,
        keterangan: keterangan.trim() ? keterangan.trim() : null,
        dokumen:
          status === 'Approved' && user.roleName === 'dlh' ? dokumenUrl : null,
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal menyimpan status');
        return;
      }

      Alert.alert('Sukses', 'Status approval berhasil diupdate.');
    } finally {
      setSaving(false);
    }

    await load();
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

  const bsu = data.akun;

  return (
    <Screen scroll>
      {error ? <InlineAlert message={error} /> : null}

      <Card style={styles.cardGap}>
        <Text style={styles.bsuName}>{bsu.nama}</Text>
        <Text style={styles.meta}>No. Telp: {bsu.noTelp}</Text>
        <Text style={styles.meta}>
          Alamat: {bsu.alamat ?? '-'} ({bsu.kecamatan ?? '-'} /{' '}
          {bsu.kelurahan ?? '-'})
        </Text>
      </Card>

      <Card style={styles.cardGap}>
        <Text style={styles.sectionTitle}>Hasil Verifikasi Volunteer</Text>
        {bsu.hasilverifikasi ? (
          <View>
            <Text style={styles.meta}>
              Lokasi: {bsu.hasilverifikasi.lokasi}
            </Text>
            <Text style={styles.meta}>
              Luas: {bsu.hasilverifikasi.luasTempat}
            </Text>
            <Text style={styles.meta}>
              Kondisi: {bsu.hasilverifikasi.kondisiBangunan}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              Foto Kunjungan: {bsu.hasilverifikasi.fotoKunjungan}
            </Text>
          </View>
        ) : (
          <Text style={styles.meta}>Belum ada data verifikasi volunteer.</Text>
        )}
      </Card>

      {user?.roleName === 'dlh' ? (
        <Card style={styles.cardGap}>
          <Text style={styles.sectionTitle}>Lampiran SK Pendirian (Foto)</Text>
          <AppButton
            title={dokumenUrl ? 'SK Terupload' : 'Upload Foto SK'}
            onPress={pickAndUploadDokumen}
            disabled={saving}
            loading={saving}
            variant={dokumenUrl ? 'secondary' : 'primary'}
          />
          {dokumenUrl ? (
            <Text style={styles.meta} numberOfLines={1}>
              {dokumenUrl}
            </Text>
          ) : null}
        </Card>
      ) : null}

      <Card style={styles.cardGap}>
        <Text style={styles.sectionTitle}>Keterangan (opsional)</Text>
        <AppTextField
          value={keterangan}
          onChangeText={setKeterangan}
          placeholder="Isi keterangan jika menolak"
          multiline
          style={styles.textArea}
        />
      </Card>

      <View style={styles.actions}>
        <AppButton
          title="Approve"
          onPress={() => submit('Approved')}
          disabled={saving}
          style={styles.actionButton}
        />
        <AppButton
          title="Reject"
          onPress={() => submit('Rejected')}
          disabled={saving}
          variant="destructive"
          style={styles.actionButton}
        />
      </View>

      {saving ? (
        <View style={styles.savingRow}>
          <ActivityIndicator />
          <Text style={styles.savingText}>Menyimpan…</Text>
        </View>
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
  meta: {
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
    fontWeight: '700',
  },
  bsuName: {
    color: theme.colors.foreground,
    fontWeight: '900',
    fontSize: 16,
  },
  sectionTitle: {
    fontWeight: '900',
    marginBottom: theme.spacing.sm,
    color: theme.colors.foreground,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  cardGap: {
    marginTop: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  savingText: {
    marginLeft: 10,
    color: theme.colors.muted,
    fontWeight: '700',
  },
});
