import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {theme} from './theme';

type Variant = 'primary' | 'secondary' | 'destructive';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: Props): React.JSX.Element {
  const isDisabled = disabled || loading;
  let vStyles: ViewStyle = styles.primary;
  if (variant === 'secondary') {
    vStyles = styles.secondary;
  }
  if (variant === 'destructive') {
    vStyles = styles.destructive;
  }

  const textStyles =
    variant === 'secondary' ? styles.textSecondary : styles.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      android_ripple={
        Platform.OS === 'android' && !isDisabled
          ? {color: theme.colors.onPrimaryRipple}
          : undefined
      }
      style={({pressed}) => [
        styles.base,
        vStyles,
        style,
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled
          ? Platform.OS === 'ios'
            ? styles.pressedIOS
            : styles.pressed
          : null,
      ]}>
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'secondary' ? theme.colors.onSurface : theme.colors.onPrimary}
          />
        ) : null}
        <Text style={[styles.text, textStyles]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...(Platform.OS === 'android'
      ? {elevation: theme.elevation.sm}
      : {
          shadowColor: theme.colors.onSurface,
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: {width: 0, height: 6},
        }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    ...theme.typography.label,
  },
  textPrimary: {
    color: theme.colors.onPrimary,
  },
  textSecondary: {
    color: theme.colors.onSurface,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.outline,
  },
  destructive: {
    backgroundColor: theme.colors.destructive,
    borderColor: theme.colors.destructive,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  pressedIOS: {
    opacity: 0.7,
  },
});
