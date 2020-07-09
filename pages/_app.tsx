import { AppProps } from 'next/app';
import { initializeFirebase } from '../models/firebase';
import './styles.scss';

initializeFirebase();

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
