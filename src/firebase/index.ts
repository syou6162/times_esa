// eslintで怒られるのは合っていて、firebase側が悪そうだが一旦disableしてしのぐ...
// ref: https://stackoverflow.com/questions/67554921/vuejs-and-firebase-import-firebase-package-the-correct-way
// eslint-disable-next-line import/no-extraneous-dependencies
import firebase from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const firebaseAuth = firebaseApp.auth();

export default firebase;
