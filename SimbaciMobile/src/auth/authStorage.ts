import * as Keychain from 'react-native-keychain';

import type {CurrentUser} from './types';

const SERVICE = 'com.simbaci.mobile.currentUser';

export async function saveCurrentUser(user: CurrentUser): Promise<void> {
  await Keychain.setGenericPassword('currentUser', JSON.stringify(user), {
    service: SERVICE,
  });
}

export async function loadCurrentUser(): Promise<CurrentUser | null> {
  const creds = await Keychain.getGenericPassword({service: SERVICE});
  if (!creds) {
    return null;
  }
  try {
    return JSON.parse(creds.password) as CurrentUser;
  } catch {
    return null;
  }
}

export async function clearCurrentUser(): Promise<void> {
  await Keychain.resetGenericPassword({service: SERVICE});
}
