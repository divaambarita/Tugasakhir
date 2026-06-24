import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useAuth} from '../auth/AuthContext';
import {AppButton} from '../components/ui/AppButton';
import {Card} from '../components/ui/Card';
import {Screen} from '../components/ui/Screen';
import {SectionTitle} from '../components/ui/SectionTitle';
import {theme} from '../components/ui/theme';

export function RoleHomeScreen({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  const {user, logout} = useAuth();

  return (
    <Screen scroll>
      <SectionTitle
        title={title}
        subtitle={`Login sebagai ${user?.roleName ?? '-'}`}
      />

      <Card style={styles.card}>
        <Text style={styles.label}>Nama</Text>
        <Text style={styles.value}>{user?.nama ?? '-'}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>No. Telp</Text>
        <Text style={styles.value}>{user?.noTelp ?? '-'}</Text>
      </Card>

      {children ? <View style={styles.section}>{children}</View> : null}

      <View style={styles.actions}>
        <AppButton title="Logout" onPress={logout} variant="secondary" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.muted,
    fontWeight: '800',
  },
  value: {
    color: theme.colors.foreground,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.outline,
    marginVertical: theme.spacing.sm,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
  section: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
});
