import {
  __,
  curry,
  has,
  identity,
  ifElse,
  merge,
  pipe,
  pipeP,
  prop,
} from 'ramda';
import {
  authorizationUrl,
} from '../utils/oauth2';
import {
  fromQueryString,
} from '../utils/uri';

const SCOPE = 'profile';
const AUTH = 'https://access.line.me/oauth2/v2.1/authorize';

const checkError = ifElse(
  has('error'),
  pipe(prop('error'), curry((e) => { throw new Error(e); })),
  identity,
);

export const authorize = (
  { dance },
  { appId, callback, scope = SCOPE, state }) =>
  pipeP(
    dance,
    fromQueryString,
    checkError,
    merge({ appId, callback }),
  )(authorizationUrl(AUTH, appId, callback, scope, 'code', state));