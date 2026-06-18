import React from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
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

  const onSubmit = async () => {
    clearError();
    setSubmitting(true);
    try {
      await login(noTelp.trim(), password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Card>
        <View style={styles.logos}>
          <Image
            source={require('../assets/images/simbaci.png')}
            style={styles.logoSimbaci}
            accessibilityLabel="Logo Simbaci"
          />
          <Image
            source={require('../assets/images/uplogo.png')}
            style={styles.logoUp}
            accessibilityLabel="Logo Universitas Pertamina"
          />
        </View>

        <AppTextField
          label="No. Telp"
          value={noTelp}
          onChangeText={setNoTelp}
          placeholder="contoh: 081234567890"
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        <AppTextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="password"
          secureTextEntry
        />

        {lastError ? <InlineAlert message={lastError} /> : null}

        <View style={styles.actions}>
          <AppButton
            title={submitting ? 'Masuk…' : 'Masuk'}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  logos: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  logoSimbaci: {
    width: '100%',
    height: 44,
    resizeMode: 'contain',
  },
  logoUp: {
    marginTop: theme.spacing.sm,
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  actions: {
    marginTop: theme.spacing.md,
  },
  spinner: {
    marginTop: 12,
  },
});
