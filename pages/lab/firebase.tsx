import { firestore } from 'firebase';
import { GetServerSideProps } from 'next';

type PageProps = {
  docs: any[];
};

const FirebaseDemoPage: React.FC<PageProps> = ({ docs }) => {
  return (
    <div className="ui-container FirebaseDemoPage">
      <h1>Firebase</h1>
      <p>{docs.length} docs found.</p>
      {docs.map((doc, index) => (
        <p key={index}>{JSON.stringify(doc)}</p>
      ))}
    </div>
  );
};

export default FirebaseDemoPage;

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const sn = await firestore().collection('free-notes').get();
  const docs = sn.docs.map((ssDoc) => ssDoc.data());
  return {
    props: { docs },
  };
};
