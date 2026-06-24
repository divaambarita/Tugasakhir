import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {mobileStackScreenOptions} from '../options';

import {BsuJenisSampahListScreen} from '../../screens/bsu/BsuJenisSampahListScreen';
import {BsuJenisSampahDetailScreen} from '../../screens/bsu/BsuJenisSampahDetailScreen';
import {BsuJenisSampahAddScreen} from '../../screens/bsu/BsuJenisSampahAddScreen';

export type BsuHargaSampahStackParamList = {
  BsuJenisSampahList: undefined;
  BsuJenisSampahAdd: undefined;
  BsuJenisSampahDetail: {
    idJenisSampah: number;
    nama: string;
    kategori: string;
    hargaBsi: number | null;
    hargaBsu: number | null;
  };
};

const Stack = createNativeStackNavigator<BsuHargaSampahStackParamList>();

export function BsuHargaSampahStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={mobileStackScreenOptions}>
      <Stack.Screen
        name="BsuJenisSampahList"
        component={BsuJenisSampahListScreen}
        options={{title: 'Harga Sampah'}}
      />
      <Stack.Screen
        name="BsuJenisSampahAdd"
        component={BsuJenisSampahAddScreen}
        options={{title: 'Tambah Harga Sampah'}}
      />
      <Stack.Screen
        name="BsuJenisSampahDetail"
        component={BsuJenisSampahDetailScreen}
        options={{title: 'Detail Harga Sampah'}}
      />
    </Stack.Navigator>
  );
}
