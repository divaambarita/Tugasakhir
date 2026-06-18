import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ApprovalsListScreen} from '../../screens/ApprovalsListScreen';
import {ApprovalDetailScreen} from '../../screens/ApprovalDetailScreen';

export type ApprovalsStackParamList = {
  ApprovalsList: undefined;
  ApprovalDetail: {idApprover: number};
};

const Stack = createNativeStackNavigator<ApprovalsStackParamList>();

export function ApprovalsStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="ApprovalsList"
        component={ApprovalsListScreen}
        options={{title: 'Approval BSU'}}
      />
      <Stack.Screen
        name="ApprovalDetail"
        component={ApprovalDetailScreen}
        options={{title: 'Detail Approval'}}
      />
    </Stack.Navigator>
  );
}
