import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Pressable, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {BsuKeuanganListScreen} from '../../screens/bsu/BsuKeuanganListScreen';
import {BsuKeuanganAddPemasukanScreen} from '../../screens/bsu/BsuKeuanganAddPemasukanScreen';
import {BsuKeuanganAddPengeluaranScreen} from '../../screens/bsu/BsuKeuanganAddPengeluaranScreen';
import {BsuKeuanganAddPenjualanScreen} from '../../screens/bsu/BsuKeuanganAddPenjualanScreen';
import {BsuSaldoScreen} from '../../screens/bsu/BsuSaldoScreen';
import {BsuPenarikanListScreen} from '../../screens/bsu/BsuPenarikanListScreen';
import {BsuPenarikanCreateScreen} from '../../screens/bsu/BsuPenarikanCreateScreen';
import {BsuPenarikanRequestListScreen} from '../../screens/bsu/BsuPenarikanRequestListScreen';
import {theme} from '../../components/ui/theme';

export type BsuFinanceStackParamList = {
  BsuKeuanganList: undefined;
  BsuKeuanganAddPemasukan: undefined;
  BsuKeuanganAddPengeluaran: undefined;
  BsuKeuanganAddPenjualan: undefined;
  BsuSaldo: undefined;
  BsuPenarikanList: undefined;
  BsuPenarikanCreate: undefined;
  BsuPenarikanRequests: undefined;
};

const Stack = createNativeStackNavigator<BsuFinanceStackParamList>();

type Nav = NativeStackNavigationProp<BsuFinanceStackParamList>;

function HeaderKeSaldo(): React.JSX.Element {
  const navigation = useNavigation<Nav>();

  return (
    <Pressable
      onPress={() => navigation.navigate('BsuSaldo')}
      accessibilityRole="button"
      style={({pressed}) => [pressed ? styles.pressed : null]}>
      <Text style={styles.actionText}>Saldo</Text>
    </Pressable>
  );
}

export function BsuFinanceStackNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen
        name="BsuKeuanganList"
        component={BsuKeuanganListScreen}
        options={{title: 'Keuangan', headerRight: HeaderKeSaldo}}
      />
      <Stack.Screen
        name="BsuKeuanganAddPemasukan"
        component={BsuKeuanganAddPemasukanScreen}
        options={{title: 'Tambah Pemasukan'}}
      />
      <Stack.Screen
        name="BsuKeuanganAddPengeluaran"
        component={BsuKeuanganAddPengeluaranScreen}
        options={{title: 'Tambah Pengeluaran'}}
      />
      <Stack.Screen
        name="BsuKeuanganAddPenjualan"
        component={BsuKeuanganAddPenjualanScreen}
        options={{title: 'Tambah Penjualan'}}
      />
      <Stack.Screen
        name="BsuSaldo"
        component={BsuSaldoScreen}
        options={{title: 'Saldo'}}
      />
      <Stack.Screen
        name="BsuPenarikanList"
        component={BsuPenarikanListScreen}
        options={{title: 'Penarikan Saldo'}}
      />
      <Stack.Screen
        name="BsuPenarikanCreate"
        component={BsuPenarikanCreateScreen}
        options={{title: 'Proses Penarikan'}}
      />
      <Stack.Screen
        name="BsuPenarikanRequests"
        component={BsuPenarikanRequestListScreen}
        options={{title: 'Konfirmasi Penarikan'}}
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
