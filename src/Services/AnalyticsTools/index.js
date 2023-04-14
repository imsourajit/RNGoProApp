import {getConfigs} from '../../Config';
import {ALL} from '../../Config/firebaseConfiguration';
import AnalyticsService from './AnalyticsService';

import analytics from '@react-native-firebase/analytics';

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

  // await analytics().setUserId(userId);
  // !isEmpty(fullName) && analytics().setUserProperty('fullName', fullName);
  // !isEmpty(email) && analytics().setUserProperty('email', email);
  // !isEmpty(firstName) && analytics().setUserProperty('firstName', firstName);
  // !isEmpty(lastName) && analytics().setUserProperty('lastName', lastName);
  // !isEmpty(role) && analytics().setUserProperty('role', role);
  // !isEmpty(latitude) && analytics().setUserProperty('latitude', latitude);
  // !isEmpty(longitude) && analytics().setUserProperty('longitude', longitude);
  // !isEmpty(grade) && analytics().setUserProperty('grade', grade);
  // !isEmpty(gender) && analytics().setUserProperty('grade', gender);
  // !isEmpty(city) && analytics().setUserProperty('city', city);
  // !isEmpty(country) && analytics().setUserProperty('country', country);
  // !isEmpty(district) && analytics().setUserProperty('district', district);
  // !isEmpty(phoneNumber) &&
  //   analytics().setUserProperty('phoneNumber', phoneNumber);
  // analytics().setUserProperty('appVersion', RNDeviceInfo.getVersion());
  // analytics().setUserProperty('appCode', RNDeviceInfo.getBuildNumber());
};

export const _setUserPropertiesInAllAnalyticsTools = data => {
  _setUserPropertiesInFirebase(data);
  // _setUserPropertiesInMoengage(data);
};
