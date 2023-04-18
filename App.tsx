/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import store, {persistor} from './src/Store/store';
import crashlytics from '@react-native-firebase/crashlytics';

import Source from './src/Modules/Core/Source';
import CodePush from 'react-native-code-push';
import {getConfigs} from './src/Config';

let CodePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_START,
  mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
  installMode: CodePush.InstallMode.ON_NEXT_RESTART,
  deploymentKey: getConfigs().codepushDeploymentKey,
};

class App extends React.Component {
  componentDidMount() {
    crashlytics().log('App Mounted');
  }

  componentDidCatch(error: Error) {
    crashlytics().recordError(error);
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <NavigationContainer>
            <Source />
          </NavigationContainer>
        </PersistGate>
      </Provider>
    );
  }
}
const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default CodePush(CodePushOptions)(App);
