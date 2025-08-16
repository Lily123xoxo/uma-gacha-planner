'use client';

export default function ServerError(props: { reset?: () => void }) {
  const { reset } = props;

  return (
    <main className="container text-center error-page">
      <h1 className="error-code">500</h1>
      <p className="error-message">
        Something went wrong on our end. Please try again later.
      </p>

      <a href="/" className="btn btn-primary">Back to Home</a>
      {reset && (
        <button className="btn btn-outline-secondary ms-2" onClick={() => reset()}>
          Try again
        </button>
      )}
    </main>
  );
}