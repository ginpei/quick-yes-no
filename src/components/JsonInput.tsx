import { ComponentPropsWithRef, useCallback, useState } from 'react';
import styles from './JsonInput.module.scss';

export type OnJsonInputChange = (
  event: React.ChangeEvent<HTMLTextAreaElement>,
  name: string,
  /**
   * New value, or old value if JSON format is not correct.
   */
  value: Record<string, unknown> | unknown[],
  /**
   * Given if any error occurred while formatting input JSON.
   */
  error?: Error
) => void;

export const JsonInputRow: React.FC<
  Omit<ComponentPropsWithRef<'textarea'>, 'onChange' | 'value'> & {
    label: string;
    onChange: OnJsonInputChange;
    value: Record<string, unknown> | unknown[];
  }
> = (props) => {
  const { label, onChange, value, ...textareaProps } = props;
  const [json, setJson] = useState(JSON.stringify(value));
  const [errorMessage, setErrorMessage] = useState('');

  const onJsonChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newJson = event.currentTarget.value;
      setJson(newJson);

      try {
        const newValue = JSON.parse(newJson);
        setErrorMessage('');
        onChange(event, event.currentTarget.name, newValue);
      } catch (error) {
        setErrorMessage(error?.message ?? 'Unknown error');
        onChange(event, event.currentTarget.name, value, error);
      }
    },
    [onChange, value]
  );

  return (
    <label>
      {label}:
      <br />
      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
      <textarea
        {...textareaProps}
        className={styles.JsonInput}
        onChange={onJsonChange}
        value={json}
      />
    </label>
  );
};
