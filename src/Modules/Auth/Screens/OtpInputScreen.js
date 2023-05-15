import React, {useEffect, useRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  Dimensions,
  Image,
  View,
  ToastAndroid,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {
  sendOtpForValidation,
  setUserDetails,
  validateOtp,
} from '../../Core/Redux/UserActions';
import {
  _setUserPropertiesInAllAnalyticsTools,
  logClickEvent,
  logLoadEvent,
} from '../../../Services/AnalyticsTools';
import {btnBgColor} from '../../../Config';

const {width, height} = Dimensions.get('window');
const LOGO_HEIGHT = 100,
  LOGO_WIDTH = 250;

const OtpInputScreen = props => {
  const [otpCode, setOtpCode] = useState('');
  const [otpValidationError, setOtpValidationError] = useState('');
  const [timerRunning, setTimerRunning] = useState(0);

  const {phoneNumber} = props.route.params;

  const dispatch = useDispatch();
  const txtInputRef = useRef(null);

  useEffect(() => {
    logLoadEvent('app_otp_screen');
    setTimeout(() => {
      txtInputRef.current.focus();
    }, 300);
  }, []);

  useEffect(() => {
    let timer = 30;
    const interval = setInterval(() => {
      setTimerRunning(timer--);
      if (timer == 0) {
        clearInterval(interval);
        setTimerRunning(0);
      }
      txtInputRef.current.focus();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const validateOtpBtnPressed = () => {
    dispatch(
      validateOtp(
        {
          otp: otpCode,
          phoneNumber: phoneNumber,
        },
        res => {
          logClickEvent('app_otp_submit', {
            otp: otpCode,
            status: 'success',
          });
          _setUserPropertiesInAllAnalyticsTools(res);
          dispatch(
            setUserDetails({...res.user, userCentreCode: res.centreCode}),
          );
          console.log('Otp Verification response', res);
        },
        err => {
          logClickEvent('app_otp_submit', {
            otp: otpCode,
            status: 'failure',
          });
          setOtpValidationError(err.errorMessage);
          console.log('Otp Verification error', err);
        },
      ),
    );
  };

  const _resend = () => {
    if (!timerRunning) {
      let timer = 30;
      const interval = setInterval(() => {
        setTimerRunning(timer--);
        if (timer == 0) {
          clearInterval(interval);
          setTimerRunning(0);
        }
      }, 1000);
      logClickEvent('app_otp_resend', {
        phone: phoneNumber,
      });
      dispatch(
        sendOtpForValidation(
          {
            phoneNumber,
          },
          response => {
            ToastAndroid.show('Otp Resent', ToastAndroid.BOTTOM);
          },
          error => {
            console.log('Otp send api error', error);
            ToastAndroid.show(error.errorMessage, ToastAndroid.CENTER);
          },
        ),
      );
    }
  };

  return (
    <View style={styles.main}>
      <Image
        source={require('../Assets/FC1_logo.png')}
        style={{
          height: 70,
          width: 160,
          alignSelf: 'center',
          marginBottom: 30,
          // position: 'absolute',
          // top: 250,
          // left: (width - LOGO_WIDTH) / 2,
        }}
      />
      <View style={{flex: 1}}>
        <Text style={styles.label}>Enter OTP</Text>
        <TextInput
          style={styles.otpCodeContainer}
          value={otpCode}
          onChangeText={setOtpCode}
          maxLength={4}
          keyboardType={'phone-pad'}
          ref={txtInputRef}
        />
        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
          <Pressable onPress={_resend}>
            <Text
              style={{
                color: timerRunning ? '#ABABAB' : '#FFFFFF',
                alignSelf: 'flex-end',
                marginHorizontal: 6,
              }}>
              Didn't get OTP ?{' '}
              <Text style={{color: timerRunning ? '#ABABAB' : btnBgColor}}>
                Resend
              </Text>
            </Text>
          </Pressable>
          {timerRunning ? (
            <Text
              style={{
                color: '#FFFFFF',
                width: 26,
                // backgroundColor: 'red',
                // alignSelf: 'flex-end',
                // justifyContent: 'flex-end',
              }}>
              {timerRunning}s
            </Text>
          ) : null}
        </View>
        <View
          style={{justifyContent: 'center', alignItems: 'center', padding: 16}}>
          <Text style={{color: 'red', fontSize: 19}}>{otpValidationError}</Text>
        </View>
      </View>

      <Pressable onPress={validateOtpBtnPressed}>
        <View style={styles.btn}>
          <Text style={styles.btnTxt}>Proceed</Text>
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
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  otpCodeContainer: {
    borderWidth: 0.3,
    borderColor: '#F0F0F0',
    borderRadius: 3,
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
    marginBottom: 20,
  },
  btnTxt: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  btnBorder: {
    marginBottom: 100,
  },
});

export default OtpInputScreen;
