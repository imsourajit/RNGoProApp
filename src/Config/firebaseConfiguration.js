export const PROD_ENV = 'PRODUCTION';
export const STAGING_ENV = 'STAGING';

export const ENV_TYPE = STAGING_ENV;

export const ProdConfig = {
  apiEndPoint: 'https://platform.thewagmi.app/platform',
  googleAuthWebClientId:
    // '104781298024-d76o5hi446b48ao6uh9pub5rlb6c3ggf.apps.googleusercontent.com',
    '440167015126-u51pgofdd7osl69vufnjjjfdhb072ovq.apps.googleusercontent.com',
  mixPanelToken: '230caaf11ac87526eca00667b89307c5',
  codepushDeploymentKey: 'TZcfLKDuUdAL6mo8mdPHHG6bs7Mmlh9fRa4ui',
  smartLookKey: '3d0ddeecc2701627da7dca3af9d5532b335d3fc3',
};

export const StagingConfig = {
  apiEndPoint: 'https://qa-platform.thewagmi.app/platform',
  googleAuthWebClientId:
    '104781298024-d76o5hi446b48ao6uh9pub5rlb6c3ggf.apps.googleusercontent.com',
  mixPanelToken: '230caaf11ac87526eca00667b89307c5',
  codepushDeploymentKey: 'dvtf7buh9Hkj3Mru6ZLUhkIcugQn-ogj9RuCX',
  smartLookKey: '3d0ddeecc2701627da7dca3af9d5532b335d3fc3',
};

export const prodFirebaseConfig = {
  apiKey: 'AIzaSyDFLlDXHrAByk0GFK9HJsVIsiCOMaqr6bM',
  appId: '1:440167015126:android:7ce2811c7b0e08b83b1f77',
  databaseURL: 'firebase-adminsdk-1r2ez@wagmi-qa.iam.gserviceaccount.com',
  messagingSenderId: '440167015126',
  projectId: 'wagmi-338311',
  storageBucket: 'wagmi-338311.appspot.com',
};

export const stagingFirebaseConfig = {
  apiKey: 'AIzaSyC2oeMz3fcd-Y23aM0aiydTq2pSopBr1ZI',
  appId: '1:688457505501:android:67bd26332561dab4fd9934',
  databaseURL: 'firebase-adminsdk-1r2ez@wagmi-qa.iam.gserviceaccount.com',
  messagingSenderId: '104781298024',
  projectId: 'fcone-qa',
  storageBucket: 'fcone-qa.appspot.com',
};

export const ALL = {
  firebase: true,
};
