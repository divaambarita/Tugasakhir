import React from 'react';
import {StyleSheet, Text, View, type ViewProps} from 'react-native';
import {Inbox} from 'lucide-react-native';

import {AppButton} from './AppButton';
import {Card} from './Card';
import {theme} from './theme';

type Props = ViewProps & {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  style,
  ...rest
}: Props): React.JSX.Element {
  return (
    <Card style={[styles.card, style]} {...rest}>
      <View style={styles.iconWrap}>
        <Inbox color={theme.colors.primary} size={26} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accentSoft,
    borderWidth: 1,
    borderColor: theme.colors.primaryOutline,
  },
  title: {
    marginTop: theme.spacing.md,
    ...theme.typography.titleMedium,
    color: theme.colors.foreground,
    textAlign: 'center',
  },
  description: {
    marginTop: theme.spacing.xs,
    ...theme.typography.body,
    color: theme.colors.muted,
    fontWeight: '600',
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.md,
  },
});
