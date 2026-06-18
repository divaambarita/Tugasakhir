import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

import {useAuth} from '../auth/AuthContext';
import {signupBsuAsAdmin, type JenisKelamin} from '../api/bsuRegistration';
import {uploadSingleImage} from '../api/fileUpload';
import {AppButton} from '../components/ui/AppButton';
import {AppDateField} from '../components/ui/AppDateField';
import {AppTextField} from '../components/ui/AppTextField';
import {Card} from '../components/ui/Card';
import {InlineAlert} from '../components/ui/InlineAlert';
import {Screen} from '../components/ui/Screen';
import {SectionTitle} from '../components/ui/SectionTitle';
import {theme} from '../components/ui/theme';

type BsuForm = {
  nama: string;
  email: string;
  noTelp: string;
  alamat: string;
  kecamatan: string;
  kelurahan: string;
  password: string;
};

type PengurusForm = {
  namaPengurus: string;
  email: string;
  jenisKelamin: JenisKelamin;
  noTelp: string;
  alamat: string;
  pekerjaan: string;
  tempatLahir: string;
  tglLahir: string; // YYYY-MM-DD
  ktp: string; // URL
};

const JABATAN = [
  'DIREKTUR',
  'MANAGER UMUM',
  'MANAGER PRODUKSI',
  'MANAGER KEUANGAN',
] as const;

function makeEmptyPengurus(): PengurusForm {
  return {
    namaPengurus: '',
    email: '',
    jenisKelamin: 'Male',
    noTelp: '',
    alamat: '',
    pekerjaan: '',
    tempatLahir: '',
    tglLahir: '',
    ktp: '',
  };
}

function isValidDateString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function normalizeDateInput(input: string): string | null {
  const raw = input.trim();
  if (!raw) {
    return null;
  }

  const match = raw.match(/^(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})$/);
  if (!match) {
    // Also accept strict YYYY-MM-DD
    if (isValidDateString(raw)) {
      const [y, m, d] = raw.split('-').map(Number);
      return normalizeDateInput(`${y}-${m}-${d}`);
    }
    return null;
  }

  const a = match[1];
  const b = match[2];
  const c = match[3];

  // Decide if format is YYYY-MM-DD (year-first) or DD-MM-YYYY (year-last)
  const yearFirst = a.length === 4;
  const yearLast = c.length === 4;
  if (!yearFirst && !yearLast) {
    return null;
  }

  const year = Number(yearFirst ? a : c);
  const month = Number(b);
  const day = Number(yearFirst ? c : a);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }
  if (year < 1900 || year > 2100) {
    return null;
  }
  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 31) {
    return null;
  }

  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }

  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function BsuRegistrationScreen(): React.JSX.Element {
  const {user} = useAuth();

  const [step, setStep] = React.useState<0 | 1>(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [bsu, setBsu] = React.useState<BsuForm>({
    nama: '',
    email: '',
    noTelp: '',
    alamat: '',
    kecamatan: '',
    kelurahan: '',
    password: '',
  });

  const [pengurus, setPengurus] = React.useState<PengurusForm[]>([
    makeEmptyPengurus(),
    makeEmptyPengurus(),
    makeEmptyPengurus(),
    makeEmptyPengurus(),
  ]);

  const [agree, setAgree] = React.useState(false);

  const updatePengurus = (index: number, patch: Partial<PengurusForm>) => {
    setPengurus(prev =>
      prev.map((p, i) => (i === index ? {...p, ...patch} : p)),
    );
  };

  const validateStep0 = (): string | null => {
    if (!bsu.nama.trim()) {
      return 'Nama BSU wajib diisi.';
    }
    if (!bsu.email.trim()) {
      return 'Email BSU wajib diisi.';
    }
    if (bsu.noTelp.trim().length < 9) {
      return 'Nomor telepon BSU minimal 9 karakter.';
    }
    if (!bsu.alamat.trim()) {
      return 'Alamat BSU wajib diisi.';
    }
    if (!bsu.kecamatan.trim()) {
      return 'Kecamatan BSU wajib diisi.';
    }
    if (!bsu.kelurahan.trim()) {
      return 'Kelurahan BSU wajib diisi.';
    }
    if (bsu.password.length < 6) {
      return 'Password minimal 6 karakter.';
    }
    return null;
  };

  const validateStep1 = (): string | null => {
    if (!agree) {
      return 'Wajib menyetujui syarat dan ketentuan.';
    }
    if (pengurus.length < 4) {
      return 'Minimal terdapat 4 pengurus.';
    }

    for (let i = 0; i < 4; i++) {
      const p = pengurus[i];
      const jabatan = JABATAN[i];
      if (!p.namaPengurus.trim()) {
        return `Nama pengurus (${jabatan}) wajib diisi.`;
      }
      if (!p.email.trim()) {
        return `Email pengurus (${jabatan}) wajib diisi.`;
      }
      if (p.noTelp.trim().length < 10) {
        return `Nomor telepon pengurus (${jabatan}) minimal 10 karakter.`;
      }
      if (!p.alamat.trim()) {
        return `Alamat pengurus (${jabatan}) wajib diisi.`;
      }
      if (!p.pekerjaan.trim()) {
        return `Pekerjaan pengurus (${jabatan}) wajib diisi.`;
      }
      if (!p.tempatLahir.trim()) {
        return `Tempat lahir pengurus (${jabatan}) wajib diisi.`;
      }
      if (!normalizeDateInput(p.tglLahir)) {
        return `Tanggal lahir pengurus (${jabatan}) wajib diisi.`;
      }
      if (!p.ktp.trim()) {
        return `Foto KTP pengurus (${jabatan}) wajib diupload.`;
      }
    }
    return null;
  };

  const pickAndUploadKtp = async (index: number) => {
    if (!user?.token) {
      return;
    }
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

    setLoading(true);
    try {
      const uploadRes = await uploadSingleImage(
        {
          uri: asset.uri,
          fileName: asset.fileName,
          type: asset.type,
        },
        `ktp-pengurus-${index + 1}`,
      );

      if (!uploadRes.success) {
        setError(uploadRes.message ?? 'Gagal upload foto KTP');
        return;
      }

      const url = uploadRes.data?.[0]?.path;
      if (!url) {
        setError('Gagal membaca hasil upload.');
        return;
      }

      updatePengurus(index, {ktp: url});
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!user || user.roleName !== 'admin') {
      setError('Hanya Admin yang bisa mendaftarkan BSU.');
      return;
    }

    const err = validateStep0() ?? validateStep1();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const normalizedPengurus = pengurus.slice(0, 4).map((p, i) => {
        const normalizedDob = normalizeDateInput(p.tglLahir);
        if (!normalizedDob) {
          throw new Error(
            `Tanggal lahir pengurus (${JABATAN[i]}) tidak valid.`,
          );
        }

        return {
          ...p,
          namaPengurus: p.namaPengurus.trim(),
          email: p.email.trim(),
          noTelp: p.noTelp.trim(),
          alamat: p.alamat.trim(),
          pekerjaan: p.pekerjaan.trim(),
          tempatLahir: p.tempatLahir.trim(),
          tglLahir: normalizedDob,
          jabatan: JABATAN[i],
        };
      });

      const res = await signupBsuAsAdmin(user.token, {
        nama: bsu.nama.trim(),
        email: bsu.email.trim(),
        noTelp: bsu.noTelp.trim(),
        alamat: bsu.alamat.trim(),
        kecamatan: bsu.kecamatan.trim(),
        kelurahan: bsu.kelurahan.trim(),
        password: bsu.password,
        pengurus: normalizedPengurus,
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal mendaftarkan BSU');
        return;
      }

      Alert.alert(
        'Berhasil',
        'Registrasi BSU berhasil. Mohon menunggu verifikasi Admin/Pejabat/DLH.',
      );

      setStep(0);
      setAgree(false);
      setBsu({
        nama: '',
        email: '',
        noTelp: '',
        alamat: '',
        kecamatan: '',
        kelurahan: '',
        password: '',
      });
      setPengurus([
        makeEmptyPengurus(),
        makeEmptyPengurus(),
        makeEmptyPengurus(),
        makeEmptyPengurus(),
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal mendaftarkan BSU';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Screen>
        <Text>Silakan login.</Text>
      </Screen>
    );
  }

  if (user.roleName !== 'admin') {
    return (
      <Screen>
        <InlineAlert message="Akses ditolak. Hanya Admin." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <SectionTitle title="Pendaftaran BSU (Admin)" />

      {error ? <InlineAlert message={error} /> : null}

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Memproses…</Text>
        </View>
      ) : null}

      {step === 0 ? (
        <View>
          <Card>
            <Text style={styles.section}>Informasi Bank Sampah</Text>

            <AppTextField
              label="Nama BSU"
              value={bsu.nama}
              onChangeText={t => setBsu(prev => ({...prev, nama: t}))}
              placeholder="Nama BSU"
            />

            <AppTextField
              label="Email"
              value={bsu.email}
              onChangeText={t => setBsu(prev => ({...prev, email: t}))}
              placeholder="Email BSU"
              autoCapitalize="none"
            />

            <AppTextField
              label="No. Telepon"
              value={bsu.noTelp}
              onChangeText={t => setBsu(prev => ({...prev, noTelp: t}))}
              placeholder="Nomor Telepon"
              keyboardType="phone-pad"
            />

            <AppTextField
              label="Alamat"
              value={bsu.alamat}
              onChangeText={t => setBsu(prev => ({...prev, alamat: t}))}
              placeholder="Alamat"
            />

            <AppTextField
              label="Kecamatan"
              value={bsu.kecamatan}
              onChangeText={t => setBsu(prev => ({...prev, kecamatan: t}))}
              placeholder="Kecamatan"
            />

            <AppTextField
              label="Kelurahan"
              value={bsu.kelurahan}
              onChangeText={t => setBsu(prev => ({...prev, kelurahan: t}))}
              placeholder="Kelurahan"
            />

            <AppTextField
              label="Password"
              value={bsu.password}
              onChangeText={t => setBsu(prev => ({...prev, password: t}))}
              placeholder="Password"
              secureTextEntry
            />

            <View style={styles.actions}>
              <AppButton
                title="Lanjut"
                onPress={() => {
                  const err = validateStep0();
                  if (err) {
                    setError(err);
                    return;
                  }
                  setError(null);
                  setStep(1);
                }}
              />
            </View>
          </Card>
        </View>
      ) : (
        <View>
          <Text style={styles.section}>Data Pengurus (4 Orang)</Text>

          {JABATAN.map((jabatan, index) => {
            const p = pengurus[index];
            return (
              <Card key={jabatan} style={styles.card}>
                <Text style={styles.cardTitle}>{jabatan}</Text>

                <AppTextField
                  label="Nama"
                  value={p.namaPengurus}
                  onChangeText={t => updatePengurus(index, {namaPengurus: t})}
                  placeholder="Nama"
                />

                <AppTextField
                  label="Email"
                  value={p.email}
                  onChangeText={t => updatePengurus(index, {email: t})}
                  placeholder="Email"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Jenis Kelamin</Text>
                <View style={styles.radioRow}>
                  <Pressable
                    style={styles.radioOption}
                    onPress={() =>
                      updatePengurus(index, {jenisKelamin: 'Male'})
                    }>
                    <View
                      style={[
                        styles.radioOuter,
                        p.jenisKelamin === 'Male' && styles.radioOuterSelected,
                      ]}>
                      {p.jenisKelamin === 'Male' ? (
                        <View style={styles.radioInner} />
                      ) : null}
                    </View>
                    <Text style={styles.radioText}>Male</Text>
                  </Pressable>

                  <Pressable
                    style={styles.radioOption}
                    onPress={() =>
                      updatePengurus(index, {jenisKelamin: 'Female'})
                    }>
                    <View
                      style={[
                        styles.radioOuter,
                        p.jenisKelamin === 'Female' &&
                          styles.radioOuterSelected,
                      ]}>
                      {p.jenisKelamin === 'Female' ? (
                        <View style={styles.radioInner} />
                      ) : null}
                    </View>
                    <Text style={styles.radioText}>Female</Text>
                  </Pressable>
                </View>

                <AppTextField
                  label="No. Telepon"
                  value={p.noTelp}
                  onChangeText={t => updatePengurus(index, {noTelp: t})}
                  placeholder="Nomor Telepon"
                  keyboardType="phone-pad"
                />

                <AppTextField
                  label="Alamat"
                  value={p.alamat}
                  onChangeText={t => updatePengurus(index, {alamat: t})}
                  placeholder="Alamat"
                />

                <AppTextField
                  label="Pekerjaan"
                  value={p.pekerjaan}
                  onChangeText={t => updatePengurus(index, {pekerjaan: t})}
                  placeholder="Pekerjaan"
                />

                <AppTextField
                  label="Tempat Lahir"
                  value={p.tempatLahir}
                  onChangeText={t => updatePengurus(index, {tempatLahir: t})}
                  placeholder="Tempat Lahir"
                />

                <AppDateField
                  label="Tanggal Lahir"
                  value={p.tglLahir}
                  onChange={t => updatePengurus(index, {tglLahir: t})}
                  maximumDate={new Date()}
                />

                <View style={styles.fileRow}>
                  <AppButton
                    title={p.ktp ? 'KTP Terupload' : 'Upload Foto KTP'}
                    onPress={() => pickAndUploadKtp(index)}
                    variant={p.ktp ? 'secondary' : 'primary'}
                    disabled={loading}
                  />
                </View>
                {p.ktp ? (
                  <Text style={styles.fileInfo} numberOfLines={1}>
                    {p.ktp}
                  </Text>
                ) : null}
              </Card>
            );
          })}

          <View style={styles.checkboxRow}>
            <AppButton
              title={agree ? '✓ Setuju S&K' : 'Setuju S&K'}
              onPress={() => setAgree(v => !v)}
              variant={agree ? 'primary' : 'secondary'}
              disabled={loading}
            />
          </View>

          <View style={styles.actionsRow}>
            <AppButton
              title="Kembali"
              onPress={() => setStep(0)}
              variant="secondary"
              disabled={loading}
            />
            <View style={styles.spacer} />
            <AppButton
              title="Submit"
              onPress={submit}
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: theme.fontSize.lg,
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
  },
  label: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    fontWeight: '800',
    color: theme.colors.foreground,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: theme.spacing.xs,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.muted2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  radioText: {
    marginLeft: 8,
    color: theme.colors.foreground,
    fontWeight: '700',
  },
  actions: {
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
    width: '100%',
  },
  actionsRow: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    width: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  loadingText: {
    marginLeft: 10,
    color: theme.colors.muted,
    fontWeight: '700',
  },
  card: {
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  fileRow: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
    width: '100%',
  },
  fileInfo: {
    marginTop: 6,
    fontSize: theme.fontSize.sm,
    color: theme.colors.muted,
  },
  checkboxRow: {
    marginTop: theme.spacing.xs,
    width: '100%',
  },
});
