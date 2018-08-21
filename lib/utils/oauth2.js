import {
  curry,
} from 'ramda';

export const authorizationUrl = curry(
  (url, appId, callback, scope, responseType = 'token', state) =>
    `${url}?access_type=offline&scope=${encodeURIComponent(scope)}&
      state=${state}&
      redirect_uri=${encodeURIComponent(callback)}&
      response_type=${responseType}&
      client_id=${appId}`.replace(/\s+/g, ''),
);

export const getHeaders = token => ({ Authorization: `Bearer ${token}` });
