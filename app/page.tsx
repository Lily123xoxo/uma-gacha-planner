import Head from 'next/head';
import Header from '../components/Header';
import InputForm from '../components/InputForm';
import Timeline from '../components/Timeline';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>umaplanner</title>
        <meta
          name="description"
          content="Optimise your rolling plans for the gacha game Uma Musume with an interactive timeline and calculator. Track character banners, support banners, your carat gains, and optimize your pulls with ease."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Stylesheets from /public */}
        <link rel="stylesheet" href="/css/css-reset.css" />
        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/styles.css" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
      </Head>

      {/* Main page layout */}
      <header>
        <Header />
      </header>

      <div id="main-body">
        <main>
          <InputForm />
          <Timeline />
        </main>
      </div>

      {/* Scripts from /public */}
      <script src="/js/index.js" defer></script>
      <script src="/bootstrap/js/bootstrap.bundle.min.js" defer></script>
    </>
  );
}
