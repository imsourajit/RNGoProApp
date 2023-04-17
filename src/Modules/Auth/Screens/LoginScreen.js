import React, {useEffect} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {logClickEvent, logLoadEvent} from '../../../Services/AnalyticsTools';
import {btnBgColor} from '../../../Config';

const LOGO_HEIGHT = 100,
  LOGO_WIDTH = 250;

const {height, width} = Dimensions.get('window');

const LoginScreen = props => {
  useEffect(() => {
    logLoadEvent('app_login_screen');
  }, []);

  const goToLoginScreen = () => {
    logClickEvent('app_login_click');
    props.navigation.navigate('PhoneEntryScreen');
  };

  return (
    <View style={styles.main}>
      <Image
        source={require('../Assets/FC1_logo.png')}
        style={{
          height: 100,
          width: 250,
          position: 'absolute',
          top: 250,
          left: (width - LOGO_WIDTH) / 2,
        }}
      />
      <Pressable onPress={goToLoginScreen} style={styles.btnBorder}>
        <View style={styles.btn}>
          <Text style={styles.btnTxt}>Login</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#000000',
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'flex-end',
  },
  btn: {
    backgroundColor: btnBgColor,
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    color: '#303030',
    fontWeight: 'bold',
    fontSize: 18,
  },
  btnBorder: {
    marginBottom: 60,
  },
});

export default LoginScreen;
