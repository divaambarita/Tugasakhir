import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {mobileStackScreenOptions} from '../options';

import {BsuPengurusListScreen} from '../../screens/bsu/BsuPengurusListScreen';
import {BsuPengurusFormScreen} from '../../screens/bsu/BsuPengurusFormScreen';

export type BsuPengurusStackParamList = {
  BsuPengurusList: undefined;
  BsuPengurusForm: {idPengurus?: number} | undefined;
};

const Stack = createNativeStackNavigator<BsuPengurusStackParamList>();

export function BsuPengurusStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={mobileStackScreenOptions}>
      <Stack.Screen
        name="BsuPengurusList"
        component={BsuPengurusListScreen}
        options={{title: 'Daftar Pengurus'}}
      />
      <Stack.Screen
        name="BsuPengurusForm"
        component={BsuPengurusFormScreen}
        options={({route}) => ({
          title: route.params?.idPengurus ? 'Edit Pengurus' : 'Tambah Pengurus',
        })}
      />
    </Stack.Navigator>
  );
}
