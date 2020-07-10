import { useRouter } from 'next/dist/client/router';
import { BasicLayout } from '../../../src/components/BasicLayout';

const QuestionViewPage: React.FC<{}> = (props) => {
  const router = useRouter();
  const { questionId } = router.query;

  if (typeof questionId !== 'string') {
    return <div>...</div>;
  }

  return (
    <BasicLayout className="ui-container QuestionViewPage">
      <h1>QuestionViewPage</h1>
      <p>
        <code>{questionId}</code>
      </p>
    </BasicLayout>
  );
};

export default QuestionViewPage;
