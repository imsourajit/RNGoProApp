import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MainScreen from './MainScreen';
import CameraAPI from '../CameraAPI';
import GoPro from '../GoPro';

const CoreStack = createStackNavigator();

const CoreStackNavigator = () => {
  return (
    <CoreStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <CoreStack.Screen name="Home" component={MainScreen} />
      <CoreStack.Screen name="Camera" component={CameraAPI} />
      <CoreStack.Screen name="GoPro" component={GoPro} />
    </CoreStack.Navigator>
  );
};

export default CoreStackNavigator;
