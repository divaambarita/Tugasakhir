import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {mobileStackScreenOptions} from '../options';

import {NasabahMonitoringScreen} from '../../screens/nasabah/NasabahMonitoringScreen';

export type NasabahMonitoringStackParamList = {
  NasabahMonitoringHome: undefined;
};

const Stack = createNativeStackNavigator<NasabahMonitoringStackParamList>();

export function NasabahMonitoringStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={mobileStackScreenOptions}>
      <Stack.Screen
        name="NasabahMonitoringHome"
        component={NasabahMonitoringScreen}
        options={{title: 'Monitoring'}}
      />
    </Stack.Navigator>
  );
}
