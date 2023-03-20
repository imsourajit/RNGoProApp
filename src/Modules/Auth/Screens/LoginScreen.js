import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const LOGO_HEIGHT = 100,
  LOGO_WIDTH = 250;

const {height, width} = Dimensions.get('window');

const LoginScreen = props => {
  const goToLoginScreen = () => {
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
          top: (height - LOGO_HEIGHT) / 2,
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
    backgroundColor: '#FFFFFF',
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
    marginBottom: 100,
  },
});

export default LoginScreen;
