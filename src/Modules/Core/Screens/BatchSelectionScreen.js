import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  FlatList,
  NativeModules,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import RadioButtonSelectionBox from '../Components/RadioButtonSelectionBox';
import {listBatchesByCoachId} from '../Redux/UserActions';
import {useDispatch, useSelector} from 'react-redux';
import {getFreeSpaceInGB} from '../../../Utility/helpers';
import RNFS from 'react-native-fs';
import {logClickEvent, logLoadEvent} from '../../../Services/AnalyticsTools';

const BatchSelectionScreen = props => {
  const [batchSelected, selectBatch] = useState(null);
  const [batches, setBatches] = useState([]);

  const dispatch = useDispatch();
  const {
    user: {userId},
  } = useSelector(st => st.userReducer);

  useEffect(() => {
    const backAction = () => {
      logClickEvent('app_back', {
        screen: 'record',
        type: 'soft',
      });
      props.navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    logLoadEvent('app_record_batch_screen', {
      pageSource: props.route.params?.selectedDevice
        ?.replace('_', '')
        ?.toLowerCase(),
    });
  }, []);

  useEffect(() => {
    dispatch(
      listBatchesByCoachId(
        {
          coachId: userId,
        },
        res => setBatches(res),
        err => {
          console.log('Error', err);
          ToastAndroid.show('Unable to fetch list', ToastAndroid.SHORT);
        },
      ),
    );
  }, []);

  const _onSelectingBatch = batchIndex => {
    logClickEvent('app_record_batch_select', {
      batch: batches[batchIndex]?.id,
    });
    selectBatch(batchIndex);
  };

  const _renderListOfSessions = ({item, index}) => (
    <RadioButtonSelectionBox
      pressed={_onSelectingBatch}
      btnTitle={item.title}
      btnDesc={item.desc}
      batchSelected={batchSelected}
      index={index}
    />
  );

  const _startSession = () => {
    if (batchSelected == null) {
      ToastAndroid.show('Please select batch', ToastAndroid.SHORT);
      return;
    }

    const {selectedDevice, toRecord} = props.route.params;

    logClickEvent('app_record_start', {
      pageSource: selectedDevice?.replaceAll('_', '')?.toLowerCase(),
    });

    if (selectedDevice === 'CAMERA') {
      RNFS.getFSInfo().then(info => {
        const availableSpace = (info.freeSpace / (1024 * 1024 * 1024)).toFixed(
          2,
        );
        if (availableSpace > 5) {
          NativeModules.CameraModule.openCamera();
        } else {
          ToastAndroid.show(
            'Oops!!! Free space not available!',
            ToastAndroid.CENTER,
          );
        }
      });
      return;
    }

    if (selectedDevice === 'GO_PRO') {
      // if (toRecord) {
      props.navigation.navigate('GoProRecordScreen', {
        batchId: batches[batchSelected]?.id,
      });
      return;
      // }

      // props.navigation.navigate('GoPro', {
      //   batchId: batches[batchSelected]?.id,
      // });
      return;
    }
  };
  return (
    <View style={styles.main}>
      <FlatList
        data={batches}
        renderItem={_renderListOfSessions}
        keyExtractor={(item, index) => item.title.toString() + index}
      />
      <View style={{height: 120, justifyContent: 'center'}}>
        <Pressable onPress={_startSession}>
          <View style={styles.btn}>
            <Text style={styles.btnTxt}>START SESSION</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
  },
  btnTxt: {
    color: '#FFFFFF',
    fontSize: 18,
    textTransform: 'uppercase',
  },
  btn: {
    backgroundColor: '#3164F4',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
});

export default BatchSelectionScreen;
