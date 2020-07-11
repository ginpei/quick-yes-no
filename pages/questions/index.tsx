import firebase from 'firebase/app';
import Link from 'next/link';
import {
  Question,
  getQuestionPath,
  useLatestQuestions,
} from '../../src/models/Question';
import { initializeFirebase } from '../../src/models/firebase';

initializeFirebase();
const fs = firebase.firestore();

const QuestionIndexPage: React.FC = () => {
  const [questions, questionsReady] = useLatestQuestions(fs);

  return (
    <div className="ui-container QuestionIndexPage">
      <h1>QuestionIndexPage</h1>
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