export default function Footer() {
  return (
    <footer className="site-footer">
        <div className="container footer-inner">
            <span className="suggestions-form">
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdy7kOtlA5VxKbL21-KbkRjnZkyC_DHpzRWuUwoVYRzI89u3A/viewform">
                    Have a feature you would like to see?
                </a>
            </span>

            <span className="github-link" style={{ marginLeft: "1rem" }}>
                <a
                  href="https://github.com/Lily123xoxo/uma-gacha-planner"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub ↗
                </a>
            </span>
        </div>

        <div className="footer-text">
            <p className="last-updated">
              Website was last updated on: 5 December 2025. <br />
              Umaplanner is not affiliated with the developers of Uma Musume. All trademarks and copyrights of Cygames, Inc are their own.
            </p>
        </div>
    </footer>
  );
}