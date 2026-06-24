import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {mobileTabScreenOptions} from '../options';

import {AppBottomTabBar} from '../../components/AppBottomTabBar';

import {VolunteerVerificationStackNavigator} from '../stacks/VolunteerVerificationStackNavigator';
import {VolunteerHistoryStackNavigator} from '../stacks/VolunteerHistoryStackNavigator';
import {ProfileScreen} from '../../screens/ProfileScreen';

export type VolunteerTabParamList = {
  VolunteerVerification: undefined;
  VolunteerRiwayat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<VolunteerTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => (
  <AppBottomTabBar {...props} />
);

export function VolunteerTabsNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={mobileTabScreenOptions}>
      <Tab.Screen
        name="VolunteerVerification"
        component={VolunteerVerificationStackNavigator}
        options={{
          title: 'Verifikasi',
          tabBarLabel: 'Verifikasi',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="VolunteerRiwayat"
        component={VolunteerHistoryStackNavigator}
        options={{
          title: 'Riwayat',
          tabBarLabel: 'Riwayat',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'Profil', tabBarLabel: 'Profil'}}
      />
    </Tab.Navigator>
  );
}
