import React from 'react';
import {StyleSheet, Text, View, type ViewProps} from 'react-native';
import {theme} from './theme';

type Props = ViewProps & {
  title: string;
  subtitle?: string;
};

export function SectionTitle({
  title,
  subtitle,
  style,
  ...rest
}: Props): React.JSX.Element {
  return (
    <View style={[styles.container, style]} {...rest}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.titleLarge,
    color: theme.colors.primary,
  },
  subtitle: {
    marginTop: 4,
    ...theme.typography.body,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
});
