import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useAuth} from '../auth/AuthContext';
import {AppButton} from '../components/ui/AppButton';
import {Card} from '../components/ui/Card';
import {Screen} from '../components/ui/Screen';
import {SectionTitle} from '../components/ui/SectionTitle';
import {theme} from '../components/ui/theme';

export function BsuRejectedScreen(): React.JSX.Element {
  const {logout} = useAuth();

  return (
    <Screen>
      <View style={styles.center}>
        <SectionTitle
          title="Akun BSU Ditolak"
          subtitle="Status pendaftaran belum dapat dilanjutkan"
        />
        <Card style={styles.card}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.text}>
            Status pendaftaran BSU Anda ditolak. Silakan hubungi Admin untuk
            informasi lebih lanjut.
          </Text>
          <View style={styles.actions}>
            <AppButton
              title="Keluar"
              onPress={() => logout()}
              variant="secondary"
            />
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
    backgroundColor: theme.colors.errorContainer,
    borderWidth: 1,
    borderColor: theme.colors.errorOutline,
  },
  iconText: {
    color: theme.colors.destructive,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  text: {
    color: theme.colors.foreground,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.lg,
  },
});
