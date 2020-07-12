import firebase from 'firebase/app';
import Link from 'next/link';
import {
  Question,
  getQuestionPath,
  useLatestQuestions,
} from '../../src/models/Question';
import { initializeFirebase } from '../../src/models/firebase';
import ErrorPage from '../../src/screens/ErrorPage';
import { useFirebaseAuth } from '../../src/hooks/useFirebaseAuth';

initializeFirebase();
const auth = firebase.auth();
const fs = firebase.firestore();

const QuestionIndexPage: React.FC = () => {
  const [questions, questionsReady, error] = useLatestQuestions(fs);

  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <div className="ui-container QuestionIndexPage">
      <h1>QuestionIndexPage</h1>
      <Link {...getQuestionPath(null, 'new')}>
        <a>New</a>
      </Link>
      {questionsReady ? (
        <>
          {questions.length < 1 && <p>(No items found)</p>}
          {questions.map((question) => (
            <QuestionItem question={question} key={question.id} />
          ))}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default QuestionIndexPage;

const QuestionItem: React.FC<{ question: Question }> = ({ question }) => {
  return (
    <div className="QuestionItem">
      <h2>
        <Link {...getQuestionPath(question, 'view')}>
          <a>{question.title || '(No title)'}</a>
        </Link>
      </h2>
    </div>
  );
};
