import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useAuth} from '../../auth/AuthContext';
import {registerStaffAccount, type StaffRoleName} from '../../api/admin';
import {AppButton} from '../../components/ui/AppButton';
import {AppTextField} from '../../components/ui/AppTextField';
import {Card} from '../../components/ui/Card';
import {InlineAlert} from '../../components/ui/InlineAlert';
import {Screen} from '../../components/ui/Screen';
import {SectionTitle} from '../../components/ui/SectionTitle';
import {theme} from '../../components/ui/theme';

export function AdminCreateAccountScreen(): React.JSX.Element {
  const {user} = useAuth();

  const isAdmin = user?.roleName === 'admin';

  const [roleName, setRoleName] = React.useState<StaffRoleName>('volunteer');
  const [nama, setNama] = React.useState('');
  const [noTelp, setNoTelp] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [jabatan, setJabatan] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const onSubmit = async () => {
    if (!user) {
      return;
    }

    setError(null);
    setSuccess(null);

    if (!isAdmin) {
      setError('Akses ditolak. Hanya Admin.');
      return;
    }

    if (!nama.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    if (noTelp.trim().length < 9) {
      setError('No. Telp minimal 9 digit.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await registerStaffAccount(user.token, {
        roleName,
        nama: nama.trim(),
        noTelp: noTelp.trim(),
        password,
        email: email.trim() ? email.trim() : null,
        jabatan: jabatan.trim() ? jabatan.trim() : null,
      });

      if (!res.success) {
        setError(res.message ?? 'Gagal membuat akun.');
        return;
      }

      setSuccess(
        `Berhasil membuat akun ${roleName} (ID: ${res.data?.idAkun}).`,
      );
      setNama('');
      setNoTelp('');
      setEmail('');
      setJabatan('');
      setPassword('');
      setRoleName('volunteer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <SectionTitle
        title="Buat Akun"
        subtitle="Volunteer / Pejabat ESWKA / DLH"
      />

      {error ? <InlineAlert message={error} /> : null}
      {success ? <InlineAlert tone="info" message={success} /> : null}

      <Card>
        <Text style={styles.label}>Pilih Role</Text>
        <View style={styles.roleRow}>
          <AppButton
            title="Volunteer"
            onPress={() => setRoleName('volunteer')}
            variant={roleName === 'volunteer' ? 'primary' : 'secondary'}
            style={styles.roleBtn}
          />
          <AppButton
            title="Pejabat"
            onPress={() => setRoleName('pejabat_eswka')}
            variant={roleName === 'pejabat_eswka' ? 'primary' : 'secondary'}
            style={styles.roleBtn}
          />
          <AppButton
            title="DLH"
            onPress={() => setRoleName('dlh')}
            variant={roleName === 'dlh' ? 'primary' : 'secondary'}
            style={styles.roleBtn}
          />
        </View>

        <AppTextField
          label="Nama"
          value={nama}
          onChangeText={setNama}
          placeholder="Nama lengkap"
        />
        <AppTextField
          label="No. Telp"
          value={noTelp}
          onChangeText={setNoTelp}
          placeholder="08xxxxxxxxxx"
          keyboardType="phone-pad"
        />
        <AppTextField
          label="Email (opsional)"
          value={email}
          onChangeText={setEmail}
          placeholder="email@contoh.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppTextField
          label="Jabatan (opsional)"
          value={jabatan}
          onChangeText={setJabatan}
          placeholder="Jabatan"
        />
        <AppTextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Minimal 6 karakter"
          secureTextEntry
        />

        <View style={styles.submitRow}>
          <AppButton
            title="Simpan"
            onPress={onSubmit}
            loading={submitting}
            disabled={submitting}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.foreground,
    fontWeight: '900',
  },
  roleRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  roleBtn: {
    flex: 1,
  },
  submitRow: {
    marginTop: theme.spacing.md,
  },
});
