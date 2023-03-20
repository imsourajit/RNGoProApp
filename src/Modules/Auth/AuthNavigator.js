import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Auth from './index';
import LoginScreen from './Screens/LoginScreen';
import PhoneEntryScreen from './Screens/PhoneEntryScreen';
import OtpInputScreen from './Screens/OtpInputScreen';

const AuthStack = createStackNavigator();

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen name="PhoneEntryScreen" component={PhoneEntryScreen} />
      <AuthStack.Screen name="OtpInputScreen" component={OtpInputScreen} />
      <AuthStack.Screen name="Auth" component={Auth} />
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;
