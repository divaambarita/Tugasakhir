import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {mobileStackScreenOptions} from '../options';

import {NasabahSaldoHomeScreen} from '../../screens/nasabah/NasabahSaldoHomeScreen';
import {NasabahPenarikanListScreen} from '../../screens/nasabah/NasabahPenarikanListScreen';
import {NasabahPenarikanCreateScreen} from '../../screens/nasabah/NasabahPenarikanCreateScreen';

export type NasabahSaldoStackParamList = {
  NasabahSaldoHome: undefined;
  NasabahPenarikanList: undefined;
  NasabahPenarikanCreate: undefined;
};

const Stack = createNativeStackNavigator<NasabahSaldoStackParamList>();

export function NasabahSaldoStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={mobileStackScreenOptions}>
      <Stack.Screen
        name="NasabahSaldoHome"
        component={NasabahSaldoHomeScreen}
        options={{title: 'Saldo'}}
      />
      <Stack.Screen
        name="NasabahPenarikanList"
        component={NasabahPenarikanListScreen}
        options={{title: 'Riwayat Penarikan'}}
      />
      <Stack.Screen
        name="NasabahPenarikanCreate"
        component={NasabahPenarikanCreateScreen}
        options={{title: 'Tarik Saldo'}}
      />
    </Stack.Navigator>
  );
}
