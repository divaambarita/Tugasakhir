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
    <Screen>
      <SectionTitle title="Profile" />

      <Card>
        <Text style={styles.row}>Role: {user?.roleName ?? '-'}</Text>
        <Text style={styles.row}>Nama: {user?.nama ?? '-'}</Text>
        <Text style={styles.row}>No. Telp: {user?.noTelp ?? '-'}</Text>

        <View style={styles.actions}>
          <AppButton title="Logout" onPress={logout} variant="destructive" />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    color: theme.colors.foreground,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
});
