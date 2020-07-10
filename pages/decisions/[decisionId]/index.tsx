import { useRouter } from 'next/dist/client/router';
import { BasicLayout } from '../../../src/components/BasicLayout';

const DecisionViewPage: React.FC<{}> = (props) => {
  const router = useRouter();
  const { decisionId } = router.query;

  if (typeof decisionId !== 'string') {
    return <div>...</div>;
  }

  return (
    <BasicLayout className="ui-container DecisionViewPage">
      <h1>DecisionViewPage</h1>
      <p>
        <code>{decisionId}</code>
      </p>
    </BasicLayout>
  );
};

export default DecisionViewPage;
