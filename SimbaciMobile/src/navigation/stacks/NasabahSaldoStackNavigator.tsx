import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {NasabahSaldoHomeScreen} from '../../screens/nasabah/NasabahSaldoHomeScreen';
import {NasabahPenarikanListScreen} from '../../screens/nasabah/NasabahPenarikanListScreen';
import {NasabahPenarikanCreateScreen} from '../../screens/nasabah/NasabahPenarikanCreateScreen';
import {NasabahMonitoringScreen} from '../../screens/nasabah/NasabahMonitoringScreen';
import {NasabahSetoranListScreen} from '../../screens/nasabah/NasabahSetoranListScreen';
import {NasabahSetoranDetailScreen} from '../../screens/nasabah/NasabahSetoranDetailScreen';
import {NasabahHargaSampahScreen} from '../../screens/nasabah/NasabahHargaSampahScreen';

export type NasabahSaldoStackParamList = {
  NasabahSaldoHome: undefined;
  NasabahPenarikanList: undefined;
  NasabahPenarikanCreate: undefined;
  NasabahMonitoring: undefined;
  NasabahSetoranList: undefined;
  NasabahSetoranDetail: {
    tanggalYmd: string;
    totalBerat: number;
    totalNilai: number;
  };
  NasabahHargaSampah: undefined;
};

const Stack = createNativeStackNavigator<NasabahSaldoStackParamList>();

export function NasabahSaldoStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
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
      <Stack.Screen
        name="NasabahMonitoring"
        component={NasabahMonitoringScreen}
        options={{title: 'Monitoring'}}
      />

      <Stack.Screen
        name="NasabahSetoranList"
        component={NasabahSetoranListScreen}
        options={{title: 'Riwayat Setoran'}}
      />
      <Stack.Screen
        name="NasabahSetoranDetail"
        component={NasabahSetoranDetailScreen}
        options={{title: 'Detail Setoran'}}
      />
      <Stack.Screen
        name="NasabahHargaSampah"
        component={NasabahHargaSampahScreen}
        options={{title: 'Katalog Harga'}}
      />
    </Stack.Navigator>
  );
}
