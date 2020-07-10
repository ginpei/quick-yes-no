import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { labPostPath } from '.';

const PostDemoPage: React.FC = () => {
  const router = useRouter();
  const { pid } = router.query;

  if (typeof pid !== 'string') {
    return <div>...</div>;
  }

  return (
    <div className="ui-container PostDemoPage">
      <p>
        <Link {...labPostPath({ id: pid })}>
          <a>Back</a>
        </Link>
      </p>
      <h1>Edit</h1>
      <p>ID: {pid}</p>
    </div>
  );
};

export default PostDemoPage;
