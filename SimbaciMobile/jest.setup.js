/* global jest */

jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  Object.defineProperty(reactNative, 'BackHandler', {
    value: {
      addEventListener: jest.fn(() => ({remove: jest.fn()})),
      removeEventListener: jest.fn(),
      exitApp: jest.fn(),
    },
  });
  Object.defineProperty(reactNative, 'Linking', {
    value: {
      addEventListener: jest.fn(() => ({remove: jest.fn()})),
      getInitialURL: jest.fn(() => Promise.resolve(null)),
      openURL: jest.fn(() => Promise.resolve()),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
    },
  });
  return reactNative;
});

jest.mock('react-native-screens', () => {
  const React = require('react');
  const {View} = require('react-native');

  const MockScreen = React.forwardRef((props, ref) =>
    React.createElement(View, {...props, ref}),
  );

  return {
    enableScreens: jest.fn(),
    screensEnabled: jest.fn(() => false),
    Screen: MockScreen,
    ScreenContainer: View,
    ScreenStack: View,
    ScreenStackHeaderConfig: View,
    ScreenStackHeaderSubview: View,
    ScreenStackHeaderLeftView: View,
    ScreenStackHeaderRightView: View,
    ScreenStackHeaderCenterView: View,
    NativeScreen: MockScreen,
    NativeScreenContainer: View,
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    createNativeStackNavigator: () => {
      const Navigator = ({children}) => {
        const firstScreen = React.Children.toArray(children)[0];
        if (!React.isValidElement(firstScreen)) {
          return React.createElement(View);
        }

        const {component: Component, children: renderChildren} =
          firstScreen.props;

        return React.createElement(
          View,
          null,
          Component
            ? React.createElement(Component)
            : typeof renderChildren === 'function'
            ? renderChildren()
            : null,
        );
      };

      return {
        Navigator,
        Screen: () => null,
      };
    },
  };
});
