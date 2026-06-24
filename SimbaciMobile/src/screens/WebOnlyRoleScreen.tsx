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
        <Card style={styles.card}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.title}>Fitur ini hanya tersedia di Web</Text>
          <Text style={styles.desc}>{MOBILE_WEB_ONLY_ROLE_MESSAGE}</Text>
          <Text style={styles.role}>Role aktif: {user?.roleName ?? '-'}</Text>

          <View style={styles.actions}>
            <AppButton title="Logout" onPress={logout} variant="secondary" />
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
  card: {
    alignItems: 'center',
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.warningSoft,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  iconText: {
    color: theme.colors.warning,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  title: {
    ...theme.typography.titleMedium,
    fontWeight: '900',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  desc: {
    color: theme.colors.muted,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  role: {
    marginTop: theme.spacing.md,
    color: theme.colors.primary,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  actions: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.lg,
  },
});
