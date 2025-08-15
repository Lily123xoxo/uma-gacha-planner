import Head from 'next/head';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Using direct links for now, as requested */}
        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/errors.css" />
      </Head>

      <main className="container text-center error-page">
        <h1 className="error-code">404</h1>
        <p className="error-message">
          Oops! The page you’re looking for doesn’t exist.
        </p>
        <a href="/" className="btn btn-primary">Back to Home</a>
      </main>
    </>
  );
}
