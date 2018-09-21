import { Linking, AppState } from 'react-native'; // eslint-disable-line import/no-unresolved, max-len
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

export const dance = async (authUrl) => {
  cleanup();
  await InAppBrowser.isAvailable();
  return InAppBrowser.open(authUrl, {
    // iOS Properties
    dismissButtonStyle: 'cancel',
    // Android Properties
    showTitle: true,
    enableUrlBarHiding: true,
    enableDefaultShare: false,
    forceCloseOnRedirection: true,
  })
    .then(() => new Promise((resolve, reject) => {
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
    }));
};

export const request = fetch;