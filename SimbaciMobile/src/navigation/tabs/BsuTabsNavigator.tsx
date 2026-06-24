import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {mobileTabScreenOptions} from '../options';

import {AppBottomTabBar} from '../../components/AppBottomTabBar';

import {BsuMonitoringStackNavigator} from '../stacks/BsuMonitoringStackNavigator';
import {BsuHargaSampahStackNavigator} from '../stacks/BsuHargaSampahStackNavigator';
import {BsuTransaksiStackNavigator} from '../stacks/BsuTransaksiStackNavigator';
import {BsuAnggotaStackNavigator} from '../stacks/BsuAnggotaStackNavigator';
import {BsuFinanceStackNavigator} from '../stacks/BsuFinanceStackNavigator';
import {BsuProfileScreen} from '../../screens/bsu/BsuProfileScreen';

export type BsuTabParamList = {
  BsuHome: undefined;
  NasabahList: undefined;
  BsuHargaSampah: undefined;
  BsuTransaksi: undefined;
  BsuKeuangan: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BsuTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => (
  <AppBottomTabBar {...props} />
);

export function BsuTabsNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={mobileTabScreenOptions}>
      <Tab.Screen
        name="BsuHome"
        component={BsuMonitoringStackNavigator}
        options={{
          title: 'Monitoring',
          tabBarLabel: 'Monitoring',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="NasabahList"
        component={BsuAnggotaStackNavigator}
        options={{
          title: 'Anggota',
          tabBarLabel: 'Anggota',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="BsuHargaSampah"
        component={BsuHargaSampahStackNavigator}
        options={{
          title: 'Harga Sampah',
          tabBarLabel: 'Harga',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="BsuTransaksi"
        component={BsuTransaksiStackNavigator}
        options={{
          title: 'Transaksi',
          tabBarLabel: 'Transaksi',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="BsuKeuangan"
        component={BsuFinanceStackNavigator}
        options={{
          title: 'Keuangan',
          tabBarLabel: 'Keuangan',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={BsuProfileScreen}
        options={{title: 'Profil', tabBarLabel: 'Profil'}}
      />
    </Tab.Navigator>
  );
}
