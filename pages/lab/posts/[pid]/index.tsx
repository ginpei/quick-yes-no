import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';

type LabPostAction = 'index' | 'edit';

/**
 * @example
 * <Link {...labPostPath({ id }, 'edit')}>
 *   <a>Edit</a>
 * </Link>
 */
export function labPostPath(
  post: { id: string },
  action: LabPostAction = 'index'
): { as: string; href: string } {
  const hrefBase = '/lab/posts/[pid]/';
  const asBase = `/lab/posts/${post.id}/`;

  if (action === 'index') {
    return { as: asBase, href: hrefBase };
  }

  return { as: `${asBase}${action}`, href: `${hrefBase}${action}` };
}

const PostDemoPage: React.FC = () => {
  const router = useRouter();
  const { pid } = router.query;

  if (typeof pid !== 'string') {
    return <div>...</div>;
  }

  return (
    <div className="ui-container PostDemoPage">
      <p>
        <Link {...labPostPath({ id: pid }, 'edit')}>
          <a>Edit</a>
        </Link>
      </p>
      <h1>Hi</h1>
      <p>ID: {pid}</p>
    </div>
  );
};

export default PostDemoPage;
