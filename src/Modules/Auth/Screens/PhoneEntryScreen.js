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
  Modal,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {sendOtpForValidation} from '../../Core/Redux/UserActions';
import AnalyticsServices from '../../../Services/AnalyticsTools/AnalyticsService';
import {logClickEvent, logLoadEvent} from '../../../Services/AnalyticsTools';
import {btnBgColor} from '../../../Config';

const {width, height} = Dimensions.get('window');
const LOGO_HEIGHT = 100,
  LOGO_WIDTH = 250;

const PopupWithButton = ({visible, onClose}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.popup}>
          <Text style={styles.popupText}>
            You are not registered with us.{'\n'}Please contact our support
            team.{' '}
          </Text>
          <TouchableOpacity style={styles.popupBtn} onPress={onClose}>
            <Text style={styles.buttonText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const PhoneEntryScreen = props => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOtpSent, setOtpSentStatus] = useState(false);
  const [isSupportPopup, setSupportPopup] = useState(false);

  const [otp, setOtp] = useState('');

  const dispatch = useDispatch();
  const txtInputRef = useRef(null);

  useEffect(() => {
    AnalyticsServices.logEvent('load', 'app_phone_screen', {});
    setTimeout(() => {
      txtInputRef.current.focus();
    }, 10);
  }, []);

  useEffect(() => {
    if (isSupportPopup) {
      logLoadEvent('app_login_support_popup');
    }
  }, [isSupportPopup]);

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
            console.log(error.message);
            if (error.errorCode == 'USER_NOT_FOUND') {
              setSupportPopup(true);
              return;
            }

            // console.log('Otp send api error', error);
            // ToastAndroid.show(error.errorMessage, ToastAndroid.CENTER);
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

  const _goToSupport = _ => {
    try {
      logClickEvent('app_login_support_popup_action');
      Linking.openURL(
        'https://api.whatsapp.com/send/?phone=%2B919987840055&text=Hello%2C+I+am+reaching+you+out+from+the+FC.ONE+App',
      );
    } catch (error) {
      ToastAndroid.show('Unable to find whatsapp in your phone');
    }
    setSupportPopup(false);
  };

  return (
    <View style={styles.main}>
      <PopupWithButton visible={isSupportPopup} onClose={_goToSupport} />
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  btnBorder: {
    marginBottom: 100,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  popupText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
  },
  button: {
    backgroundColor: btnBgColor,
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
  },
  popupBtn: {
    backgroundColor: 'rgba(242, 153, 74, 1)',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default PhoneEntryScreen;
