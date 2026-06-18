import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AdminHomeScreen} from '../../screens/role/AdminHomeScreen';
import {AdminNasabahLeaderboardScreen} from '../../screens/leaderboard/NasabahLeaderboardScreen';

export type AdminHomeStackParamList = {
  AdminHomeRoot: undefined;
  AdminNasabahLeaderboard: undefined;
};

const Stack = createNativeStackNavigator<AdminHomeStackParamList>();

export function AdminHomeStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="AdminHomeRoot"
        component={AdminHomeScreen}
        options={{title: 'Home'}}
      />
      <Stack.Screen
        name="AdminNasabahLeaderboard"
        component={AdminNasabahLeaderboardScreen}
        options={{title: 'Leaderboard'}}
      />
    </Stack.Navigator>
  );
}
