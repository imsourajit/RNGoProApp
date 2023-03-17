import React, {useState} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';

const Auth = props => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOtpSent, setOtpSentStatus] = useState(false);
  const [otp, setOtp] = useState('');

  const sendOtp = () => {
    if (phoneNumber.length === 10 && otp.length != 0) {
      // Move to app navigator
      return;
    }

    if (phoneNumber.length < 10) {
      ToastAndroid.show('Please enter valid mobile number', ToastAndroid.SHORT);
      return;
    }
    setOtpSentStatus(true);
    ToastAndroid.show('Otp has been sent', ToastAndroid.SHORT);
  };

  return (
    <View style={styles.main}>
      <Image
        source={require('./Assets/FC1_logo.png')}
        style={{
          width: 300,
          height: 300,
        }}
      />
      <TextInput
        style={styles.inputBox}
        value={phoneNumber}
        placeholder="Enter Mobile Number"
        maxLength={10}
        onChangeText={setPhoneNumber}
        readOnly={isOtpSent}
      />
      <TextInput
        style={[
          styles.inputBox,
          {
            display: isOtpSent ? 'flex' : 'none',
          },
        ]}
        value={otp}
        placeholder="Enter Otp"
        maxLength={10}
        onChangeText={setOtp}
      />
      <Pressable onPress={sendOtp}>
        <View style={styles.btn}>
          <Text style={styles.btnTxt}>{isOtpSent ? 'SUBMIT' : 'SEND OTP'}</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  inputBox: {
    borderWidth: 0.3,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    width: Dimensions.get('window').width - 64,
    color: '#FFFFFF',
    marginVertical: 10,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  btn: {
    padding: 10,
    margin: 2,
    backgroundColor: '#768AC7',
    borderRadius: 10,
    width: Dimensions.get('window').width - 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Auth;
