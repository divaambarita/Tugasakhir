import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {BsuNasabahListScreen} from '../../screens/bsu/BsuNasabahListScreen';
import {BsuNasabahFormScreen} from '../../screens/bsu/BsuNasabahFormScreen';

export type BsuNasabahStackParamList = {
  BsuNasabahList: undefined;
  BsuNasabahForm: {idNasabah?: number} | undefined;
};

const Stack = createNativeStackNavigator<BsuNasabahStackParamList>();

export function BsuNasabahStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="BsuNasabahList"
        component={BsuNasabahListScreen}
        options={{title: 'Daftar Nasabah'}}
      />
      <Stack.Screen
        name="BsuNasabahForm"
        component={BsuNasabahFormScreen}
        options={({route}) => ({
          title: route.params?.idNasabah ? 'Edit Nasabah' : 'Tambah Nasabah',
        })}
      />
    </Stack.Navigator>
  );
}
