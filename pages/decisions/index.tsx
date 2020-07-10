import firebase from 'firebase/app';
import Link from 'next/link';
import {
  Decision,
  getDecisionPath,
  useLatestDecisions,
} from '../../src/models/Decision';
import { initializeFirebase } from '../../src/models/firebase';

initializeFirebase();
const fs = firebase.firestore();

const DecisionIndexPage: React.FC = () => {
  const [decisions, decisionsReady] = useLatestDecisions(fs);

  return (
    <div className="ui-container DecisionIndexPage">
      <h1>DecisionIndexPage</h1>
      {decisionsReady ? (
        <>
          {decisions.length < 1 && <p>(No items found)</p>}
          {decisions.map((decision) => (
            <DecisionItem decision={decision} key={decision.id} />
          ))}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DecisionIndexPage;

const DecisionItem: React.FC<{ decision: Decision }> = ({ decision }) => {
  return (
    <div className="DecisionItem">
      <h2>
        <Link {...getDecisionPath(decision, 'view')}>
          <a>{decision.title || '(No title)'}</a>
        </Link>
      </h2>
    </div>
  );
};
