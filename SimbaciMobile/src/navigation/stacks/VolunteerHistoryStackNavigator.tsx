import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {VolunteerRiwayatScreen} from '../../screens/VolunteerRiwayatScreen';
import {VolunteerVerificationFormScreen} from '../../screens/VolunteerVerificationFormScreen';
import {mobileStackScreenOptions} from '../options';
import type {VerificationFormParams} from './VolunteerVerificationStackNavigator';

export type VolunteerHistoryStackParamList = {
  HistoryList: undefined;
  VerificationForm: VerificationFormParams;
};

const Stack = createNativeStackNavigator<VolunteerHistoryStackParamList>();

export function VolunteerHistoryStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={mobileStackScreenOptions}>
      <Stack.Screen
        name="HistoryList"
        component={VolunteerRiwayatScreen}
        options={{title: 'Riwayat Survei'}}
      />
      <Stack.Screen
        name="VerificationForm"
        component={VolunteerVerificationFormScreen}
        options={{title: 'Edit Survei'}}
      />
    </Stack.Navigator>
  );
}
