import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {mobileTabScreenOptions} from '../options';

import {AppBottomTabBar} from '../../components/AppBottomTabBar';

import {NasabahSaldoStackNavigator} from '../stacks/NasabahSaldoStackNavigator';
import {NasabahSetoranStackNavigator} from '../stacks/NasabahSetoranStackNavigator';
import {ProfileScreen} from '../../screens/ProfileScreen';

export type NasabahTabParamList = {
  NasabahSaldo: undefined;
  NasabahSetoran: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<NasabahTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => (
  <AppBottomTabBar {...props} />
);

export function NasabahTabsNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={mobileTabScreenOptions}>
      <Tab.Screen
        name="NasabahSaldo"
        component={NasabahSaldoStackNavigator}
        options={{title: 'Saldo', tabBarLabel: 'Saldo', headerShown: false}}
      />
      <Tab.Screen
        name="NasabahSetoran"
        component={NasabahSetoranStackNavigator}
        options={{title: 'Setoran', tabBarLabel: 'Setoran', headerShown: false}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'Profil', tabBarLabel: 'Profil'}}
      />
    </Tab.Navigator>
  );
}
