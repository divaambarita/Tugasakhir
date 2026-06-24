import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import {useAuth} from '../auth/AuthContext';
import type {RoleName} from '../auth/types';

import {LoginScreen} from '../screens/LoginScreen';

import {BsuTabsNavigator} from './tabs/BsuTabsNavigator';
import {NasabahTabsNavigator} from './tabs/NasabahTabsNavigator';
import {VolunteerTabsNavigator} from './tabs/VolunteerTabsNavigator';
import {BsuRejectedScreen} from '../screens/BsuRejectedScreen';
import {WebOnlyRoleScreen} from '../screens/WebOnlyRoleScreen';
import {mobileStackScreenOptions} from './options';
import {theme} from '../components/ui/theme';

export type RootStackParamList = {
  Login: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigatorForRole({
  roleName,
}: {
  roleName: RoleName;
}): React.JSX.Element {
  switch (roleName) {
    case 'bsu':
      return <BsuTabsNavigator />;
    case 'nasabah':
      return <NasabahTabsNavigator />;
    case 'volunteer':
      return <VolunteerTabsNavigator />;
    default:
      return <WebOnlyRoleScreen />;
  }
}

export function RootNavigator(): React.JSX.Element {
  const {isRestoring, user} = useAuth();

  if (isRestoring) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator key="auth">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    );
  }

  if (user.roleName === 'bsu' && user.status === 'Rejected') {
    return (
      <Stack.Navigator
        key="bsu-rejected"
        screenOptions={mobileStackScreenOptions}>
        <Stack.Screen
          name="App"
          component={BsuRejectedScreen}
          options={{title: 'Peringatan'}}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator key="app">
      <Stack.Screen
        name="App"
        options={{headerShown: false}}
        children={() => <AppNavigatorForRole roleName={user.roleName} />}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
