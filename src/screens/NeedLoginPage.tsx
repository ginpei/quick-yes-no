import Link from 'next/link';
import { BasicLayout } from '../components/BasicLayout';

const NeedLoginPage: React.FC = () => {
  return (
    <BasicLayout>
      <h1>Need to login</h1>
      <p>
        <Link href="/login">
          <a>Log in</a>
        </Link>
      </p>
    </BasicLayout>
  );
};

export default NeedLoginPage;
