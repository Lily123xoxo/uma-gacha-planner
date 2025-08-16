export default function NotFound() {
  return (
    <main className="container text-center error-page">
      <h1 className="error-code">404</h1>
      <p className="error-message">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <a href="/" className="btn btn-primary">Back to Home</a>
    </main>
  );
}