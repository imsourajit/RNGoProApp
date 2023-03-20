import React from 'react';
import {useSelector} from 'react-redux';
import CoreStackNavigator from './CoreNavigator';
import AuthStackNavigator from '../Auth/AuthNavigator';

const Source = props => {
  const {user} = useSelector(st => st.userReducer);

  if (user) {
    return <CoreStackNavigator />;
  } else {
    return <AuthStackNavigator />;
  }
};

export default Source;
