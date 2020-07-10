import firebase from 'firebase/app';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { BasicLayout } from '../../src/components/BasicLayout';
import {
  DecisionCallback,
  DecisionForm,
} from '../../src/components/DecisionForm';
import { useFirebaseAuth } from '../../src/hooks/useFirebaseAuth';
import {
  createDecision,
  Decision,
  saveDecision,
  getDecisionPath,
} from '../../src/models/Decision';
import { initializeFirebase } from '../../src/models/firebase';
import { sleep } from '../../src/util/sleep';

initializeFirebase();
const auth = firebase.auth();
const fs = firebase.firestore();

const NewDecisionPage: React.FC = () => {
  const [decision, setDecision] = useState(createDecision());
  const [formDisabled, setFormDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [user, userReady] = useFirebaseAuth(auth);

  const onDecisionChange: DecisionCallback = useCallback(
    (newDecision: Decision) => {
      setDecision(newDecision);
    },
    []
  );

  const onDecisionSubmit: DecisionCallback = useCallback(
    async (newDecision: Decision) => {
      setDecision(newDecision);
      setFormDisabled(true);
      setErrorMessage('');

      try {
        const userId = user?.uid;
        if (!userId) {
          throw new Error('You must log in');
        }

        const [savedDecision] = await Promise.all([
          saveDecision(fs, { ...newDecision, userId }),
          sleep(500),
        ]);

        setDecision(savedDecision);

        const url = getDecisionPath(savedDecision);
        window.location.replace(url.as);
      } catch (error) {
        console.log('Decision', newDecision);
        console.error(error);
        setErrorMessage(error?.message ?? 'Unknown error');
        setFormDisabled(false);
      }
    },
    [user]
  );

  if (!userReady) {
    return <div></div>;
  }

  if (!user) {
    return (
      <BasicLayout>
        <h1>Need to login</h1>
        <p>
          <Link href="/login">
            <a>Log in</a>
          </Link>
        </p>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <h1>NewDecisionPage</h1>
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      <DecisionForm
        disabled={formDisabled}
        decision={decision}
        onChange={onDecisionChange}
        onSubmit={onDecisionSubmit}
      />
    </BasicLayout>
  );
};

export default NewDecisionPage;
