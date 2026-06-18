import React from 'react';
import {Button} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {RoleHomeScreen} from '../RoleHomeScreen';

export function BsuHomeScreen(): React.JSX.Element {
  const navigation = useNavigation();

  return (
    <RoleHomeScreen title="Home BSU">
      {/**
       * Disabled: BSU Pengurus list feature
       *
       * <Button
       *   title="Daftar Pengurus"
       *   // @ts-expect-error Cross-navigator route
       *   onPress={() => navigation.navigate('BsuPengurusList')}
       * />
       */}
      <Button
        title="Daftar Nasabah"
        // This route lives in the parent tab navigator.
        // @ts-expect-error Cross-navigator route
        onPress={() => navigation.navigate('NasabahList')}
      />
      <Button
        title="Harga Sampah"
        // @ts-expect-error Cross-navigator route
        onPress={() => navigation.navigate('BsuJenisSampahList')}
      />
      <Button
        title="Transaksi"
        // @ts-expect-error Cross-navigator route
        onPress={() => navigation.navigate('BsuTransaksiList')}
      />
      <Button
        title="Keuangan"
        // @ts-expect-error Cross-navigator route
        onPress={() => navigation.navigate('BsuKeuanganList')}
      />
      <Button
        title="Saldo"
        // @ts-expect-error Cross-navigator route
        onPress={() => navigation.navigate('BsuSaldo')}
      />
    </RoleHomeScreen>
  );
}
