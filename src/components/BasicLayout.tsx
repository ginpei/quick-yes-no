import { ComponentPropsWithRef } from 'react';
import { jcn } from '../util/joinClassNames';

export const BasicLayout: React.FC<ComponentPropsWithRef<'div'>> = (props) => {
  const { children, className, ...restProps } = props;

  return (
    <div {...restProps} className={jcn(['BasicLayout', className])}>
      <main className="ui-container">{children}</main>
    </div>
  );
};
