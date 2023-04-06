import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MainScreen from './MainScreen';
import CameraAPI from '../CameraAPI';
import GoPro from '../GoPro';
import SessionListScreens from './Screens/SessionListScreens';
import BatchesListScreen from './Screens/BatchesListScreen';
import BatchSelectionScreen from './Screens/BatchSelectionScreen';
import StudentListsScreen from './Screens/StudentListsScreen';
import BackupScreen from '../GoPro/BackupScreen';
import GoProRecordScreen from '../GoPro/GoProRecordScreen';
import SequentialBackupScreen from '../GoPro/SequentialBackupScreen';

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
      <CoreStack.Screen
        name="GoPro"
        component={GoPro}
        options={{
          headerShown: true,
          title: 'Go LIVE',
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
        name="GoProRecordScreen"
        component={GoProRecordScreen}
        options={{
          headerShown: true,
          title: 'Record Session',
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
        options={{
          headerShown: true,
          title: 'Backup Files',
          headerStyle: {
            backgroundColor: '#000000',
            elevation: 0,
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
        name="BackupScreen"
        component={BackupScreen}
      />

      <CoreStack.Screen
        options={{
          headerShown: true,
          title: 'Backup Files',
          headerStyle: {
            backgroundColor: '#000000',
            elevation: 0,
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
        name="SequentialBackupScreen"
        component={SequentialBackupScreen}
      />
      <CoreStack.Screen
        name="StudentsListScreen"
        component={StudentListsScreen}
        options={{
          headerShown: true,
          title: 'Students',
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
    </CoreStack.Navigator>
  );
};

export default CoreStackNavigator;
