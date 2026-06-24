import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {mobileStackScreenOptions} from '../options';

import {NasabahSetoranListScreen} from '../../screens/nasabah/NasabahSetoranListScreen';
import {NasabahSetoranDetailScreen} from '../../screens/nasabah/NasabahSetoranDetailScreen';

export type NasabahSetoranStackParamList = {
  NasabahSetoranList: undefined;
  NasabahSetoranDetail: {
    tanggalYmd: string;
    totalBerat: number;
    totalNilai: number;
  };
};

const Stack = createNativeStackNavigator<NasabahSetoranStackParamList>();

export function NasabahSetoranStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={mobileStackScreenOptions}>
      <Stack.Screen
        name="NasabahSetoranList"
        component={NasabahSetoranListScreen}
        options={{title: 'Setoran'}}
      />
      <Stack.Screen
        name="NasabahSetoranDetail"
        component={NasabahSetoranDetailScreen}
        options={{title: 'Detail Setoran'}}
      />
    </Stack.Navigator>
  );
}
