import firebase from 'firebase/app';
import { useEffect, useState } from 'react';

/**
 * @example
 * initializeFirebase();
 * const auth = firebase.auth();
 * const [user, userReady] = useFirebaseAuth(auth);
 */
export function useFirebaseAuth(
  auth: firebase.auth.Auth
): [firebase.auth.Auth['currentUser'], boolean] {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    return auth.onAuthStateChanged((newUser) => {
      setReady(true);
      setUser(newUser);
    });
  }, []);

  return [user, ready];
}
