import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MainScreen from './MainScreen';
import CameraAPI from '../CameraAPI';
import GoPro from '../GoPro';
import SessionListScreens from './Screens/SessionListScreens';
import BatchesListScreen from './Screens/BatchesListScreen';
import BatchSelectionScreen from './Screens/BatchSelectionScreen';
import StudentListsScreen from './Screens/StudentListsScreen';

const CoreStack = createStackNavigator();

const CoreStackNavigator = () => {
  return (
    <CoreStack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}>
      <CoreStack.Screen name="Home" component={MainScreen} />
      <CoreStack.Screen
        name="SessionListsScreen"
        component={SessionListScreens}
        options={{
          headerShown: true,
          title: 'Sessions',
          headerStyle: {
            backgroundColor: '#000000',
            elevation: 0,
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <CoreStack.Screen
        name="BatchesListScreen"
        component={BatchesListScreen}
        options={{
          headerShown: true,
          title: 'Batches',
          headerStyle: {
            backgroundColor: '#000000',
            elevation: 0,
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <CoreStack.Screen
        name="BatchSelectionScreen"
        component={BatchSelectionScreen}
        options={{
          headerShown: true,
          title: 'Select Batch',
          headerStyle: {
            backgroundColor: '#000000',
            elevation: 0,
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <CoreStack.Screen name="Camera" component={CameraAPI} />
      <CoreStack.Screen name="GoPro" component={GoPro} />
      <CoreStack.Screen
        name="StudentsListScreen"
        component={StudentListsScreen}
      />
    </CoreStack.Navigator>
  );
};

export default CoreStackNavigator;
