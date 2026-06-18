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
        <SectionTitle title="Akun BSU Ditolak" />
        <Card>
          <Text style={styles.text}>
            Status pendaftaran BSU Anda ditolak. Silakan hubungi Admin untuk
            informasi lebih lanjut.
          </Text>
          <View style={styles.actions}>
            <AppButton title="Keluar" onPress={() => logout()} />
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
  text: {
    color: theme.colors.foreground,
    lineHeight: 20,
    fontWeight: '700',
  },
  actions: {
    marginTop: theme.spacing.md,
  },
});
