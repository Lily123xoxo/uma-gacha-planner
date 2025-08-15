import Head from 'next/head';

export default function ServerError() {
  return (
    <>
      <Head>
        <title>Server Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Keep using your existing static CSS from /public */}
        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/errors.css" />
      </Head>

      <body className="error-page">
        <main className="container text-center">
          <h1 className="error-code">500</h1>
          <p className="error-message">
            Something went wrong on our end. Please try again later.
          </p>
          <a href="/" className="btn btn-primary">Back to Home</a>
        </main>
      </body>
    </>
  );
}
