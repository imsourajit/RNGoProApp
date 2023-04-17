import React, {useEffect, useRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
  Image,
  Dimensions,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {sendOtpForValidation} from '../../Core/Redux/UserActions';
import AnalyticsServices from '../../../Services/AnalyticsTools/AnalyticsService';
import {logClickEvent} from '../../../Services/AnalyticsTools';
import {btnBgColor} from '../../../Config';

const {width, height} = Dimensions.get('window');
const LOGO_HEIGHT = 100,
  LOGO_WIDTH = 250;

const PhoneEntryScreen = props => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOtpSent, setOtpSentStatus] = useState(false);
  const [otp, setOtp] = useState('');

  const dispatch = useDispatch();
  const txtInputRef = useRef(null);

  useEffect(() => {
    AnalyticsServices.logEvent('load', 'app_phone_screen', {});
    setTimeout(() => {
      txtInputRef.current.focus();
    }, 10);
  }, []);

  const proceedBtnPressed = () => {
    if (_checkPhoneNumberValidation()) {
      logClickEvent('app_phone_submit', {
        phone: phoneNumber,
      });
      dispatch(
        sendOtpForValidation(
          {
            phoneNumber,
          },
          response => {
            props.navigation.navigate('OtpInputScreen', {
              phoneNumber,
            });
            console.log('Send otp response', response);
          },
          error => {
            console.log('Otp send api error', error);
            ToastAndroid.show(error.errorMessage, ToastAndroid.CENTER);
          },
        ),
      );
    }
  };

  const _checkPhoneNumberValidation = () => {
    if (phoneNumber.length != 10) {
      ToastAndroid.show('Please enter valid mobile number', ToastAndroid.SHORT);
      return false;
    }
    return true;
  };

  return (
    <View style={styles.main}>
      <Image
        source={require('../Assets/FC1_logo.png')}
        style={{
          height: 50,
          width: 120,
          alignSelf: 'center',
          marginBottom: 30,
          // position: 'absolute',
          // top: 250,
          // left: (width - LOGO_WIDTH) / 2,
        }}
      />
      <View style={{flex: 1}}>
        <Text style={styles.label}>Enter your mobile number</Text>
        <TextInput
          style={styles.inputBox}
          value={phoneNumber}
          placeholder=""
          maxLength={10}
          onChangeText={setPhoneNumber}
          readOnly={isOtpSent}
          keyboardType={'phone-pad'}
          ref={txtInputRef}
        />
      </View>

      <Pressable onPress={proceedBtnPressed}>
        <View style={styles.btn}>
          <Text style={styles.btnTxt}>Proceed</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    // justifyContent: 'space-between',
    paddingVertical: 30,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  inputBox: {
    borderWidth: 0.3,
    borderColor: '#F0F0F0',
    borderRadius: 3,
    // width: Dimensions.get('window').width - 64,
    color: '#FFFFFF',
    marginVertical: 10,
    fontSize: 16,
    paddingHorizontal: 10,
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
    marginBottom: 100,
  },
});

export default PhoneEntryScreen;
