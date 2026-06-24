import React from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {theme} from './ui/theme';
import {
  BadgeCheck,
  Home,
  Trash,
  User,
  Users,
  UserPlus,
  Building2,
  Wallet,
  ClipboardListIcon,
  BarChart3,
  Tag,
  ClipboardList,
  History,
} from 'lucide-react-native';

type LucideIconProps = React.ComponentProps<typeof Home>;
type LucideIconComponent = React.ComponentType<LucideIconProps>;

function getTabIcon(routeName: string): LucideIconComponent {
  switch (routeName) {
    case 'AdminHome':
    case 'VolunteerHome':
    case 'DlhHome':
    case 'PejabatHome':
    case 'Home':
      return Home;
    case 'Approvals':
      return BadgeCheck;
    case 'NasabahList':
      return Users;
    case 'BsuPengurus':
      return Users;
    case 'BsuHome':
      return Home;
    case 'BsuRegistration':
      return Building2;
    case 'AdminCreateAccount':
      return UserPlus;
    case 'AdminJenisSampah':
      return Trash;
    case 'BsuHargaSampah':
      return Tag;
    case 'BsuTransaksi':
      return ClipboardListIcon;
    case 'BsuKeuangan':
      return BarChart3;
    case 'BsuSaldo':
      return Wallet;
    case 'NasabahSaldo':
      return Home; // left-most nasabah = Home
    case 'NasabahSetoran':
      return ClipboardListIcon;
    case 'NasabahMonitoring':
      return BarChart3;
    case 'NasabahHarga':
      return Tag;
    case 'VolunteerVerification':
      return ClipboardList;
    case 'VolunteerRiwayat':
      return History;
    case 'Profile':
      return User;
    default:
      return Home;
  }
}

export function AppBottomTabBar(props: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}>
      <View style={styles.row}>
        {props.state.routes.map((route, index) => {
          const isFocused = props.state.index === index;

          const onPress = () => {
            const event = props.navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              props.navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            props.navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const options = props.descriptors[route.key]?.options;
          const Icon = getTabIcon(route.name);
          const iconColor = isFocused
            ? theme.colors.primary
            : theme.colors.muted;
          const label =
            (options?.tabBarLabel as string | undefined) ??
            (options?.title as string | undefined) ??
            route.name;
          const labelColor = iconColor;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={
                options?.tabBarAccessibilityLabel ??
                (options?.title as string) ??
                route.name
              }
              testID={options?.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({pressed}) => [
                styles.item,
                pressed ? styles.itemPressed : null,
                isFocused ? styles.itemFocused : null,
              ]}>
              <View
                style={[
                  styles.iconWrap,
                  isFocused ? styles.iconWrapFocused : null,
                ]}>
                <Icon color={iconColor} size={22} />
              </View>
              <Text
                style={[styles.label, {color: labelColor}]}
                numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outline,
    ...(Platform.OS === 'android'
      ? {elevation: theme.elevation.md}
      : {
          shadowColor: theme.colors.surfaceShadow,
          shadowOpacity: 1,
          shadowRadius: 18,
          shadowOffset: {width: 0, height: -8},
        }),
  },
  row: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 58,
  },
  itemFocused: {
    // subtle focus state: helps affordance without being loud
  },
  iconWrap: {
    width: 42,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.xl,
  },
  iconWrapFocused: {
    backgroundColor: theme.colors.accentSoft,
    borderWidth: 1,
    borderColor: theme.colors.primaryOutline,
  },
  label: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  itemPressed: {
    opacity: Platform.OS === 'ios' ? 0.5 : 0.7,
  },
});
