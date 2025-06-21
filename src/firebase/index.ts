import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { config } from '../config';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

// モックモードでない場合のみFirebaseを初期化
if (!config.useMockApi) {
  firebaseApp = initializeApp(config.firebase);
  firebaseAuth = getAuth(firebaseApp);
}

export { firebaseApp, firebaseAuth };
