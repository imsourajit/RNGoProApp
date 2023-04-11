import RNFetchBlob from 'rn-fetch-blob';

export const GOPRO10_IMG =
  'https://w7.pngwing.com/pngs/874/504/png-transparent-gopro-hero5-black-gopro-hero6-action-camera-4k-resolution-gopro-electronics-camera-lens-video-camera-thumbnail.png';
export const GOPRO_IP = '10.5.5.9';
export const GOPRO_PORT = '8080';

export const GOPRO_BASE_URL = `http://${GOPRO_IP}:${GOPRO_PORT}/`;

const {config, fs} = RNFetchBlob;
export const APP_DIR = fs.dirs.PictureDir;
export const CAMERA_DIR = fs.dirs.DCIMDir;
