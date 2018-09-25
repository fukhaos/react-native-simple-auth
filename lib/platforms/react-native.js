import { Linking, AppState, Platform } from 'react-native'; // eslint-disable-line import/no-unresolved, max-len
import InAppBrowser from 'react-native-inappbrowser-reborn';

let appStateTimeout;
let previousLinkingCallback;
let previousAppStateCallback;

const cleanup = () => {
  clearTimeout(appStateTimeout);

  if (previousLinkingCallback) {
    Linking.removeEventListener('url', previousLinkingCallback);
    previousLinkingCallback = null;
  }

  if (previousAppStateCallback) {
    AppState.removeEventListener('change', previousAppStateCallback);
    previousAppStateCallback = null;
  }
};

const browserOptions = {
  // iOS Properties
  dismissButtonStyle: 'cancel',
  // Android Properties
  showTitle: true,
  enableUrlBarHiding: true,
  enableDefaultShare: false,
  forceCloseOnRedirection: true,
}

export const dance = async (authUrl) => {
  cleanup();
  await InAppBrowser.isAvailable();
  if (Platform.OS === 'ios') {
    return InAppBrowser.openAuth(authUrl, 'http://staging.creator.ninja:8000/1.0.0/social/line/redirect', browserOptions)
      .then(handleResponse)
  }
  return InAppBrowser.open(authUrl, browserOptions)
    .then(handleResponse)
};

const handleResponse = (res) => new Promise((resolve, reject) => {
  if (Platform.OS === 'ios') {
    if (res.type === 'success' &&
      res.url) {
      return resolve(res.url)
    } else if (res.type === 'cancel') {
      return reject('cancelled')
    }
  }

  const handleUrl = (url) => {
    if (!url || url.indexOf('fail') > -1) {
      reject(url);
    } else {
      resolve(url);
    }
  };

  const linkingCallback = ({ url }) => {
    cleanup();
    handleUrl(url);
  };

  Linking.addEventListener('url', linkingCallback);
  previousLinkingCallback = linkingCallback;

  const appStateCallback = (state) => {
    // Give time for Linking event to fire.
    appStateTimeout = setTimeout(() => {
      if (state === 'active') {
        cleanup();
        reject('cancelled');
      }
    }, 100);
  };

  AppState.addEventListener('change', appStateCallback);
  previousAppStateCallback = appStateCallback;
});

export const request = fetch;