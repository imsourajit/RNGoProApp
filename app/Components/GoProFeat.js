import React, {useState} from 'react';
import {
  NativeEventEmitter,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import WifiManager from 'react-native-wifi-reborn';

import * as protobuf from 'protobufjs';
import {bytesToString} from 'convert-string';

const jsonDescriptor = require('./goprolivestream.json');

const reqLiveStream = require('./RequestLiveStream_pb');

const bleManagerEmitter = new NativeEventEmitter(BleManager);

const requestStartScan = require('./Proto/RequestStartScan_pb');

function convertToByteArray(loginParameters) {
  var mainbytesArray = [];
  for (var i = 0; i < loginParameters.length; i++) {
    var bytes = [];
    for (var j = 0; j < loginParameters[i].length; ++j) {
      bytes.push(loginParameters[i].charCodeAt(j));
    }
    mainbytesArray.push(bytes);
  }
  return mainbytesArray;
}

async function connectAndPrepare(peripheral, service, characteristic) {
  // Connect to device
  await BleManager.connect(peripheral);
  // Before startNotification you need to call retrieveServices
  await BleManager.retrieveServices(peripheral);
  // To enable BleManagerDidUpdateValueForCharacteristic listener
  await BleManager.startNotification(peripheral, service, characteristic);
  // Add event listener
  bleManagerEmitter.addListener(
    'BleManagerDidUpdateValueForCharacteristic',
    ({value, peripheral, characteristic, service}) => {
      // Convert bytes array to string
      const data = bytesToString(value);
      console.log(
        `Received byte to string ${data} for characteristic ${characteristic}`,
      );
      console.log(`Received ${value} for characteristic ${characteristic}`);
    },
  );
  // Actions triggereng BleManagerDidUpdateValueForCharacteristic event
}

const GoProFeat = props => {
  const [connectedDevice, setConnectedDevice] = useState({id: ''});

  const _getConnectedDevice = _ => {
    try {
      BleManager.getConnectedPeripherals([]).then(d => {
        console.log('devices', d[0].id);
        setConnectedDevice(d[0]);
      });
    } catch (error) {
      console.log('Error in getting connected device', error);
    }
  };

  const _connectGoProThroughWifi = async _ => {
    BleManager.connect(connectedDevice.id)
      .then(() => {
        BleManager.retrieveServices(connectedDevice.id, []).then(
          peripheralInfo => {
            console.log('Pesripheral info:', peripheralInfo);
          },
        );

        BleManager.read(
          connectedDevice.id,
          'b5f90001-aa8d-11e3-9046-0002a5d5c51b',
          'b5f90002-aa8d-11e3-9046-0002a5d5c51b',
        )
          .then(r => {
            console.log('Device name', String.fromCharCode(...r));
          })
          .catch(e => console.log('Error while fetching wifi name', e));

        // tostart receiving notifications

        connectAndPrepare(
          connectedDevice.id,
          'fea6',
          'b5f90073-aa8d-11e3-9046-0002a5d5c51b',
        );

        // BleManager.startNotification(
        //   connectedDevice.id,
        //   'fea6',
        //   'b5f90073-aa8d-11e3-9046-0002a5d5c51b',
        // )
        //   .then(r =>
        //     console.log('Notification listener started for live stream mode'),
        //   )
        //   .catch(e =>
        //     console.log('Failure: Live Stream Mode Notifications', e),
        //   );

        BleManager.read(
          connectedDevice.id,
          'b5f90001-aa8d-11e3-9046-0002a5d5c51b',
          'b5f90003-aa8d-11e3-9046-0002a5d5c51b',
        )
          .then(r => {
            console.log('Device password', r);
          })
          .catch(e => console.log('Error while fetching wifi password', e));
      })
      .catch(e => console.log('Error in connection', e));
  };

  const _goToLiveStreamMode = async _ => {
    // await WifiManager.connectToProtectedSSID('GoProHero10', '5Gy-xMV-8zt', false)
    //   .then(r => console.log('Success', r))
    //   .catch(e => console.log('Error', e));
    BleManager.connect(connectedDevice.id)
      .then(() => {
        BleManager.retrieveServices(connectedDevice.id, []).then(
          peripheralInfo => {
            console.log('Pesripheral info:', peripheralInfo);
          },
        );

        connectAndPrepare(
          connectedDevice.id,
          'fea6',
          'b5f90077-aa8d-11e3-9046-0002a5d5c51b',
        );
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
          .then(async k => {
            console.log('Live stream mode getting ready', k);
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  };

  const _setLiveStreamWithJs = async _ => {
    const reqLiveStreamObj = new reqLiveStream.RequestLiveStream();

    reqLiveStreamObj.setUrl(
      'rtmp://live.twitch.tv/app/live_886107155_KbkkdL6BWSiSfSVm6CibN3aqedvZL5/',
    );
    reqLiveStreamObj.setEncode(true);

    const byte = reqLiveStreamObj.serializeBinary();
    // console.log(byte)

    // return;

    // const message = reqLiveStream.goproto.RequestLiveStream.create({
    //   url: 'rtmp://a.rtmp.youtube.com/live2/9pdk-jfgv-6fau-z4v4-1wha/',
    //   encode: true,
    // });
    //
    // console.log(reqLiveStream, reqLiveStream.goproto.RequestLiveStream.fromObject(message));

    // const bytes =
    //   reqLiveStream.goproto.RequestLiveStream.encode(message).finish();

    // const reqLiveStreamObj = new reqLiveStream.goproto.RequestLiveStream();
    // reqLiveStreamObj.url = 'rtmp://a.rtmp.youtube.com/live2/9pdk-jfgv-6fau-z4v4-1wha';
    // reqLiveStreamObj.encode = true;

    BleManager.write(
      connectedDevice.id,
      'fea6',
      'b5f90076-aa8d-11e3-9046-0002a5d5c51b',
      [
        10, 72, 114, 116, 109, 112, 58, 47, 47, 108, 105, 118, 101, 46, 116,
        119, 105, 116, 99, 104, 46, 116, 118, 47, 97, 112, 112, 47, 108, 105,
        118, 101, 95, 56, 56, 54, 49, 48, 55, 49, 53, 53, 95, 75, 98, 107, 107,
        100, 76, 54, 66, 87, 83, 105, 83, 102, 83, 86, 109, 54, 67, 105, 98, 78,
        51, 97, 113, 101, 100, 118, 90, 76, 53, 47, 16, 1,
      ],
    )
      .then(suc => {
        console.log('Set Live Stream Mode', suc);

        BleManager.write(
          connectedDevice.id,
          'fea6',
          'b5f90072-aa8d-11e3-9046-0002a5d5c51b',
          [0x03, 0x01, 0x01, 0x01],
        )
          .then(suc => console.log('Shutter', suc))
          .catch(e => console.log('Shutter', e));
      })
      .catch(e => console.log('Notification error', e));
  };

  const _setLiveStreamUrl = async _ => {
    var root = protobuf.Root.fromJSON(jsonDescriptor);
    const msgType = root.lookupType('goprolivestream.LiveStream');

    const message = msgType.create({
      url: 'rtmp://live.twitch.tv/app/live_886107155_KbkkdL6BWSiSfSVm6CibN3aqedvZL5/',
      encode: true,
    });

    const buffer = msgType.encode(message).finish();

    BleManager.write(
      connectedDevice.id,
      'fea6',
      'b5f90076-aa8d-11e3-9046-0002a5d5c51b',
      [
        10, 57, 114, 116, 109, 112, 58, 47, 47, 97, 46, 114, 116, 109, 112, 46,
        121, 111, 117, 116, 117, 98, 101, 46, 99, 111, 109, 47, 108, 105, 118,
        101, 50, 47, 57, 112, 100, 107, 45, 106, 102, 103, 118, 45, 54, 102, 97,
        117, 45, 122, 52, 118, 52, 45, 49, 119, 104, 97, 47, 16, 1,
      ],
    )
      .then(suc => console.log('Notification', suc))
      .catch(e => console.log('Notification error', e));

    BleManager.write(
      connectedDevice.id,
      'fea6',
      'b5f90072-aa8d-11e3-9046-0002a5d5c51b',
      [0x03, 0x01, 0x01, 0x01],
    )
      .then(suc => console.log('Shutter', suc))
      .catch(e => console.log('Shutter', e));

    console.log(buffer);
  };

  const _endLiveStream = _ => {
    BleManager.write(
      connectedDevice.id,
      'fea6',
      'b5f90072-aa8d-11e3-9046-0002a5d5c51b',
      [0x03, 0x01, 0x01, 0x00],
    )
      .then(suc => console.log('Shutter', suc))
      .catch(e => console.log('Shutter', e));
  };

  const _testwifi = async _ => {
    await WifiManager.connectToProtectedSSID(
      "Munna'sNetwork",
      'Sivani@04',
      false,
    )
      .then(async r => {
        console.log('Success', r);
        // await WifiManager.forceWifiUsageWithOptions(true, {noInternet: true});
      })
      .catch(e => console.log('Error', e));
    // await WifiManager.connectToProtectedSSID(
    //   "Sourajit's Galaxy S22 Ultra",
    //   'tdtu8190',
    //   false,
    // )
    //   .then(async r => {
    //     console.log('Success', r);
    //     await WifiManager.forceWifiUsageWithOptions(true, {noInternet: false});
    //   })
    //   .catch(e => console.log('Error', e));
  };

  const _goForLiveStreaming = async _ => {
    const deviceId = connectedDevice.id;

    connectAndPrepare(
      deviceId,
      'b5f90090-aa8d-11e3-9046-0002a5d5c51b',
      'b5f90092-aa8d-11e3-9046-0002a5d5c51b',
    );

    // start Scanning access points

    BleManager.connect(deviceId)
      .then(async _ => {
        console.log('Device connected ');

        // const root = await protobuf.loadSync('./proto/RequestStartScan.proto');
        // const RequestStartScan = await root.lookupType('RequestStartScan');

        // start scanning access points

        // console.log('@ap', RequestStartScan);

        BleManager.write(
          connectedDevice.id,
          'b5f90090-aa8d-11e3-9046-0002a5d5c51b',
          'b5f90091-aa8d-11e3-9046-0002a5d5c51b',
          [0x02, 0x03, 0x04, 0x05, 0x0b, 0x0c, 0x82, 0x83, 0x84, 0x85],
        )
          .then(suc => console.log('Notification', suc))
          .catch(e => console.log('Notification error', e));
      })
      .catch(e => console.log('Device connection error', e));
  };

  return (
    <View style={styles.main}>
      <Text>{connectedDevice.id}</Text>
      <TouchableOpacity onPress={_getConnectedDevice} style={styles.btn}>
        <Text style={styles.btnTxt}>Get Connected Device</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={_connectGoProThroughWifi} style={styles.btn}>
        <Text style={styles.btnTxt}>Wifi Connect</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={_goToLiveStreamMode} style={styles.btn}>
        <Text style={styles.btnTxt}>Go To Live Stream Mode</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={_setLiveStreamWithJs} style={styles.btn}>
        <Text style={styles.btnTxt}>Set Live Stream</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={_endLiveStream} style={styles.btn}>
        <Text style={styles.btnTxt}>End Live Stream</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={_testwifi} style={styles.btn}>
        <Text style={styles.btnTxt}>Connect wifi</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={_goForLiveStreaming} style={styles.btn}>
        <Text style={styles.btnTxt}>Complete Flow</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    // flex: 1,
    // flexDirection: 'row',
    padding: 20,
  },
  btn: {
    padding: 5,
    margin: 5,
    backgroundColor: '#ababab',
    // width: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    color: '#000000',
  },
});

export default GoProFeat;
