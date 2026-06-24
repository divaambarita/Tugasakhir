import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {mobileStackScreenOptions} from '../options';

import {VolunteerVerificationListScreen} from '../../screens/VolunteerVerificationListScreen';
import {VolunteerVerificationFormScreen} from '../../screens/VolunteerVerificationFormScreen';

export type VerificationFormParams = {
  bsuId: number;
  bsuName: string;
  mode?: 'create' | 'edit';
  initialData?: {
    lokasi: string;
    luasTempat: string;
    kondisiBangunan: string;
    fasilitasText: string;
    fotoKunjunganUrl: string;
  };
};

export type VolunteerVerificationStackParamList = {
  VerificationList: undefined;
  VerificationForm: VerificationFormParams;
};

const Stack = createNativeStackNavigator<VolunteerVerificationStackParamList>();

export function VolunteerVerificationStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={mobileStackScreenOptions}>
      <Stack.Screen
        name="VerificationList"
        component={VolunteerVerificationListScreen}
        options={{title: 'Verifikasi BSU'}}
      />
      <Stack.Screen
        name="VerificationForm"
        component={VolunteerVerificationFormScreen}
        options={{title: 'Form Verifikasi'}}
      />
    </Stack.Navigator>
  );
}
