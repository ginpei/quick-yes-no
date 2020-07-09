import { AppProps } from 'next/app';
import { initializeFirebase } from '../src/models/firebase';
import './styles.scss';

initializeFirebase();

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return <Component {...pageProps} />;
}
