import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {sendOtpForValidation} from '../../Core/Redux/UserActions';

const PhoneEntryScreen = props => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOtpSent, setOtpSentStatus] = useState(false);
  const [otp, setOtp] = useState('');

  const dispatch = useDispatch();

  const proceedBtnPressed = () => {
    if (_checkPhoneNumberValidation()) {
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
      <View>
        <Text style={{color: '#FFFFFF'}}>Enter your mobile number</Text>
        <TextInput
          style={styles.inputBox}
          value={phoneNumber}
          placeholder=""
          maxLength={10}
          onChangeText={setPhoneNumber}
          readOnly={isOtpSent}
          keyboardType={'phone-pad'}
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
    justifyContent: 'space-between',
    paddingVertical: 30,
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

export default PhoneEntryScreen;
