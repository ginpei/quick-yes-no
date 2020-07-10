import { ComponentPropsWithRef, useCallback } from 'react';
import { jcn } from '../util/joinClassNames';
import styles from './FormUI.module.scss';

export type OnFormInputRowChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  name: string,
  value: string
) => void;

export const Button: React.FC<ComponentPropsWithRef<'button'>> = (props) => {
  const { className, ...buttonProps } = props;

  return (
    <button {...buttonProps} className={jcn([styles.Button, className])} />
  );
};

export const Input: React.FC<ComponentPropsWithRef<'input'>> = (props) => {
  const { className, onFocus, ...inputProps } = props;

  const onInputFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (onFocus) {
        onFocus(event);
      } else {
        event.currentTarget.select();
      }
    },
    [onFocus]
  );

  return (
    <input
      {...inputProps}
      className={jcn([styles.Input, className])}
      onFocus={onInputFocus}
    />
  );
};

export const FormInputRow: React.FC<
  Omit<ComponentPropsWithRef<'input'>, 'name' | 'onChange'> & {
    label: string;
    name: string;
    onChange: OnFormInputRowChange;
  }
> = (props) => {
  const { className, label, onChange, ...inputProps } = props;

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const el = event.currentTarget;
      onChange(event, el.name, el.value);
    },
    [onChange]
  );

  return (
    <label className={jcn([styles.FormInputRow, className])}>
      <span className={styles.FormInputRow_label}>
        {label}
        {': '}
      </span>
      <Input {...inputProps} onChange={onInputChange} />
    </label>
  );
};
