import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Category, decomojiCategories } from '../models/Category';
import { Candidate, decomojiCandidates } from '../models/Candidate';
import styles from './index.module.scss';
import { randomizeArray } from '../util/randomizeArray';
import { DecisionFlicker } from '../components/DecisionFlicker';
import { CandidateImage } from '../components/CandidateImage';

interface PageProps {
  candidates: Candidate[];
  categories: Category[];
}

const HomePage: React.FC<PageProps> = ({ candidates, categories }) => {
  const [current, setCurrent] = useState(candidates[0]);
  const [restCandidates] = useState(candidates.slice(1));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const maxWidth = 800;
    const fn = () =>
      setWidth(
        Math.min(
          maxWidth,
          document.documentElement.clientWidth,
          document.documentElement.clientHeight * 0.7
        )
      );
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <div className="ui-container HomePage">
      <Head>
        <title>Home Page</title>
        <meta
          name="viewport"
          content="width=device-width; initial-scale=1.0; maximum-scale=1.0;"
        />
      </Head>
      <h1>Decomoji List</h1>
      <DecisionFlicker
        candidate={current}
        categories={categories}
        width={width}
      />
      <ul>
        {categories.map((category) => (
          <li key={category.name}>{category.name}</li>
        ))}
      </ul>
      <div className="currentCandidate">
        <CandidateImage candidate={current} />
      </div>
      <ul>
        {restCandidates.slice(0, 5).map((candidate) => (
          <li key={candidate.name}>
            <CandidateImage candidate={candidate} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;

export const getStaticProps: GetStaticProps<PageProps> = async () => ({
  props: {
    candidates: randomizeArray(decomojiCandidates),
    categories: decomojiCategories,
  },
});
