import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useAuth} from '../auth/AuthContext';
import {AppButton} from '../components/ui/AppButton';
import {Card} from '../components/ui/Card';
import {Screen} from '../components/ui/Screen';
import {theme} from '../components/ui/theme';

const MOBILE_WEB_ONLY_ROLE_MESSAGE =
  'Akses Terbatas: Akun manajerial hanya dapat diakses melalui Dashboard Web. Silakan gunakan akun Nasabah, BSU, atau Volunteer untuk aplikasi Mobile Android.';

export function WebOnlyRoleScreen(): React.JSX.Element {
  const {user, logout} = useAuth();

  return (
    <Screen>
      <View style={styles.center}>
        <Card>
          <Text style={styles.title}>Fitur ini hanya tersedia di Web</Text>
          <Text style={styles.desc}>{MOBILE_WEB_ONLY_ROLE_MESSAGE}</Text>

          <View style={styles.actions}>
            <AppButton title="Logout" onPress={logout} />
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  desc: {
    color: theme.colors.muted,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  actions: {
    marginTop: theme.spacing.sm,
  },
});
