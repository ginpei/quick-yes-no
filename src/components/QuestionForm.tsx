import { useCallback } from 'react';
import { Question } from '../models/Question';
import { Button, FormInputRow, OnFormInputRowChange } from './FormUI';
import { JsonInputRow, OnJsonInputChange } from './JsonInput';

export type QuestionCallback = (question: Question) => void;

export const QuestionForm: React.FC<{
  question: Question;
  disabled: boolean;
  onChange: QuestionCallback;
  onSubmit: QuestionCallback;
}> = ({ question, disabled, onChange, onSubmit }) => {
  const onFormSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      onSubmit(question);
    },
    [onSubmit, question]
  );

  const onInputChange: OnFormInputRowChange = useCallback(
    (event, name, value) => {
      onChange({ ...question, [name]: value });
    },
    [onChange]
  );

  const onJsonChange: OnJsonInputChange = useCallback(
    (event, name, value, error) => {
      if (error) {
        return;
      }

      onChange({ ...question, [name]: value as any });
    },
    [onChange]
  );

  return (
    <form className="QuestionForm" onSubmit={onFormSubmit}>
      <FormInputRow
        disabled={disabled}
        label="Title"
        name="title"
        onChange={onInputChange}
        value={question.title}
      />
      <JsonInputRow
        disabled={disabled}
        label="Candidates (JSON)"
        name="candidates"
        onChange={onJsonChange}
        value={question.candidates}
      />
      <JsonInputRow
        disabled={disabled}
        label="Categories (JSON)"
        name="categories"
        onChange={onJsonChange}
        value={question.categories}
      />
      <p>
        <Button disabled={disabled}>{question.id ? 'Update' : 'Create'}</Button>
      </p>
    </form>
  );
};
