import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {VolunteerVerificationListScreen} from '../../screens/VolunteerVerificationListScreen';
import {VolunteerVerificationFormScreen} from '../../screens/VolunteerVerificationFormScreen';

export type VolunteerVerificationStackParamList = {
  VerificationList: undefined;
  VerificationForm: {bsuId: number; bsuName: string};
};

const Stack = createNativeStackNavigator<VolunteerVerificationStackParamList>();

export function VolunteerVerificationStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
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
