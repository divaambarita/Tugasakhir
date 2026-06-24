import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useAuth} from '../auth/AuthContext';
import {AppButton} from '../components/ui/AppButton';
import {Card} from '../components/ui/Card';
import {Screen} from '../components/ui/Screen';
import {SectionTitle} from '../components/ui/SectionTitle';
import {theme} from '../components/ui/theme';

export function ProfileScreen(): React.JSX.Element {
  const {user, logout} = useAuth();

  return (
    <Screen scroll>
      <SectionTitle
        title="Profil"
        subtitle="Informasi akun yang sedang aktif"
      />

      <Card style={styles.card}>
        <View style={styles.identity}>
          <Text style={styles.name}>{user?.nama ?? '-'}</Text>
          <Text style={styles.role}>{user?.roleName ?? '-'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>No. Telp</Text>
          <Text style={styles.value}>{user?.noTelp ?? '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>ID Akun</Text>
          <Text style={styles.value}>{user?.idAkun ?? '-'}</Text>
        </View>

        <View style={styles.actions}>
          <AppButton title="Logout" onPress={logout} variant="destructive" />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  identity: {
    paddingVertical: theme.spacing.xs,
  },
  name: {
    color: theme.colors.foreground,
    fontSize: theme.fontSize.xl,
    lineHeight: 24,
    fontWeight: '900',
  },
  role: {
    marginTop: 2,
    color: theme.colors.muted,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.outline,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  actions: {
    marginTop: theme.spacing.xs,
  },
});
