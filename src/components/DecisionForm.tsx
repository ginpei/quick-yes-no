import { useCallback, useState } from 'react';
import { Decision } from '../models/Decision';
import { Button, FormInputRow, OnFormInputRowChange } from './FormUI';
import { JsonInputRow, OnJsonInputChange } from './JsonInput';

export type DecisionCallback = (decision: Decision) => void;

export const DecisionForm: React.FC<{
  decision: Decision;
  disabled: boolean;
  onChange: DecisionCallback;
  onSubmit: DecisionCallback;
}> = ({ decision, disabled, onChange, onSubmit }) => {
  const onFormSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      onSubmit(decision);
    },
    [onSubmit, decision]
  );

  const onInputChange: OnFormInputRowChange = useCallback(
    (event, name, value) => {
      onChange({ ...decision, [name]: value });
    },
    [onChange]
  );

  const onJsonChange: OnJsonInputChange = useCallback(
    (event, name, value, error) => {
      if (error) {
        return;
      }

      onChange({ ...decision, [name]: value as any });
    },
    [onChange]
  );

  return (
    <form className="DecisionForm" onSubmit={onFormSubmit}>
      <FormInputRow
        disabled={disabled}
        label="Title"
        name="title"
        onChange={onInputChange}
        value={decision.title}
      />
      <JsonInputRow
        disabled={disabled}
        label="Candidates (JSON)"
        name="candidates"
        onChange={onJsonChange}
        value={decision.candidates}
      />
      <JsonInputRow
        disabled={disabled}
        label="Categories (JSON)"
        name="categories"
        onChange={onJsonChange}
        value={decision.categories}
      />
      <p>
        <Button disabled={disabled}>{decision.id ? 'Create' : 'Update'}</Button>
      </p>
    </form>
  );
};
