// TODO review this page later

import firebase from 'firebase/app';
import 'firebase/auth';
import { useCallback, useState } from 'react';
import { BasicLayout } from '../src/components/BasicLayout';
import { useFirebaseAuth } from '../src/hooks/useFirebaseAuth';
import { initializeFirebase } from '../src/models/firebase';
import { sleep } from '../src/util/sleep';

const dummyEmail = 'yesno-demo@example.com';
const dummyPassword = '8*6KzqW3pdxBYyT!erE2FDrrP97';

initializeFirebase();
const auth = firebase.auth();

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(dummyEmail);
  const [password, setPassword] = useState(dummyPassword);
  const [errorMessage, setErrorMessage] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [user, userReady] = useFirebaseAuth(auth);

  const onLogoutClick = useCallback(async () => {
    setLoggingIn(true);
    await Promise.all([auth.signOut(), sleep(300)]);
    setLoggingIn(false);
  }, []);

  const onEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(event.currentTarget.value);
    },
    []
  );

  const onPasswordChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.currentTarget.value);
    },
    []
  );

  const onSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setErrorMessage('');

      setLoggingIn(true);
      try {
        await auth.signInWithEmailAndPassword(email, password);
      } catch (error) {
        console.error(error);
        setErrorMessage(error?.message ?? 'Unknown error');
      } finally {
        setLoggingIn(false);
      }
    },
    [email, password]
  );

  if (!userReady) {
    return <div>…</div>;
  }

  return (
    <BasicLayout className="LoginPage">
      <h1>Login</h1>
      {errorMessage && <p style={{ color: 'tomato' }}>{errorMessage}</p>}
      {user ? (
        <>
          <p>You have logged in.</p>
          <p>
            <button disabled={loggingIn} onClick={onLogoutClick}>
              Log out
            </button>
          </p>
        </>
      ) : (
        <form onSubmit={onSubmit}>
          <label>
            {'Mail: '}
            <input
              disabled={loggingIn}
              onChange={onEmailChange}
              type="email"
              value={email}
            />
          </label>
          <br />
          <label>
            {'Password: '}
            <input
              disabled={loggingIn}
              onChange={onPasswordChange}
              type="password"
              value={password}
            />
          </label>
          <br />
          <button disabled={loggingIn}>Log in</button>
        </form>
      )}
    </BasicLayout>
  );
};

export default LoginPage;
