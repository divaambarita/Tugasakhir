import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import {AppBottomTabBar} from '../../components/AppBottomTabBar';

import {AdminHomeStackNavigator} from '../stacks/AdminHomeStackNavigator';
import {ApprovalsStackNavigator} from '../stacks/ApprovalsStackNavigator';
import {ProfileScreen} from '../../screens/ProfileScreen';
import {AdminCreateAccountScreen} from '../../screens/admin/AdminCreateAccountScreen';
import {AdminBsuStackNavigator} from '../stacks/AdminBsuStackNavigator';
import {AdminJenisSampahStackNavigator} from '../stacks/AdminJenisSampahStackNavigator';

export type AdminTabParamList = {
  AdminHome: undefined;
  BsuRegistration: undefined;
  Approvals: undefined;
  AdminCreateAccount: undefined;
  AdminJenisSampah: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => (
  <AppBottomTabBar {...props} />
);

export function AdminTabsNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{headerTitleAlign: 'center'}}>
      <Tab.Screen
        name="AdminHome"
        component={AdminHomeStackNavigator}
        options={{title: 'Home', tabBarLabel: 'Home', headerShown: false}}
      />
      <Tab.Screen
        name="BsuRegistration"
        component={AdminBsuStackNavigator}
        options={{
          title: 'Daftar BSU',
          tabBarLabel: 'Daftar BSU',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Approvals"
        component={ApprovalsStackNavigator}
        options={{
          title: 'Approval',
          tabBarLabel: 'Approval',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="AdminCreateAccount"
        component={AdminCreateAccountScreen}
        options={{title: 'Buat Akun', tabBarLabel: 'Buat Akun'}}
      />
      <Tab.Screen
        name="AdminJenisSampah"
        component={AdminJenisSampahStackNavigator}
        options={{
          title: 'Jenis Sampah',
          tabBarLabel: 'Jenis Sampah',
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
