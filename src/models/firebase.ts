import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const fbAppName = '[DEFAULT]';

export function initializeFirebase(): typeof firebase {
  if (firebase.apps.some((v) => v.name === fbAppName)) {
    return firebase;
  }

  const projectId = process.env.APP_FIREBASE_PROJECT_ID;
  if (!projectId || projectId === 'xxxxxxxxxxxxx') {
    throw new Error('Hey developer! You must set up Firebase config first');
    // Files you have to prepare:
    //
    // - `.firebaserc`
    // - `.env.local`
    //
    // Where you can find values:
    //
    // - Project ID - Project Overview > Project settings > General > Your project
    // - Web API Key - Project Overview > Project settings > General > Your project
    // - Authorized domains - Authentication > Sign-in method
  }

  const config = {
    apiKey: process.env.APP_FIREBASE_API_KEY,
    authDomain: process.env.APP_FIREBASE_AUTH_DOMAIN,
    projectId,
  };
  firebase.initializeApp(config, fbAppName);

  return firebase;
}
