import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {BsuMonitoringScreen} from '../../screens/bsu/BsuMonitoringScreen';
import {BsuNasabahLeaderboardScreen} from '../../screens/leaderboard/NasabahLeaderboardScreen';

export type BsuMonitoringStackParamList = {
  BsuMonitoringRoot: undefined;
  BsuNasabahLeaderboard: undefined;
};

const Stack = createNativeStackNavigator<BsuMonitoringStackParamList>();

export function BsuMonitoringStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="BsuMonitoringRoot"
        component={BsuMonitoringScreen}
        options={{title: 'Monitoring BSU'}}
      />
      <Stack.Screen
        name="BsuNasabahLeaderboard"
        component={BsuNasabahLeaderboardScreen}
        options={{title: 'Leaderboard'}}
      />
    </Stack.Navigator>
  );
}
