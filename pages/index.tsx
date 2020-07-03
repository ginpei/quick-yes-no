import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import { CandidateImage } from '../components/CandidateImage';
import { DecisionFlicker, OnDecide } from '../components/DecisionFlicker';
import { Candidate, decomojiCandidates } from '../models/Candidate';
import { Category, decomojiCategories } from '../models/Category';
import { randomizeArray } from '../util/randomizeArray';

interface PageProps {
  candidates: Candidate[];
  categories: Category[];
}

interface Decision {
  candidate: Candidate;
  category: Category;
}

const HomePage: React.FC<PageProps> = ({ candidates, categories }) => {
  const [current, setCurrent] = useState<Candidate | null>(candidates[0]);
  const [recent, setRecent] = useState<Decision | null>(null);
  const [restCandidates, setRestCandidates] = useState(candidates.slice(1));
  const [width, setWidth] = useState(0);

  const onDecide: OnDecide = useCallback(
    ({ candidate, category }) => {
      setRecent({ candidate, category });

      const next = restCandidates[0] || null;
      setCurrent(next);
      setRestCandidates(restCandidates.slice(1));
    },
    [restCandidates]
  );

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
      <p>
        {(current ? 1 : 0) + restCandidates.length} / {candidates.length}
        <br />
        {recent ? `${recent.candidate.name} → ${recent.category.name}` : '.'}
      </p>
      <DecisionFlicker
        candidate={current}
        categories={categories}
        onDecide={onDecide}
        width={width}
      />
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
