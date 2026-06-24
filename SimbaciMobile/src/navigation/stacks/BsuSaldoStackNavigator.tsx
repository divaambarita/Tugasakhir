import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {mobileStackScreenOptions} from '../options';

import {BsuSaldoScreen} from '../../screens/bsu/BsuSaldoScreen';
import {BsuPenarikanListScreen} from '../../screens/bsu/BsuPenarikanListScreen';
import {BsuPenarikanCreateScreen} from '../../screens/bsu/BsuPenarikanCreateScreen';
import {BsuPenarikanRequestListScreen} from '../../screens/bsu/BsuPenarikanRequestListScreen';

export type BsuSaldoStackParamList = {
  BsuSaldo: undefined;
  BsuPenarikanList: undefined;
  BsuPenarikanCreate: undefined;
  BsuPenarikanRequests: undefined;
};

const Stack = createNativeStackNavigator<BsuSaldoStackParamList>();

export function BsuSaldoStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={mobileStackScreenOptions}>
      <Stack.Screen
        name="BsuSaldo"
        component={BsuSaldoScreen}
        options={{title: 'Saldo'}}
      />
      <Stack.Screen
        name="BsuPenarikanList"
        component={BsuPenarikanListScreen}
        options={{title: 'Penarikan Saldo'}}
      />
      <Stack.Screen
        name="BsuPenarikanCreate"
        component={BsuPenarikanCreateScreen}
        options={{title: 'Proses Penarikan'}}
      />
      <Stack.Screen
        name="BsuPenarikanRequests"
        component={BsuPenarikanRequestListScreen}
        options={{title: 'Konfirmasi Penarikan'}}
      />
    </Stack.Navigator>
  );
}
