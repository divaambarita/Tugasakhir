import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import {AppBottomTabBar} from '../../components/AppBottomTabBar';

export type SingleHomeTabParamList = {
  Home: undefined;
};

const Tab = createBottomTabNavigator<SingleHomeTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => (
  <AppBottomTabBar {...props} />
);

export function SingleHomeTabsNavigator({
  title,
  HomeComponent,
}: {
  title: string;
  HomeComponent: React.ComponentType;
}): React.JSX.Element {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{headerTitleAlign: 'center'}}>
      <Tab.Screen
        name="Home"
        component={HomeComponent}
        options={{title, tabBarLabel: 'Home'}}
      />
    </Tab.Navigator>
  );
}
