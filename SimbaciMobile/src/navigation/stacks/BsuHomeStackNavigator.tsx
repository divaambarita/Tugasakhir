import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {BsuHomeScreen} from '../../screens/role/BsuHomeScreen';
// import {BsuPengurusListScreen} from '../../screens/bsu/BsuPengurusListScreen';
// import {BsuPengurusFormScreen} from '../../screens/bsu/BsuPengurusFormScreen';
import {BsuJenisSampahListScreen} from '../../screens/bsu/BsuJenisSampahListScreen';
import {BsuJenisSampahDetailScreen} from '../../screens/bsu/BsuJenisSampahDetailScreen';
import {BsuTransaksiListScreen} from '../../screens/bsu/BsuTransaksiListScreen';
import {BsuTransaksiCreateScreen} from '../../screens/bsu/BsuTransaksiCreateScreen';
import {BsuTransaksiDetailScreen} from '../../screens/bsu/BsuTransaksiDetailScreen';
import {BsuKeuanganListScreen} from '../../screens/bsu/BsuKeuanganListScreen';
import {BsuKeuanganAddPemasukanScreen} from '../../screens/bsu/BsuKeuanganAddPemasukanScreen';
import {BsuKeuanganAddPengeluaranScreen} from '../../screens/bsu/BsuKeuanganAddPengeluaranScreen';
import {BsuKeuanganAddPenjualanScreen} from '../../screens/bsu/BsuKeuanganAddPenjualanScreen';
import {BsuSaldoScreen} from '../../screens/bsu/BsuSaldoScreen';
import {BsuPenarikanListScreen} from '../../screens/bsu/BsuPenarikanListScreen';
import {BsuPenarikanCreateScreen} from '../../screens/bsu/BsuPenarikanCreateScreen';

export type BsuHomeStackParamList = {
  BsuHomeRoot: undefined;
  BsuPengurusList: undefined;
  BsuPengurusForm: {idPengurus?: number} | undefined;
  BsuJenisSampahList: undefined;
  BsuJenisSampahDetail: {
    idJenisSampah: number;
    nama: string;
    kategori: string;
    hargaBsi: number | null;
    hargaBsu: number | null;
  };
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
  BsuKeuanganList: undefined;
  BsuKeuanganAddPemasukan: undefined;
  BsuKeuanganAddPengeluaran: undefined;
  BsuKeuanganAddPenjualan: undefined;
  BsuSaldo: undefined;
  BsuPenarikanList: undefined;
  BsuPenarikanCreate: undefined;
};

const Stack = createNativeStackNavigator<BsuHomeStackParamList>();

export function BsuHomeStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="BsuHomeRoot"
        component={BsuHomeScreen}
        options={{title: 'Home'}}
      />
      {/**
       * Disabled: BSU Pengurus list feature
       *
       * <Stack.Screen
       *   name="BsuPengurusList"
       *   component={BsuPengurusListScreen}
       *   options={{title: 'Daftar Pengurus'}}
       * />
       * <Stack.Screen
       *   name="BsuPengurusForm"
       *   component={BsuPengurusFormScreen}
       *   options={({route}) => ({
       *     title: route.params?.idPengurus ? 'Edit Pengurus' : 'Tambah Pengurus',
       *   })}
       * />
       */}
      <Stack.Screen
        name="BsuJenisSampahList"
        component={BsuJenisSampahListScreen}
        options={{title: 'Harga Sampah'}}
      />
      <Stack.Screen
        name="BsuJenisSampahDetail"
        component={BsuJenisSampahDetailScreen}
        options={{title: 'Detail Harga Sampah'}}
      />
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
    </Stack.Navigator>
  );
}
