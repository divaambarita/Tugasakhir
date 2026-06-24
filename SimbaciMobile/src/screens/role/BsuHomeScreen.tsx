import React from 'react';
import {useNavigation} from '@react-navigation/native';

import {AppButton} from '../../components/ui/AppButton';
import {RoleHomeScreen} from '../RoleHomeScreen';

export function BsuHomeScreen(): React.JSX.Element {
  const navigation = useNavigation();

  return (
    <RoleHomeScreen title="Home BSU">
      {/**
       * Disabled: BSU Pengurus list feature
       *
       * <AppButton
       *   title="Daftar Pengurus"
       *   // @ts-expect-error Cross-navigator route
       *   onPress={() => navigation.navigate('BsuPengurusList')}
       * />
       */}
      <AppButton
        title="Daftar Nasabah"
        // This route lives in the parent tab navigator.
        // @ts-expect-error Cross-navigator route
        onPress={() => navigation.navigate('NasabahList')}
      />
      <AppButton
        title="Harga Sampah"
        variant="secondary"
        // @ts-expect-error Cross-navigator route
        onPress={() => navigation.navigate('BsuJenisSampahList')}
      />
      <AppButton
        title="Transaksi"
        variant="secondary"
        // @ts-expect-error Cross-navigator route
        onPress={() => navigation.navigate('BsuTransaksiList')}
      />
      <AppButton
        title="Keuangan"
        variant="secondary"
        // @ts-expect-error Cross-navigator route
        onPress={() => navigation.navigate('BsuKeuanganList')}
      />
      <AppButton
        title="Saldo"
        variant="secondary"
        // @ts-expect-error Cross-navigator route
        onPress={() => navigation.navigate('BsuSaldo')}
      />
    </RoleHomeScreen>
  );
}
