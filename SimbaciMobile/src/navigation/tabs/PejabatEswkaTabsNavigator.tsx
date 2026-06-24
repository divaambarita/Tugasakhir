import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {mobileTabScreenOptions} from '../options';

import {AppBottomTabBar} from '../../components/AppBottomTabBar';

import {ApprovalsStackNavigator} from '../stacks/ApprovalsStackNavigator';
import {ProfileScreen} from '../../screens/ProfileScreen';

export type PejabatEswkaTabParamList = {
  Approvals: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<PejabatEswkaTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => (
  <AppBottomTabBar {...props} />
);

export function PejabatEswkaTabsNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={mobileTabScreenOptions}>
      <Tab.Screen
        name="Approvals"
        component={ApprovalsStackNavigator}
        options={{
          title: 'Verifikasi',
          tabBarLabel: 'Verifikasi',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'Profile', tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}
