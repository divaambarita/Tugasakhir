import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Pressable, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {AdminJenisSampahListScreen} from '../../screens/admin/AdminJenisSampahListScreen';
import {AdminJenisSampahCreateScreen} from '../../screens/admin/AdminJenisSampahCreateScreen';
import {AdminJenisSampahDetailScreen} from '../../screens/admin/AdminJenisSampahDetailScreen';
import {theme} from '../../components/ui/theme';

export type AdminJenisSampahStackParamList = {
  AdminJenisSampahList: undefined;
  AdminJenisSampahCreate: undefined;
  AdminJenisSampahDetail: {
    idJenisSampah: number;
    nama: string;
    kategori: string;
    hargaBsi: number | null;
  };
};

const Stack = createNativeStackNavigator<AdminJenisSampahStackParamList>();

type Nav = NativeStackNavigationProp<AdminJenisSampahStackParamList>;

function HeaderTambahJenisSampah(): React.JSX.Element {
  const navigation = useNavigation<Nav>();

  return (
    <Pressable
      onPress={() => navigation.navigate('AdminJenisSampahCreate')}
      accessibilityRole="button"
      style={({pressed}) => [pressed ? styles.pressed : null]}>
      <Text style={styles.actionText}>Tambah</Text>
    </Pressable>
  );
}

export function AdminJenisSampahStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="AdminJenisSampahList"
        component={AdminJenisSampahListScreen}
        options={{title: 'Jenis Sampah', headerRight: HeaderTambahJenisSampah}}
      />
      <Stack.Screen
        name="AdminJenisSampahCreate"
        component={AdminJenisSampahCreateScreen}
        options={{title: 'Tambah Jenis Sampah'}}
      />
      <Stack.Screen
        name="AdminJenisSampahDetail"
        component={AdminJenisSampahDetailScreen}
        options={{title: 'Detail Jenis Sampah'}}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  actionText: {
    color: theme.colors.primary,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.7,
  },
});
