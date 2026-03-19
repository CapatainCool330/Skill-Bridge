"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function InterviewPage() {
  const [questions, setQuestions] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [targetRoleName, setTargetRoleName] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("interviewData");
    if (!stored) {
      setLoading(false);
      return;
    }
    const data = JSON.parse(stored);
    setTargetRoleName(data.targetRoleName || "");
    fetchQuestions(data);
  }, []);

  const fetchQuestions = async (data) => {
    try {
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: data.skills,
          targetRole: data.targetRoleName || data.targetRole,
          count: 10,
        }),
      });
      const result = await res.json();
      setQuestions(result.questions || []);
      setSource(result.source || "rule-based");
    } catch (e) {
      console.error("Failed to fetch questions:", e);
    }
    setLoading(false);
  };

  const toggleExpand = (idx) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) newSet.delete(idx);
      else newSet.add(idx);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Generating interview questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-overlay">
          <div style={{ fontSize: "3rem" }}>🎤</div>
          <h2>No Interview Data</h2>
          <p>Run a gap analysis first to get personalized interview questions.</p>
          <a href="/input" className="btn btn-primary">Start Analysis →</a>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    easy: "#10b981",
    medium: "#f59e0b",
    hard: "#ef4444",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mock <span className="gradient-text">Interview Prep</span></h1>
        <p className="subtitle">
          Practice questions for <strong>{targetRoleName}</strong>
        </p>
      </div>

      <div className={styles.sourceInfo}>
        <span className={`badge ${source === "ai" ? "badge-ai" : "badge-rule"}`}>
          {source === "ai" ? "🤖 AI-Generated" : "📋 Template-Based"}
        </span>
        <span>{questions.length} questions generated</span>
      </div>

      <div className={styles.questionList}>
        {questions.map((q, i) => (
          <div key={i} className={`glass-card ${styles.questionCard}`} onClick={() => toggleExpand(i)}>
            <div className={styles.questionHeader}>
              <div className={styles.questionNum}>Q{i + 1}</div>
              <div className={styles.questionBody}>
                <h4>{q.question}</h4>
                <div className={styles.questionMeta}>
                  <span className={styles.metaTag} style={{ color: difficultyColors[q.difficulty] || "#f59e0b" }}>
                    {q.difficulty}
                  </span>
                  <span className={styles.metaTag}>📌 {q.topic || q.skill}</span>
                  {q.skill && <span className={styles.metaTag}>🏷️ {q.skill}</span>}
                </div>
              </div>
              <div className={styles.expandIcon}>
                {expandedIds.has(i) ? "▲" : "▼"}
              </div>
            </div>
            {expandedIds.has(i) && q.hint && (
              <div className={styles.hintBox}>
                <strong>💡 Hint:</strong> {q.hint}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 32, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/dashboard" className="btn btn-ghost">← Back to Dashboard</a>
        <a href="/roadmap" className="btn btn-secondary">🗺️ View Roadmap</a>
      </div>
    </div>
  );
}
