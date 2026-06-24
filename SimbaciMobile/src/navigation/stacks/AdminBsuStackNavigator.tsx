import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {mobileStackScreenOptions} from '../options';
import {Pressable, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {AdminBsuListScreen} from '../../screens/admin/AdminBsuListScreen';
import {AdminBsuDetailScreen} from '../../screens/admin/AdminBsuDetailScreen';
import {AdminBsuEditScreen} from '../../screens/admin/AdminBsuEditScreen';
import {AdminBsuNasabahListScreen} from '../../screens/admin/AdminBsuNasabahListScreen';
import {AdminBsuPengurusListScreen} from '../../screens/admin/AdminBsuPengurusListScreen';
import {AdminBsuPenarikanRequestScreen} from '../../screens/admin/AdminBsuPenarikanRequestScreen';
import {BsuRegistrationScreen} from '../../screens/BsuRegistrationScreen';
import {theme} from '../../components/ui/theme';

export type AdminBsuStackParamList = {
  AdminBsuList: undefined;
  AdminBsuCreate: undefined;
  AdminBsuDetail: {idBsu: number};
  AdminBsuEdit: {idBsu: number};
  AdminBsuNasabahList: {idBsu: number; bsuName: string};
  AdminBsuPengurusList: {idBsu: number; bsuName: string};
  AdminBsuPenarikanRequests: {idBsu: number; bsuName: string};
};

const Stack = createNativeStackNavigator<AdminBsuStackParamList>();

type Nav = NativeStackNavigationProp<AdminBsuStackParamList>;

function HeaderTambahBsu(): React.JSX.Element {
  const navigation = useNavigation<Nav>();

  return (
    <Pressable
      onPress={() => navigation.navigate('AdminBsuCreate')}
      accessibilityRole="button"
      style={({pressed}) => [pressed ? styles.pressed : null]}>
      <Text style={styles.actionText}>Tambah</Text>
    </Pressable>
  );
}

export function AdminBsuStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={mobileStackScreenOptions}>
      <Stack.Screen
        name="AdminBsuList"
        component={AdminBsuListScreen}
        options={{title: 'Daftar BSU', headerRight: HeaderTambahBsu}}
      />
      <Stack.Screen
        name="AdminBsuCreate"
        component={BsuRegistrationScreen}
        options={{title: 'Tambah BSU'}}
      />
      <Stack.Screen
        name="AdminBsuDetail"
        component={AdminBsuDetailScreen}
        options={{title: 'Detail BSU'}}
      />
      <Stack.Screen
        name="AdminBsuEdit"
        component={AdminBsuEditScreen}
        options={{title: 'Edit BSU'}}
      />
      <Stack.Screen
        name="AdminBsuNasabahList"
        component={AdminBsuNasabahListScreen}
        options={({route}) => ({
          title: `Nasabah - ${route.params.bsuName}`,
        })}
      />
      <Stack.Screen
        name="AdminBsuPengurusList"
        component={AdminBsuPengurusListScreen}
        options={({route}) => ({
          title: `Pengurus - ${route.params.bsuName}`,
        })}
      />
      <Stack.Screen
        name="AdminBsuPenarikanRequests"
        component={AdminBsuPenarikanRequestScreen}
        options={({route}) => ({
          title: `Penarikan - ${route.params.bsuName}`,
        })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  actionText: {
    color: theme.colors.primary,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.7,
  },
});
