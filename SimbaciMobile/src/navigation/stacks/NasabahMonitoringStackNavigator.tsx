import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {NasabahMonitoringScreen} from '../../screens/nasabah/NasabahMonitoringScreen';

export type NasabahMonitoringStackParamList = {
  NasabahMonitoringHome: undefined;
};

const Stack = createNativeStackNavigator<NasabahMonitoringStackParamList>();

export function NasabahMonitoringStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="NasabahMonitoringHome"
        component={NasabahMonitoringScreen}
        options={{title: 'Monitoring'}}
      />
    </Stack.Navigator>
  );
}

