import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Pressable, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {BsuNasabahListScreen} from '../../screens/bsu/BsuNasabahListScreen';
import {BsuNasabahFormScreen} from '../../screens/bsu/BsuNasabahFormScreen';
// import {BsuPengurusListScreen} from '../../screens/bsu/BsuPengurusListScreen';
// import {BsuPengurusFormScreen} from '../../screens/bsu/BsuPengurusFormScreen';
import {theme} from '../../components/ui/theme';

export type BsuAnggotaStackParamList = {
  BsuNasabahList: undefined;
  BsuNasabahForm: {idNasabah?: number} | undefined;
  BsuPengurusList: undefined;
  BsuPengurusForm: {idPengurus?: number} | undefined;
};

const Stack = createNativeStackNavigator<BsuAnggotaStackParamList>();

type Nav = NativeStackNavigationProp<BsuAnggotaStackParamList>;

// NOTE: Disabled (commented) BSU Pengurus list feature.
// Re-enable by uncommenting the imports above, the header actions below,
// and the Stack.Screen registrations further down.

// function HeaderKePengurus(): React.JSX.Element {
//   const navigation = useNavigation<Nav>();
//
//   return (
//     <Pressable
//       onPress={() => navigation.navigate('BsuPengurusList')}
//       accessibilityRole="button"
//       style={({pressed}) => [pressed ? styles.pressed : null]}>
//       <Text style={styles.actionText}>Pengurus</Text>
//     </Pressable>
//   );
// }
//
// function HeaderKeNasabah(): React.JSX.Element {
//   const navigation = useNavigation<Nav>();
//
//   return (
//     <Pressable
//       onPress={() => navigation.navigate('BsuNasabahList')}
//       accessibilityRole="button"
//       style={({pressed}) => [pressed ? styles.pressed : null]}>
//       <Text style={styles.actionText}>Nasabah</Text>
//     </Pressable>
//   );
// }

export function BsuAnggotaStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="BsuNasabahList"
        component={BsuNasabahListScreen}
        options={{
          title: 'Anggota - Nasabah',
          // headerRight: HeaderKePengurus,
        }}
      />
      <Stack.Screen
        name="BsuNasabahForm"
        component={BsuNasabahFormScreen}
        options={({route}) => ({
          title: route.params?.idNasabah ? 'Edit Nasabah' : 'Tambah Nasabah',
        })}
      />
      {/*
      <Stack.Screen
        name="BsuPengurusList"
        component={BsuPengurusListScreen}
        options={{
          title: 'Anggota - Pengurus',
          headerRight: HeaderKeNasabah,
        }}
      />
      <Stack.Screen
        name="BsuPengurusForm"
        component={BsuPengurusFormScreen}
        options={({route}) => ({
          title: route.params?.idPengurus ? 'Edit Pengurus' : 'Tambah Pengurus',
        })}
      />
      */}
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
