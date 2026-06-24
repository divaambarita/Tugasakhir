/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {enableScreens} from 'react-native-screens';

import {AuthProvider, useAuth} from './src/auth/AuthContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {AppSplashScreen} from './src/screens/AppSplashScreen';

enableScreens(true);

const MINIMUM_SPLASH_DURATION_MS = 15000;

function AppContent(): React.JSX.Element {
  const {isRestoring} = useAuth();
  const [minimumDurationElapsed, setMinimumDurationElapsed] =
    React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setMinimumDurationElapsed(true);
    }, MINIMUM_SPLASH_DURATION_MS);

    return () => clearTimeout(timeout);
  }, []);

  if (isRestoring || !minimumDurationElapsed) {
    return <AppSplashScreen />;
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
