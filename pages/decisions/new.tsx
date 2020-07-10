import { useCallback, useState } from 'react';
import { BasicLayout } from '../../src/components/BasicLayout';
import {
  DecisionCallback,
  DecisionForm,
} from '../../src/components/DecisionForm';
import { createDecision, Decision } from '../../src/models/Decision';
import { sleep } from '../../src/util/sleep';

const NewDecisionPage: React.FC = () => {
  const [decision, setDecision] = useState(createDecision());
  const [formDisabled, setFormDisabled] = useState(false);

  const onDecisionChange: DecisionCallback = useCallback(
    (newDecision: Decision) => {
      setDecision(newDecision);
    },
    []
  );

  const onDecisionSubmit: DecisionCallback = useCallback(
    async (newDecision: Decision) => {
      console.log('# submit', newDecision);
      setFormDisabled(true);
      await sleep(500);
      setFormDisabled(false);
    },
    []
  );

  return (
    <BasicLayout>
      <h1>NewDecisionPage</h1>
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
