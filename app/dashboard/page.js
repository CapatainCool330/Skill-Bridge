"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("gapAnalysis");
    if (stored) {
      setAnalysis(JSON.parse(stored));
    }
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!analysis) {
    return (
      <div className="page-container">
        <div className="loading-overlay">
          <div style={{ fontSize: "3rem" }}>📊</div>
          <h2>No Analysis Found</h2>
          <p>Start by analyzing your skills first.</p>
          <a href="/input" className="btn btn-primary">Go to Skills Input →</a>
        </div>
      </div>
    );
  }

  const {
    source,
    confidence,
    overallFitScore,
    matchedSkills = [],
    missingCritical = [],
    missingNiceToHave = [],
    transferableSkills = [],
    recommendations = [],
    jobsAnalyzed,
    summary,
    fallbackReason,
    targetRoleName,
  } = analysis;

  const handleViewRoadmap = () => {
    const missing = [...missingCritical, ...missingNiceToHave];
    sessionStorage.setItem("roadmapData", JSON.stringify({
      missingSkills: missing,
      userSkills: analysis.userSkills,
      userSkillNames: analysis.userSkillNames,
      targetRole: analysis.targetRole,
      targetRoleName,
    }));
    window.location.href = "/roadmap";
  };

  const handleMockInterview = () => {
    sessionStorage.setItem("interviewData", JSON.stringify({
      skills: analysis.userSkills,
      targetRole: analysis.targetRole,
      targetRoleName,
    }));
    window.location.href = "/interview";
  };

  const scoreColor = overallFitScore >= 70 ? "#10b981" : overallFitScore >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gap Analysis <span className="gradient-text">Dashboard</span></h1>
        <p className="subtitle">Your skills vs. <strong>{targetRoleName}</strong> requirements</p>
      </div>

      {/* Source Badge */}
      <div className={styles.sourceBadge}>
        <span className={`badge ${source === "ai" ? "badge-ai" : "badge-rule"}`}>
          {source === "ai" ? "🤖 AI-Powered Analysis" : "📐 Rule-Based Analysis"}
        </span>
        <span className={styles.confidenceText}>
          Confidence: {confidence}% • Analyzed {jobsAnalyzed} job descriptions
        </span>
        {fallbackReason && (
          <span className={styles.fallbackNote}>
            ⚠️ AI unavailable: {fallbackReason}
          </span>
        )}
      </div>

      {/* Summary if AI */}
      {summary && (
        <div className={`glass-card ${styles.summaryBox}`}>
          <p>{summary}</p>
        </div>
      )}

      {/* Score + Stats Row */}
      <div className={styles.statsRow}>
        {/* Progress Ring */}
        <div className={`glass-card ${styles.scoreCard}`}>
          <div className={styles.progressRing}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="78" stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
              <circle
                cx="90" cy="90" r="78"
                stroke={scoreColor}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(overallFitScore / 100) * 490} 490`}
                transform="rotate(-90 90 90)"
                style={{ transition: "stroke-dasharray 1.5s ease", filter: `drop-shadow(0 0 8px ${scoreColor}40)` }}
              />
            </svg>
            <div className={styles.scoreInner}>
              <span className={styles.scoreNum} style={{ color: scoreColor }}>{overallFitScore}%</span>
              <span className={styles.scoreLabel}>Fit Score</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <div className={`glass-card ${styles.miniStat}`}>
            <div className={styles.miniStatIcon}>✅</div>
            <div>
              <div className={styles.miniStatNum}>{matchedSkills.length}</div>
              <div className={styles.miniStatLabel}>Matched Skills</div>
            </div>
          </div>
          <div className={`glass-card ${styles.miniStat}`}>
            <div className={styles.miniStatIcon}>❌</div>
            <div>
              <div className={styles.miniStatNum}>{missingCritical.length}</div>
              <div className={styles.miniStatLabel}>Missing Critical</div>
            </div>
          </div>
          <div className={`glass-card ${styles.miniStat}`}>
            <div className={styles.miniStatIcon}>💡</div>
            <div>
              <div className={styles.miniStatNum}>{missingNiceToHave.length}</div>
              <div className={styles.miniStatLabel}>Nice-to-Have</div>
            </div>
          </div>
          <div className={`glass-card ${styles.miniStat}`}>
            <div className={styles.miniStatIcon}>🔄</div>
            <div>
              <div className={styles.miniStatNum}>{transferableSkills.length}</div>
              <div className={styles.miniStatLabel}>Transferable</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Breakdown */}
      <div className={styles.breakdownGrid}>
        {/* Matched */}
        <div className={`glass-card ${styles.breakdownCard}`}>
          <h3>✅ Matched Skills</h3>
          <p className={styles.breakdownDesc}>Skills you have that match the role</p>
          <div className={styles.chipGrid}>
            {matchedSkills.map((s, i) => (
              <span key={i} className="skill-chip matched">
                {s.id || s.name || s}
                {s.frequency && <small> ({s.frequency}%)</small>}
              </span>
            ))}
            {matchedSkills.length === 0 && <span className={styles.empty}>None found</span>}
          </div>
        </div>

        {/* Missing Critical */}
        <div className={`glass-card ${styles.breakdownCard}`}>
          <h3>❌ Missing Critical Skills</h3>
          <p className={styles.breakdownDesc}>High-demand skills you need to learn</p>
          <div className={styles.chipGrid}>
            {missingCritical.map((s, i) => (
              <span key={i} className={`skill-chip missing`}>
                {s.id || s.name || s}
                {s.priority && <small className={`badge badge-${s.priority}`} style={{ marginLeft: 4, padding: "2px 6px", fontSize: "0.65rem" }}>{s.priority}</small>}
              </span>
            ))}
            {missingCritical.length === 0 && <span className={styles.empty}>None — great job!</span>}
          </div>
        </div>

        {/* Nice to Have */}
        <div className={`glass-card ${styles.breakdownCard}`}>
          <h3>💡 Nice-to-Have</h3>
          <p className={styles.breakdownDesc}>Skills that would give you an edge</p>
          <div className={styles.chipGrid}>
            {missingNiceToHave.map((s, i) => (
              <span key={i} className="skill-chip" style={{ borderColor: "rgba(245,158,11,0.3)", color: "#fbbf24" }}>
                {s.id || s.name || s}
              </span>
            ))}
            {missingNiceToHave.length === 0 && <span className={styles.empty}>None identified</span>}
          </div>
        </div>

        {/* Transferable */}
        <div className={`glass-card ${styles.breakdownCard}`}>
          <h3>🔄 Transferable Skills</h3>
          <p className={styles.breakdownDesc}>Your skills that transfer to this role</p>
          <div className={styles.chipGrid}>
            {transferableSkills.map((s, i) => (
              <span key={i} className="skill-chip transferable">
                {s.id || s.name || s}
              </span>
            ))}
            {transferableSkills.length === 0 && <span className={styles.empty}>None identified</span>}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className={`glass-card ${styles.recommendationsCard}`}>
          <h3>💡 Recommendations</h3>
          <ul className={styles.recList}>
            {recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button className="btn btn-primary btn-lg" onClick={handleViewRoadmap}>
          🗺️ View Learning Roadmap →
        </button>
        <button className="btn btn-secondary btn-lg" onClick={handleMockInterview}>
          🎤 Mock Interview Prep
        </button>
        <a href="/input" className="btn btn-ghost">
          ← Back to Input
        </a>
      </div>
    </div>
  );
}
