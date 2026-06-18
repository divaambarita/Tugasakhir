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
    padding: theme.spacing.md,
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
});
