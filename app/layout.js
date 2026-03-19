import "./globals.css";

export const metadata = {
  title: "Skill-Bridge | Career Navigator",
  description: "Bridge the gap between your skills and your dream role. AI-powered career navigation with personalized learning roadmaps.",
  keywords: "career navigator, skills gap analysis, learning roadmap, job skills, career development",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="grid-bg" />
        <nav className="navbar">
          <a href="/" className="navbar-brand">
            <div className="logo-icon">🌉</div>
            <span>Skill-Bridge</span>
          </a>
          <ul className="navbar-links">
            <li><a href="/">Home</a></li>
            <li><a href="/input">Analyze</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/roadmap">Roadmap</a></li>
            <li><a href="/interview">Interview</a></li>
          </ul>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
