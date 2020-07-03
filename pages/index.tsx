import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { Category, decomojiCategories } from '../models/Category';
import { Candidate, decomojiCandidates } from '../models/Candidate';
import styles from './index.module.scss';
import { randomizeArray } from '../util/randomizeArray';

interface PageProps {
  candidates: Candidate[];
  categories: Category[];
}

const HomePage: React.FC<PageProps> = ({ candidates, categories }) => {
  const [current, setCurrent] = useState(candidates[0]);
  const [restCandidates] = useState(candidates.slice(1));

  return (
    <div className="ui-container HomePage">
      <Head>
        <title>Home Page</title>
      </Head>
      <h1>Decomoji List</h1>
      <ul>
        {categories.map((category) => (
          <li key={category.name}>{category.name}</li>
        ))}
      </ul>
      <div className="currentCandidate">
        <CandidateView candidate={current} />
      </div>
      <ul>
        {restCandidates.slice(0, 5).map((candidate) => (
          <li key={candidate.name}>
            <CandidateView candidate={candidate} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;

const CandidateView: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
  return (
    <div className="Candidate">
      <img
        alt={candidate.name}
        height="128"
        src={candidate.image}
        width="128"
      />
    </div>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async () => ({
  props: {
    candidates: randomizeArray(decomojiCandidates),
    categories: decomojiCategories,
  },
});
