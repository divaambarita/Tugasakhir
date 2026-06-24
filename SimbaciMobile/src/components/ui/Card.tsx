import React from 'react';
import {Platform, StyleSheet, View, type ViewProps} from 'react-native';
import {theme} from './theme';

export function Card({style, ...rest}: ViewProps): React.JSX.Element {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.outline,
    ...(Platform.OS === 'android'
      ? {elevation: theme.elevation.sm}
      : {
          shadowColor: theme.colors.surfaceShadow,
          shadowOpacity: 1,
          shadowRadius: 14,
          shadowOffset: {width: 0, height: 8},
        }),
  },
});
