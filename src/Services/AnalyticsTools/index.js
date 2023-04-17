import {getConfigs} from '../../Config';
import {ALL} from '../../Config/firebaseConfiguration';
import {isEmpty} from '../../Utility/helpers';
import AnalyticsService from './AnalyticsService';

import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

const {apiEndPoint, mixPanelToken} = getConfigs();

export const logClickEvent = (
  eventName,
  eventprops = {},
  analyticsTools = ALL,
) => {
  AnalyticsService.logEvent('click', eventName, eventprops, analyticsTools);
};

export const logLoadEvent = (eventName, eventProps, analyticsTools = ALL) => {
  AnalyticsService.logEvent('load', eventName, eventProps, analyticsTools);
};

export const logEvent = (
  eventType,
  eventName,
  eventProps,
  analyticsTools = ALL,
) => {
  AnalyticsService.logEvent(eventType, eventName, eventProps, analyticsTools);
};

// export const _setUserPropertiesInMoengage = data => {
//   const {
//     user: {
//       userId,
//       role,
//       fullName,
//       email,
//       grade,
//       firstName,
//       lastName,
//       locationInfo,
//       phoneNumber = '',
//       gender,
//     },
//   } = data;

//   const {city, country, district, gpsInfo} = locationInfo ?? {};

//   const {latitude, longitude} = gpsInfo ?? {};

//   ReactMoE.setUserUniqueID(userId);
//   ReactMoE.setUserName(fullName);
//   ReactMoE.setUserFirstName(firstName);
//   ReactMoE.setUserLastName(lastName);
//   ReactMoE.setUserEmailID(email);

//   // setting user properties in Moengage
//   ReactMoE.setUserAttribute('role', role);
//   !isEmpty(latitude) &&
//     !isEmpty(longitude) &&
//     ReactMoE.setUserLocation(new MoEGeoLocation(latitude, longitude));
//   !isEmpty(grade) && ReactMoE.setUserAttribute('grade', grade);
//   !isEmpty(city) && ReactMoE.setUserAttribute('city', city);
//   !isEmpty(country) && ReactMoE.setUserAttribute('country', country);
//   !isEmpty(gender) && ReactMoE.setUserAttribute('gender', gender);
//   !isEmpty(district) && ReactMoE.setUserAttribute('district', district);
//   ReactMoE.setUserAttribute('appVerison', RNDeviceInfo.getVersion());
//   ReactMoE.setUserAttribute('appCode', RNDeviceInfo.getBuildNumber());
//   ReactMoE.setUserContactNumber(phoneNumber);
// };

const _setUserPropertiesInFirebase = async data => {
  const {
    user: {
      userId,
      role,
      fullName,
      email,
      grade,
      firstName,
      lastName,
      locationInfo,
      phoneNumber,
      gender,
    },
  } = data;

  const {city, country, district, gpsInfo} = locationInfo ?? {};

  const {latitude, longitude} = gpsInfo ?? {};

  await analytics().setUserId(userId);
  !isEmpty(fullName) &&
    (await analytics().setUserProperty('fullName', fullName));
  !isEmpty(email) && (await analytics().setUserProperty('email', email));
  !isEmpty(firstName) &&
    (await analytics().setUserProperty('firstName', firstName));
  !isEmpty(lastName) &&
    (await analytics().setUserProperty('lastName', lastName));
  !isEmpty(role) && (await analytics().setUserProperty('role', role));
  !isEmpty(latitude) &&
    (await analytics().setUserProperty('latitude', latitude));
  !isEmpty(longitude) &&
    (await analytics().setUserProperty('longitude', longitude));
  !isEmpty(grade) && (await analytics().setUserProperty('grade', grade));
  !isEmpty(gender) && (await analytics().setUserProperty('grade', gender));
  !isEmpty(city) && (await analytics().setUserProperty('city', city));
  !isEmpty(country) && (await analytics().setUserProperty('country', country));
  !isEmpty(district) &&
    (await analytics().setUserProperty('district', district));
  !isEmpty(phoneNumber) &&
    (await analytics().setUserProperty('phoneNumber', phoneNumber));

  await Promise.all([
    crashlytics().setUserId(userId),
    crashlytics().setAttributes({
      role: role,
      email: email,
      fullName: fullName,
    }),
  ]);
};

export const _setUserPropertiesInAllAnalyticsTools = data => {
  _setUserPropertiesInFirebase(data);

  // _setUserPropertiesInMoengage(data);
};
