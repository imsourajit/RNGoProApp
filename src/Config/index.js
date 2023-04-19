import {
  ENV_TYPE,
  PROD_ENV,
  ProdConfig,
  StagingConfig,
  prodFirebaseConfig,
  stagingFirebaseConfig,
} from './firebaseConfiguration';

export const getEnvType = _ => ENV_TYPE;

export const getConfigs = _ =>
  getEnvType() === PROD_ENV ? ProdConfig : StagingConfig;

export const getFirebaseConfigs = _ =>
  getEnvType() === PROD_ENV ? prodFirebaseConfig : stagingFirebaseConfig;

export const btnBgColor = '#F2994A';
