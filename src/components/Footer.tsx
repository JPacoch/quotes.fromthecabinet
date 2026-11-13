export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="col-wide">
          <div className="footer-inner">
            <p className="footer-copy">© 2026 Jakub Pacocha · fromthecabinet.com</p>

            <nav className="footer-nav" aria-label="Footer">
              <a href="https://fromthecabinet.com/" className="footer-link">
                Cabinet ↗
              </a>
              <a href="https://fromthecabinet.com/writing/" className="footer-link">
                Writing ↗
              </a>
              <a href="https://fromthecabinet.com/about/" className="footer-link">
                About ↗
              </a>
              <a href="https://fromthecabinet.com/rss.xml" className="footer-link">
                RSS ↗
              </a>
              <a href="https://fromthecabinet.com/privacy-policy/" className="footer-link">
                Privacy ↗
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
