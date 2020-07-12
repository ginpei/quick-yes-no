import Link from 'next/link';
import { BasicLayout } from '../src/components/BasicLayout';

const HomePage: React.FC = () => {
  return (
    <BasicLayout>
      <h1>Quick Yes No</h1>
      <p>
        <Link href="/questions">
          <a>Questions</a>
        </Link>
      </p>
    </BasicLayout>
  );
};

export default HomePage;
