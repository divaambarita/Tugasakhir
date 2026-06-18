import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from './theme';

type Props = {
  message: string;
  tone?: 'error' | 'info';
};

export function InlineAlert({
  message,
  tone = 'error',
}: Props): React.JSX.Element {
  const isError = tone === 'error';
  return (
    <View
      style={[
        styles.container,
        isError ? styles.containerError : styles.containerInfo,
      ]}>
      <Text style={[styles.text, isError ? styles.textError : styles.textInfo]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  containerError: {
      backgroundColor: theme.colors.errorContainer,
      borderColor: theme.colors.errorOutline,
  },
  containerInfo: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
  },
  text: {
      ...theme.typography.body,
  },
  textError: {
      color: theme.colors.destructive,
  },
  textInfo: {
      color: theme.colors.onPrimaryContainer,
  },
});
