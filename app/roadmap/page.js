"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [filter, setFilter] = useState("all"); // all, free, paid

  useEffect(() => {
    const stored = sessionStorage.getItem("roadmapData");
    if (!stored) {
      setLoading(false);
      return;
    }

    const data = JSON.parse(stored);
    fetchRoadmap(data);
  }, []);

  const fetchRoadmap = async (data) => {
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missingSkills: data.missingSkills,
          userContext: {
            targetRole: data.targetRoleName,
            currentSkills: data.userSkillNames,
          },
        }),
      });
      const result = await res.json();
      setRoadmap(result);
    } catch (e) {
      console.error("Roadmap fetch failed:", e);
    }
    setLoading(false);
  };

  const toggleComplete = (courseId) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) newSet.delete(courseId);
      else newSet.add(courseId);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Generating your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="page-container">
        <div className="loading-overlay">
          <div style={{ fontSize: "3rem" }}>🗺️</div>
          <h2>No Roadmap Data</h2>
          <p>Run a gap analysis first to generate your learning roadmap.</p>
          <a href="/input" className="btn btn-primary">Start Analysis →</a>
        </div>
      </div>
    );
  }

  const { phases, summary, personalizedTips, motivationalNote, aiEnhanced } = roadmap;

  const filteredPhases = phases.map((phase) => ({
    ...phase,
    items: phase.items.filter((item) => {
      if (filter === "free") return item.cost.toLowerCase().includes("free");
      if (filter === "paid") return !item.cost.toLowerCase().includes("free");
      return true;
    }),
  })).filter((p) => p.items.length > 0);

  const totalCompleted = completedItems.size;
  const totalItems = phases.reduce((s, p) => s + p.items.length, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Your Learning <span className="gradient-text">Roadmap</span></h1>
        <p className="subtitle">A step-by-step plan to bridge your skills gap</p>
      </div>

      {/* Motivational Note */}
      {motivationalNote && (
        <div className={`glass-card ${styles.motivationalCard}`}>
          <span>💪</span>
          <p>{motivationalNote}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className={styles.summaryRow}>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNum}>{summary.totalCourses}</div>
          <div className={styles.statLbl}>Resources</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNum}>{summary.totalHours}h</div>
          <div className={styles.statLbl}>Total Hours</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNum}>{summary.freeCourses}</div>
          <div className={styles.statLbl}>Free Resources</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNum}>~{summary.estimatedWeeks}w</div>
          <div className={styles.statLbl}>Est. Duration</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNum} style={{ color: "#10b981" }}>
            {totalCompleted}/{totalItems}
          </div>
          <div className={styles.statLbl}>Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter("all")}>All</button>
        <button className={`btn btn-sm ${filter === "free" ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter("free")}>Free Only</button>
        <button className={`btn btn-sm ${filter === "paid" ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter("paid")}>Paid Only</button>
      </div>

      {/* AI Tips */}
      {personalizedTips && personalizedTips.length > 0 && (
        <div className={`glass-card ${styles.tipsCard}`}>
          <h3>🎯 Personalized Tips</h3>
          <ul>
            {personalizedTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline */}
      <div className={styles.timeline}>
        {filteredPhases.map((phase, pi) => (
          <div key={phase.id} className={styles.phase}>
            <div className={styles.phaseHeader}>
              <div className={styles.phaseDot}>{phase.icon}</div>
              <div>
                <h3>{phase.name}</h3>
                <p>{phase.description}</p>
                <span className={styles.phaseTime}>{phase.timeframe}</span>
              </div>
            </div>
            <div className={styles.phaseItems}>
              {phase.items.map((item) => (
                <div
                  key={item.courseId}
                  className={`glass-card ${styles.courseCard} ${completedItems.has(item.courseId) ? styles.completed : ""}`}
                >
                  <div className={styles.courseCheck} onClick={() => toggleComplete(item.courseId)}>
                    {completedItems.has(item.courseId) ? "✅" : "⬜"}
                  </div>
                  <div className={styles.courseContent}>
                    <div className={styles.courseTop}>
                      <h4>{item.title}</h4>
                      <div className={styles.courseBadges}>
                        <span className={`badge ${item.cost.toLowerCase().includes("free") ? "badge-free" : "badge-paid"}`}>
                          {item.cost}
                        </span>
                        <span className={`badge badge-${item.priority || "medium"}`}>
                          {item.priority || "medium"}
                        </span>
                      </div>
                    </div>
                    <div className={styles.courseMeta}>
                      <span>📚 {item.provider}</span>
                      <span>⏱️ {item.duration}</span>
                      <span>🎯 {item.targetSkill}</span>
                      <span className={`badge badge-${item.difficulty === "beginner" ? "low" : item.difficulty === "advanced" ? "high" : "medium"}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                        {item.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <a href="/dashboard" className="btn btn-ghost">← Back to Dashboard</a>
      </div>
    </div>
  );
}
