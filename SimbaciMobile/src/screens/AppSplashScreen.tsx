import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {theme} from '../components/ui/theme';

const netrashLogo = require('../assets/images/netrash.png');

export function AppSplashScreen(): React.JSX.Element {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 13,
        stiffness: 110,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [opacity, scale]);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />

      <View pointerEvents="none" style={styles.decorations}>
        <View style={[styles.circle, styles.circleTop]} />
        <View style={[styles.circle, styles.circleMiddle]} />
        <View style={[styles.circle, styles.circleBottom]} />
      </View>

      <Animated.View style={[styles.content, {opacity, transform: [{scale}]}]}>
        <View style={styles.logoCard}>
          <Image
            source={netrashLogo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo Netrash"
          />
        </View>

        <Text style={styles.title}>NETRASH</Text>
        <Text style={styles.tagline}>Kelola Sampah, Jaga Masa Depan</Text>
      </Animated.View>

      <View style={styles.loadingArea}>
        <ActivityIndicator color={theme.colors.onPrimary} size="small" />
        <Text style={styles.loadingText}>Selamat Datang di Netrash</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.primary,
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(5,150,105,0.16)',
  },
  circleTop: {
    width: 260,
    height: 260,
    top: -105,
    right: -90,
  },
  circleMiddle: {
    width: 90,
    height: 90,
    top: '26%',
    left: -42,
  },
  circleBottom: {
    width: 310,
    height: 310,
    bottom: -180,
    left: -105,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoCard: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    backgroundColor: theme.colors.card,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 14},
    elevation: 10,
  },
  logo: {
    width: 164,
    height: 150,
  },
  title: {
    marginTop: theme.spacing.xl,
    color: theme.colors.onPrimary,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: 3.5,
  },
  tagline: {
    marginTop: theme.spacing.xs,
    color: theme.colors.onPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.82,
  },
  loadingArea: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  loadingText: {
    ...theme.typography.caption,
    color: theme.colors.onPrimary,
    opacity: 0.78,
  },
});
