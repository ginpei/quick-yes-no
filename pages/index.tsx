import Head from 'next/head';
import { GetStaticProps } from 'next';

const HomePage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="ui-container HomePage">
      <Head>
        <title>Home Page</title>
      </Head>
      <h1>{message}</h1>
    </div>
  );
};

export default HomePage;

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    message: 'Hello World!',
  },
});
