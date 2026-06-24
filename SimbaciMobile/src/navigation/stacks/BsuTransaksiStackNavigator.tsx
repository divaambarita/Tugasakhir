import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {mobileStackScreenOptions} from '../options';

import {BsuTransaksiListScreen} from '../../screens/bsu/BsuTransaksiListScreen';
import {BsuTransaksiCreateScreen} from '../../screens/bsu/BsuTransaksiCreateScreen';
import {BsuTransaksiDetailScreen} from '../../screens/bsu/BsuTransaksiDetailScreen';
import {BsuTransaksiDetailEditScreen} from '../../screens/bsu/BsuTransaksiDetailEditScreen';

export type BsuTransaksiStackParamList = {
  BsuTransaksiList: undefined;
  BsuTransaksiCreate: undefined;
  BsuTransaksiDetail: {date: string};
  BsuTransaksiDetailEdit: {
    transaksiId: number;
    jenisSampahId: number;
    berat: number;
    nasabahName?: string;
    jenisSampahName?: string;
  };
};

const Stack = createNativeStackNavigator<BsuTransaksiStackParamList>();

export function BsuTransaksiStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={mobileStackScreenOptions}>
      <Stack.Screen
        name="BsuTransaksiList"
        component={BsuTransaksiListScreen}
        options={{title: 'Transaksi'}}
      />
      <Stack.Screen
        name="BsuTransaksiCreate"
        component={BsuTransaksiCreateScreen}
        options={{title: 'Tambah Transaksi'}}
      />
      <Stack.Screen
        name="BsuTransaksiDetail"
        component={BsuTransaksiDetailScreen}
        options={({route}) => ({title: `Detail ${route.params.date}`})}
      />
      <Stack.Screen
        name="BsuTransaksiDetailEdit"
        component={BsuTransaksiDetailEditScreen}
        options={{title: 'Edit Detail'}}
      />
    </Stack.Navigator>
  );
}
