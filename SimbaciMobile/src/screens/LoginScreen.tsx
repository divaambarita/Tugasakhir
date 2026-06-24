import React from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {useAuth} from '../auth/AuthContext';
import {AppButton} from '../components/ui/AppButton';
import {AppTextField} from '../components/ui/AppTextField';
import {Card} from '../components/ui/Card';
import {InlineAlert} from '../components/ui/InlineAlert';
import {theme} from '../components/ui/theme';

export function LoginScreen(): React.JSX.Element {
  const {login, lastError, clearError} = useAuth();

  const [noTelp, setNoTelp] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const onChangeNoTelp = (value: string) => {
    setNoTelp(value);
    setFormError(null);
    clearError();
  };

  const onChangePassword = (value: string) => {
    setPassword(value);
    setFormError(null);
    clearError();
  };

  const onSubmit = async () => {
    clearError();
    setFormError(null);

    if (noTelp.trim().length < 9) {
      setFormError('Nomor telepon minimal 9 digit.');
      return;
    }
    if (password.length < 6) {
      setFormError('Kata sandi minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      await login(noTelp.trim(), password);
    } catch {
      setFormError('Tidak dapat terhubung ke server. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandPanel}>
          <Image
            source={require('../assets/images/netrash.png')}
            style={styles.logoNetrash}
            accessibilityLabel="Logo Netrash"
          />
          {/* <Text style={styles.brandTitle}>SIMBACI Mobile</Text>
          <Text style={styles.brandSubtitle}>Masuk ke akun Bank Sampah</Text> */}
        </View>

        <Card style={styles.formCard}>
          <View style={styles.partnerLogoWrap}>
            <Image
              source={require('../assets/images/uplogo.png')}
              style={styles.logoUp}
              accessibilityLabel="Logo Universitas Pertamina"
            />
          </View>

          <AppTextField
            label="No. Telp"
            value={noTelp}
            onChangeText={onChangeNoTelp}
            placeholder="Contoh: 081234567890"
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          <AppTextField
            label="Kata Sandi"
            value={password}
            onChangeText={onChangePassword}
            placeholder="Masukkan kata sandi"
            secureTextEntry
          />

          {formError || lastError ? (
            <InlineAlert message={formError ?? lastError ?? ''} />
          ) : null}

          <View style={styles.actions}>
            <AppButton
              title={submitting ? 'Masuk...' : 'Masuk'}
              onPress={onSubmit}
              loading={submitting}
              disabled={submitting || !noTelp.trim() || !password}
            />
            {submitting ? (
              <View style={styles.spinner}>
                <ActivityIndicator />
              </View>
            ) : null}
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  brandPanel: {
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  logoNetrash: {
    width: 140,
    height: 128,
    resizeMode: 'contain',
  },
  brandTitle: {
    marginTop: theme.spacing.lg,
    color: theme.colors.onPrimary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  brandSubtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.onPrimary,
    opacity: 0.88,
    fontWeight: '700',
    textAlign: 'center',
  },
  formCard: {
    paddingTop: theme.spacing.lg,
  },
  partnerLogoWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  logoUp: {
    width: 74,
    height: 74,
    resizeMode: 'contain',
  },
  actions: {
    marginTop: theme.spacing.md,
  },
  spinner: {
    marginTop: 12,
  },
});
