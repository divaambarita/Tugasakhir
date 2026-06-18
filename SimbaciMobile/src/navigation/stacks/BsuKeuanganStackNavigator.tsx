import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {BsuKeuanganListScreen} from '../../screens/bsu/BsuKeuanganListScreen';
import {BsuKeuanganAddPemasukanScreen} from '../../screens/bsu/BsuKeuanganAddPemasukanScreen';
import {BsuKeuanganAddPengeluaranScreen} from '../../screens/bsu/BsuKeuanganAddPengeluaranScreen';
import {BsuKeuanganAddPenjualanScreen} from '../../screens/bsu/BsuKeuanganAddPenjualanScreen';

export type BsuKeuanganStackParamList = {
  BsuKeuanganList: undefined;
  BsuKeuanganAddPemasukan: undefined;
  BsuKeuanganAddPengeluaran: undefined;
  BsuKeuanganAddPenjualan: undefined;
};

const Stack = createNativeStackNavigator<BsuKeuanganStackParamList>();

export function BsuKeuanganStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="BsuKeuanganList"
        component={BsuKeuanganListScreen}
        options={{title: 'Keuangan'}}
      />
      <Stack.Screen
        name="BsuKeuanganAddPemasukan"
        component={BsuKeuanganAddPemasukanScreen}
        options={{title: 'Tambah Pemasukan'}}
      />
      <Stack.Screen
        name="BsuKeuanganAddPengeluaran"
        component={BsuKeuanganAddPengeluaranScreen}
        options={{title: 'Tambah Pengeluaran'}}
      />
      <Stack.Screen
        name="BsuKeuanganAddPenjualan"
        component={BsuKeuanganAddPenjualanScreen}
        options={{title: 'Tambah Penjualan'}}
      />
    </Stack.Navigator>
  );
}
