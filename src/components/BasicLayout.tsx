import Head from 'next/head';
import { ComponentPropsWithRef, useMemo } from 'react';
import { jcn } from '../util/joinClassNames';

export const BasicLayout: React.FC<
  ComponentPropsWithRef<'div'> & { title?: string }
> = ({ children, className, title, ...restProps }) => {
  const pageTitle = useMemo(() => {
    const appName = 'Quick Yes No';
    if (!title) {
      return appName;
    }

    return `${title} - ${appName}`;
  }, [title]);

  return (
    <div {...restProps} className={jcn(['BasicLayout', className])}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className="ui-container">{children}</main>
    </div>
  );
};
