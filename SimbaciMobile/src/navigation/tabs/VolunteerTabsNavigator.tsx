import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import {AppBottomTabBar} from '../../components/AppBottomTabBar';

import {VolunteerVerificationStackNavigator} from '../stacks/VolunteerVerificationStackNavigator';
import {ProfileScreen} from '../../screens/ProfileScreen';
import {VolunteerRiwayatScreen} from '../../screens/VolunteerRiwayatScreen';

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
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{headerTitleAlign: 'center'}}>
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
        component={VolunteerRiwayatScreen}
        options={{
          title: 'Riwayat',
          tabBarLabel: 'Riwayat',
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
