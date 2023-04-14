import analytics from '@react-native-firebase/analytics';
import {ALL} from '../../Config/firebaseConfiguration';

const AnalyticsServices = {
  // extraParams: {
  //   appVersion: RNDeviceInfo.getVersion(),
  //   appCode: RNDeviceInfo.getBuildNumber(),
  // },

  logEvent: async function (
    eventType,
    eventName,
    eventProperties,
    analyticsTool = ALL,
  ) {
    const {firebase} = analyticsTool;

    if (firebase) {
      try {
        await analytics().logEvent(eventName, {
          ...eventProperties,
          ...AnalyticsServices.extraParams,
        });
        console.log('__FIREBASE__ Firebase event successfully pushed', {
          eventName,
          eventProperties,
        });
      } catch (e) {
        console.log('__FIREBASE__ ERROR Firebase event failed ', {
          eventName,
          eventProperties,
          e,
        });
      }
    }
  },
};

export default AnalyticsServices;
