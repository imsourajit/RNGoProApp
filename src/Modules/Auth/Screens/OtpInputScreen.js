import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {setUserDetails, validateOtp} from '../../Core/Redux/UserActions';
import {
  _setUserPropertiesInAllAnalyticsTools,
  logClickEvent,
  logLoadEvent,
} from '../../../Services/AnalyticsTools';

const OtpInputScreen = props => {
  const [otpCode, setOtpCode] = useState('');
  const [otpValidationError, setOtpValidationError] = useState('');

  const {phoneNumber} = props.route.params;

  const dispatch = useDispatch();

  useEffect(() => {
    logLoadEvent('app_otp_screen');
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
          dispatch(setUserDetails(res.user));
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

  return (
    <View style={styles.main}>
      <View>
        <Text style={{color: '#FFFFFF'}}>Enter otp</Text>
        <TextInput
          style={styles.otpCodeContainer}
          value={otpCode}
          onChangeText={setOtpCode}
          maxLength={4}
          keyboardType={'phone-pad'}
        />
        <Text style={{color: 'red', fontSize: 16}}>{otpValidationError}</Text>
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

export default OtpInputScreen;
