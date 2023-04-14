import firebase from '@react-native-firebase/app';
import {getFirebaseConfigs} from './index';

const FirebaseInit = async () => {
  try {
    await firebase.initializeApp(getFirebaseConfigs());
  } catch (e) {
    console.log('Firebase error', e);
  }
};

FirebaseInit();
