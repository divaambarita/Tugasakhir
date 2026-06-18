import React from 'react';
import {Platform, StyleSheet, View, type ViewProps} from 'react-native';
import {theme} from './theme';

export function Card({style, ...rest}: ViewProps): React.JSX.Element {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...(Platform.OS === 'android'
      ? {elevation: theme.elevation.sm}
      : {
          shadowColor: theme.colors.onSurface,
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: {width: 0, height: 6},
        }),
  },
});
