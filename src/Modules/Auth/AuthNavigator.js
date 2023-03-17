import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Auth from './index';

const AuthStack = createStackNavigator();

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <AuthStack.Screen name="Auth" component={Auth} />
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;
