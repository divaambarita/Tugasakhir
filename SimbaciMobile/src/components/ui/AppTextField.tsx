import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import {theme} from './theme';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
};

export function AppTextField({
  label,
  error,
  style,
  ...rest
}: Props): React.JSX.Element {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: theme.spacing.sm,
  },
  label: {
    marginBottom: theme.spacing.xs,
    ...theme.typography.label,
    color: theme.colors.onSurface,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    minHeight: 50,
    backgroundColor: theme.colors.surface,
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  inputError: {
    borderColor: theme.colors.errorOutline,
    backgroundColor: '#FFF7F7',
  },
  errorText: {
    marginTop: 6,
    ...theme.typography.caption,
    color: theme.colors.error,
  },
});
