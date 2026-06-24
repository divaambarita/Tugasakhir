import type {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {theme} from '../components/ui/theme';

const headerBase = {
  headerTitleAlign: 'center' as const,
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: theme.colors.surface,
  },
  headerTitleStyle: {
    color: theme.colors.foreground,
    fontSize: 16,
    fontWeight: '900' as const,
  },
  headerTintColor: theme.colors.primary,
};

export const mobileStackScreenOptions: NativeStackNavigationOptions = {
  ...headerBase,
  contentStyle: {
    backgroundColor: theme.colors.background,
  },
};

export const mobileTabScreenOptions: BottomTabNavigationOptions = {
  ...headerBase,
};
