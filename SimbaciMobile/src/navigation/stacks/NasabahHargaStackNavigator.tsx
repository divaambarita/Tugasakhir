import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {mobileStackScreenOptions} from '../options';

import {NasabahHargaSampahScreen} from '../../screens/nasabah/NasabahHargaSampahScreen';

export type NasabahHargaStackParamList = {
  NasabahHargaHome: undefined;
};

const Stack = createNativeStackNavigator<NasabahHargaStackParamList>();

export function NasabahHargaStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={mobileStackScreenOptions}>
      <Stack.Screen
        name="NasabahHargaHome"
        component={NasabahHargaSampahScreen}
        options={{title: 'Harga'}}
      />
    </Stack.Navigator>
  );
}
