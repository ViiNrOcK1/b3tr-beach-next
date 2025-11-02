import Head from 'next/head';
import Homepage from '@/components/Homepage';

export default function HomepageRoute() {
  return (
    <>
      <Head>
        <title>B3TR BEACH Homepage</title>
      </Head>
      <Homepage />
    </>
  );
}