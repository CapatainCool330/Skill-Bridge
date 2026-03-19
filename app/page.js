"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={styles.landing}>
      {/* Animated background orbs */}
      <div className={styles.orbContainer}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.heroContent} ${mounted ? styles.visible : ""}`}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            AI-Powered Career Navigation
          </div>
          <h1 className={styles.heroTitle}>
            Bridge the Gap Between
            <br />
            <span className="gradient-text">Your Skills</span> &{" "}
            <span className="gradient-text">Dream Role</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Input your resume or skills, get an AI-powered gap analysis against
            real job requirements, and receive a personalized learning roadmap to
            reach your career goals.
          </p>
          <div className={styles.heroCtas}>
            <a href="/input" className="btn btn-primary btn-lg">
              Start Your Analysis →
            </a>
            <a href="#features" className="btn btn-secondary btn-lg">
              Learn More
            </a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>50+</span>
              <span className={styles.statLabel}>Job Descriptions</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>100+</span>
              <span className={styles.statLabel}>Skills Tracked</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>75+</span>
              <span className={styles.statLabel}>Learning Resources</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>
          Your <span className="gradient-text">Complete Career Toolkit</span>
        </h2>
        <p className={styles.sectionSubtitle}>
          Everything you need to navigate from where you are to where you want to
          be
        </p>
        <div className={styles.featureGrid}>
          <div className={`glass-card ${styles.featureCard}`}>
            <div className={styles.featureIcon}>🔍</div>
            <h3>Smart Gap Analysis</h3>
            <p>
              AI compares your skills against 50+ job descriptions to identify
              exactly what&apos;s missing for your target role.
            </p>
            <div className={styles.featureTag}>
              <span className="badge badge-ai">AI-Powered</span>
              <span className="badge badge-rule">+ Rule-Based Fallback</span>
            </div>
          </div>

          <div className={`glass-card ${styles.featureCard}`}>
            <div className={styles.featureIcon}>🗺️</div>
            <h3>Dynamic Learning Roadmap</h3>
            <p>
              Get a personalized, phased learning plan with free and paid courses
              organized by priority and time to complete.
            </p>
            <div className={styles.featureTag}>
              <span className="badge badge-free">Free Courses</span>
              <span className="badge badge-paid">+ Certifications</span>
            </div>
          </div>

          <div className={`glass-card ${styles.featureCard}`}>
            <div className={styles.featureIcon}>🎤</div>
            <h3>Mock Interview Prep</h3>
            <p>
              Practice with technical interview questions generated specifically for
              your skill profile and target role.
            </p>
            <div className={styles.featureTag}>
              <span className="badge badge-ai">Personalized</span>
            </div>
          </div>

          <div className={`glass-card ${styles.featureCard}`}>
            <div className={styles.featureIcon}>🛡️</div>
            <h3>Responsible AI</h3>
            <p>
              Built with transparent AI sourcing, confidence scores, and automatic
              fallback to rule-based analysis when needed.
            </p>
            <div className={styles.featureTag}>
              <span className="badge badge-rule">Transparent</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>
          How It <span className="gradient-text">Works</span>
        </h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>01</div>
            <h4>Input Your Skills</h4>
            <p>Paste your resume or select skills from our taxonomy of 100+ technical competencies.</p>
          </div>
          <div className={styles.stepConnector} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>02</div>
            <h4>Choose Your Dream Role</h4>
            <p>Select from 8+ career tracks including Cloud Engineer, Data Scientist, and more.</p>
          </div>
          <div className={styles.stepConnector} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>03</div>
            <h4>Get Your Roadmap</h4>
            <p>Receive an AI-powered gap analysis and a step-by-step learning plan to reach your goal.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={`glass-card ${styles.ctaCard}`}>
          <h2>Ready to Bridge the Gap?</h2>
          <p>Start your personalized career analysis in under 2 minutes.</p>
          <a href="/input" className="btn btn-primary btn-lg">
            Get Started Free →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          Built for the <strong>Palo Alto Networks</strong> SWE Case Study •
          Skill-Bridge Career Navigator
        </p>
      </footer>
    </div>
  );
}
