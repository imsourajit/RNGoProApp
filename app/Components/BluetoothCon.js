import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  PermissionsAndroid,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import {CAMERA_IP, CAMERA_NAME, CAMERA_PASSWORD} from '../Utils/Constants';
import {stringToBytes} from 'convert-string';

import BleManager from 'react-native-ble-manager';

const BluetoothCon = props => {
  const [connectedDevice, setConnectedDevice] = useState({});

  const _scanForDevices = async _ => {
    console.log('Bluetooth devices scanning started ');
    try {
      BleManager.scan([], 5, true)
        .then(devices => {
          console.log('Devices scanned', devices);
        })
        .catch(err => console.log(err));

      BleManager.getConnectedPeripherals([]).then(d => {
        console.log('devices', d[0].id);
        setConnectedDevice(d[0]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const _getReadyForLive = _ => {
    BleManager.connect(connectedDevice.id)
      .then(() => {
        BleManager.retrieveServices(connectedDevice.id, []).then(
          peripheralInfo => {
            console.log('Pesripheral info:', peripheralInfo);
          },
        );

        // BleManager.read(
        //   connectedDevice.id,
        //   'b5f90001-aa8d-11e3-9046-0002a5d5c51b',
        //   'b5f90002-aa8d-11e3-9046-0002a5d5c51b',
        // )
        //   .then(r => {
        //     console.log('Device name', String.fromCharCode(...r));
        //   })
        //   .catch(e => console.log(e));

        // BleManager.read(
        //   connectedDevice.id,
        //   'b5f90001-aa8d-11e3-9046-0002a5d5c51b',
        //   'b5f90003-aa8d-11e3-9046-0002a5d5c51b',
        // )
        //   .then(r => {
        //     console.log('Device name', String.fromCharCode(...r));
        //   })
        //   .catch(e => console.log(e));

        BleManager.write(
          connectedDevice.id,
          'fea6',
          'b5f90072-aa8d-11e3-9046-0002a5d5c51b',
          [
            0x20, 0x15, 0xf1, 0x79, 0x0a, 0x03, 0x78, 0x78, 0x78, 0x10, 0x01,
            0x18, 0x07, 0x38, 0x7b, 0x40, 0x95, 0x06, 0x48, 0xc8, 0x80, 0x03,
            0x50, 0x00,
          ],
        )
          .then(k => {})
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));

    //To get notification of live stream details
    BleManager.write(
      connectedDevice.id,
      'fea6',
      'b5f90076-aa8d-11e3-9046-0002a5d5c51b',
      [],
    )
      .then(suc => console.log('Notification', suc))
      .catch(e => console.log('Notification error', e));
  };

  const _turnShutter = _ => {
    BleManager.write(
      connectedDevice.id,
      'fea6',
      'b5f90072-aa8d-11e3-9046-0002a5d5c51b',
      [0x03, 0x01, 0x01, 0x00],
    )
      .then(status => {
        console.log('Status...', status);
        // if (!status) {
        //   _turnShutter();
        // }
      })
      .catch(e => console.log(e));
  };

  const _goLive = _ => {
    // const LIVESTREAM_START_COMMAND = '010200';
    // // Replace the URL with your actual live stream URL
    // const livestreamUrl = 'rtmp://example.com/live/stream';
    // BleManager.write(connectedDevice.id, 'fea6', '020101', 5)
    //   .then(() => {
    //     const encodedUrl = Buffer.from(livestreamUrl, 'utf8').toString(
    //       'base64',
    //     );
    //     const command = `0201${encodedUrl}00`;
    //     return BleManager.write(
    //       connectedDevice.id,
    //       '00002b20-0000-1000-8000-00805f9b34fb',
    //       command,
    //       5,
    //     );
    //   })
    //   .then(() => {
    //     console.log('Live stream URL set successfully!');
    //     return BleManager.write(
    //       connectedDevice.id,
    //       '00002b20-0000-1000-8000-00805f9b34fb',
    //       LIVESTREAM_START_COMMAND,
    //       5,
    //     );
    //   })
    //   .then(() => {
    //     console.log('Live stream started successfully!');
    //   })
    //   .catch(error => {
    //     console.error(
    //       'Error setting live stream URL and starting live stream:',
    //       error,
    //     );
    //   });
  };

  return (
    <View style={styles.main}>
      {/* {true && <ActivityIndicator size={'large'} color={'blue'} />} */}
      <TouchableOpacity onPress={_scanForDevices} style={styles.btn}>
        <Text style={{fontSize: 24}}>Scan bluetooth devices</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={_getReadyForLive} style={styles.btn}>
        <Text style={{fontSize: 24}}>Go Live</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={_turnShutter} style={styles.btn}>
        <Text style={{fontSize: 24}}> Live</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    marginVertical: 20,
  },
});

export default BluetoothCon;
