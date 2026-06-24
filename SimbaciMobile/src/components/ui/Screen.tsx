import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';

import {theme} from './theme';

type Props =
  | ({scroll?: false} & ViewProps)
  | ({scroll: true} & ScrollViewProps);

export function Screen(props: Props): React.JSX.Element {
  if ('scroll' in props && props.scroll) {
    const {style, contentContainerStyle, ...rest} = props;
    return (
      <ScrollView
        style={[styles.scroll, style]}
        contentContainerStyle={[styles.container, contentContainerStyle]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        {...rest}
      />
    );
  }

  const {style, ...rest} = props as ViewProps;
  return <View style={[styles.view, style]} {...rest} />;
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl + theme.spacing.md,
  },
});
