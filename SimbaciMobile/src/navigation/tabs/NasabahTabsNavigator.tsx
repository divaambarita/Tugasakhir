import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import {AppBottomTabBar} from '../../components/AppBottomTabBar';

import {NasabahSaldoStackNavigator} from '../stacks/NasabahSaldoStackNavigator';
import {NasabahSetoranStackNavigator} from '../stacks/NasabahSetoranStackNavigator';
import {NasabahMonitoringStackNavigator} from '../stacks/NasabahMonitoringStackNavigator';
import {NasabahHargaStackNavigator} from '../stacks/NasabahHargaStackNavigator';
import {ProfileScreen} from '../../screens/ProfileScreen';

export type NasabahTabParamList = {
  NasabahSaldo: undefined;
  NasabahSetoran: undefined;
  NasabahMonitoring: undefined;
  NasabahHarga: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<NasabahTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => (
  <AppBottomTabBar {...props} />
);

export function NasabahTabsNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{headerTitleAlign: 'center'}}>
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
        name="NasabahMonitoring"
        component={NasabahMonitoringStackNavigator}
        options={{
          title: 'Monitoring',
          tabBarLabel: 'Monitoring',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="NasabahHarga"
        component={NasabahHargaStackNavigator}
        options={{title: 'Harga', tabBarLabel: 'Harga', headerShown: false}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'Profile', tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}
