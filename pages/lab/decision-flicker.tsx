import { useCallback, useState, useEffect } from 'react';
import { OnDecide } from '../../src/components/DecisionFlicker';
import { DecisionForm } from '../../src/components/DecisionForm';
import {
  QuestionCallback,
  QuestionForm,
} from '../../src/components/QuestionForm';
import { decomojiCandidates } from '../../src/models/Candidate';
import { decomojiCategories } from '../../src/models/Category';
import { createQuestion, Question } from '../../src/models/Question';

const dummyQuestion = createQuestion({
  candidates: decomojiCandidates,
  categories: decomojiCategories,
  title: 'Dummy question',
});

const DecisionFlickerDemoPage: React.FC = () => {
  const [question, setQuestion] = useState(dummyQuestion);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  const onQuestionChange: QuestionCallback = useCallback(
    (v) => setQuestion(v),
    []
  );

  const onQuestionSubmit: QuestionCallback = useCallback((v) => {
    setQuestion(v);
    setActiveQuestion(v);
  }, []);

  const onDecide: OnDecide = useCallback(({ candidate, category }) => {
    console.log('# candidate, category', candidate, category);
  }, []);

  return (
    <div className="ui-container DecisionFlickerDemoPage">
      <h1>DecisionFlickerDemoPage</h1>
      <h2>(1/2) Edit question</h2>
      <QuestionForm
        disabled={false}
        onChange={onQuestionChange}
        onSubmit={onQuestionSubmit}
        question={question}
      />
      <h2>(2/2) Make a decision for the question</h2>
      {activeQuestion ? (
        <DecisionForm onDecide={onDecide} question={activeQuestion} />
      ) : (
        <p>No question is activated</p>
      )}
    </div>
  );
};

export default DecisionFlickerDemoPage;
