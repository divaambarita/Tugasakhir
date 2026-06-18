import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';

import {useAuth} from '../auth/AuthContext';

export function RoleHomeScreen({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  const {user, logout} = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        Login sebagai: {user?.roleName ?? '-'}
      </Text>
      <Text style={styles.subtitle}>Nama: {user?.nama ?? '-'}</Text>
      <Text style={styles.subtitle}>No. Telp: {user?.noTelp ?? '-'}</Text>

      {children ? <View style={styles.section}>{children}</View> : null}

      <View style={styles.actions}>
        <Button title="Logout" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 6,
  },
  actions: {
    marginTop: 16,
  },
  section: {
    marginTop: 16,
  },
});
