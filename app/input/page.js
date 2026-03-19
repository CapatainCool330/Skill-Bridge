"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

const sampleProfiles = [
  {
    id: "profile-1",
    name: "Alex — CS Graduate",
    resumeText: "SKILLS\nProgramming: Python, JavaScript, Java, SQL, HTML/CSS\nFrameworks: React (basics), Flask\nTools: Git, VS Code, Linux\n\nPROJECTS\n- Built a task management web app using Flask and SQLite\n- Created a weather dashboard using React and OpenWeather API\n- Implemented sorting algorithm visualizer in JavaScript",
  },
  {
    id: "profile-2",
    name: "Priya — Marketing → Tech",
    resumeText: "SKILLS\nTechnical: Python (self-taught), SQL, Google Analytics, Excel, HTML/CSS basics\nProfessional: Project Management, Communication, Team Leadership, Agile/Scrum\nLearning: Data Science fundamentals, Pandas, Machine Learning basics\n\nCERTIFICATIONS\nGoogle Data Analytics Professional Certificate",
  },
  {
    id: "profile-3",
    name: "Marcus — DevOps Junior",
    resumeText: "SKILLS\nOS: Linux (Ubuntu, CentOS), Windows Server\nScripting: Bash, Python\nTools: Git, Jenkins, Docker, Nginx\nNetworking: TCP/IP, DNS, DHCP, VPN, firewalls\n\nCERTIFICATIONS\nCompTIA A+, CompTIA Network+",
  },
  {
    id: "profile-4",
    name: "Sarah — Frontend → Full-Stack",
    resumeText: "SKILLS\nFrontend: JavaScript, TypeScript, React, Redux, HTML/CSS, Sass, Tailwind CSS\nTools: Git, Webpack, Vite\nOther: Responsive Design, Accessibility, Agile/Scrum\n\nEXPERIENCE\nFrontend Developer at WebAgency Co (2 years)\n- Built responsive SPAs using React, TypeScript, and Redux\n- Implemented design systems and reusable component libraries",
  },
];

export default function InputPage() {
  const [mode, setMode] = useState("resume"); // "resume" | "skills"
  const [resumeText, setResumeText] = useState("");
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [targetRole, setTargetRole] = useState("");
  const [targetRoles, setTargetRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [parsedSkills, setParsedSkills] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch available skills and roles
    fetch("/api/parse-skills")
      .then((r) => r.json())
      .then(setAllSkills)
      .catch(console.error);

    fetch("/api/gap-analysis")
      .then((r) => r.json())
      .then(setTargetRoles)
      .catch(console.error);
  }, []);

  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/parse-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText, type: "resume" }),
      });
      const data = await res.json();
      setParsedSkills(data);
      setSelectedSkills(data.extractedSkills.map((s) => s.id));
    } catch (e) {
      setError("Failed to parse resume. Please try again.");
    }
    setLoading(false);
  };

  const toggleSkill = (skillId) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
    // Clear parsed result when manually changing
    if (parsedSkills) setParsedSkills(null);
  };

  const loadSampleProfile = (profile) => {
    setResumeText(profile.resumeText);
    setMode("resume");
    setParsedSkills(null);
  };

  const handleAnalyze = async () => {
    if (selectedSkills.length === 0 || !targetRole) {
      setError("Please select at least one skill and a target role.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Get skill names for AI context
      const skillNames = selectedSkills.map((id) => {
        for (const cat of allSkills) {
          const skill = cat.skills.find((s) => s.id === id);
          if (skill) return skill.name;
        }
        return id;
      });

      const res = await fetch("/api/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: selectedSkills,
          skillNames,
          targetRole,
        }),
      });
      const data = await res.json();

      // Store results for dashboard
      sessionStorage.setItem(
        "gapAnalysis",
        JSON.stringify({
          ...data,
          userSkills: selectedSkills,
          userSkillNames: skillNames,
          targetRole,
          targetRoleName:
            targetRoles.find((r) => r.id === targetRole)?.title || targetRole,
        })
      );

      window.location.href = "/dashboard";
    } catch (e) {
      setError("Analysis failed. Please try again.");
      setLoading(false);
    }
  };

  const filteredSkills = allSkills
    .map((cat) => ({
      ...cat,
      skills: cat.skills.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((cat) => cat.skills.length > 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          Analyze Your <span className="gradient-text">Skills</span>
        </h1>
        <p className="subtitle">
          Paste your resume or select your skills, then choose your target role
        </p>
      </div>

      {/* Sample Profiles */}
      <div className={styles.sampleBar}>
        <span className={styles.sampleLabel}>Try a sample:</span>
        {sampleProfiles.map((p) => (
          <button
            key={p.id}
            className="btn btn-ghost btn-sm"
            onClick={() => loadSampleProfile(p)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Mode Toggle */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${mode === "resume" ? styles.active : ""}`}
          onClick={() => setMode("resume")}
        >
          📄 Paste Resume
        </button>
        <button
          className={`${styles.modeBtn} ${mode === "skills" ? styles.active : ""}`}
          onClick={() => setMode("skills")}
        >
          🏷️ Select Skills
        </button>
      </div>

      <div className={styles.inputLayout}>
        {/* Left: Input Area */}
        <div className={styles.inputArea}>
          {mode === "resume" ? (
            <div className={styles.resumeSection}>
              <textarea
                className="input-field"
                placeholder="Paste your resume text here...&#10;&#10;Example:&#10;SKILLS&#10;Python, JavaScript, React, Docker, AWS&#10;&#10;EXPERIENCE&#10;Frontend Developer at XYZ Corp&#10;- Built responsive web apps..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <button
                className="btn btn-secondary w-full"
                onClick={handleParseResume}
                disabled={loading || !resumeText.trim()}
                style={{ marginTop: 12 }}
              >
                {loading ? "Parsing..." : "Extract Skills from Resume"}
              </button>

              {parsedSkills && (
                <div className={styles.parseResult}>
                  <div className={styles.parseHeader}>
                    <span>
                      ✅ Found {parsedSkills.extractedSkills.length} skills
                    </span>
                    <span className={styles.confidence}>
                      Confidence: {parsedSkills.confidence}%
                    </span>
                  </div>
                  <div className={styles.chipGrid}>
                    {parsedSkills.extractedSkills.map((s) => (
                      <span key={s.id} className="skill-chip selected">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.skillsSection}>
              <input
                className="input-field"
                placeholder="🔍 Search skills... (e.g., Python, React, AWS)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className={styles.skillCategories}>
                {filteredSkills.map((cat) => (
                  <div key={cat.id} className={styles.category}>
                    <h4>
                      {cat.icon} {cat.name}
                    </h4>
                    <div className={styles.chipGrid}>
                      {cat.skills.map((s) => (
                        <span
                          key={s.id}
                          className={`skill-chip ${selectedSkills.includes(s.id) ? "selected" : ""}`}
                          onClick={() => toggleSkill(s.id)}
                        >
                          {selectedSkills.includes(s.id) ? "✓ " : ""}
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary + Action */}
        <div className={styles.sidebar}>
          <div className={`glass-card ${styles.summaryCard}`}>
            <h3>📋 Analysis Summary</h3>

            <div className={styles.summaryItem}>
              <label>Selected Skills</label>
              <span className={styles.summaryValue}>
                {selectedSkills.length}
              </span>
            </div>

            <div className={styles.summaryItem}>
              <label>Target Role</label>
              <select
                className="input-field"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="">Select a role...</option>
                {targetRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.jobCount} jobs)
                  </option>
                ))}
              </select>
            </div>

            {selectedSkills.length > 0 && (
              <div className={styles.selectedList}>
                <label>Your Skills:</label>
                <div className={styles.chipGrid}>
                  {selectedSkills.slice(0, 12).map((id) => {
                    let name = id;
                    for (const cat of allSkills) {
                      const s = cat.skills.find((s) => s.id === id);
                      if (s) { name = s.name; break; }
                    }
                    return (
                      <span
                        key={id}
                        className="skill-chip selected"
                        onClick={() => toggleSkill(id)}
                        title="Click to remove"
                      >
                        {name} ×
                      </span>
                    );
                  })}
                  {selectedSkills.length > 12 && (
                    <span className={styles.moreChip}>
                      +{selectedSkills.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}

            <button
              className="btn btn-primary w-full btn-lg"
              onClick={handleAnalyze}
              disabled={loading || selectedSkills.length === 0 || !targetRole}
              style={{ marginTop: 16 }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: 20, height: 20 }} /> Analyzing...
                </>
              ) : (
                "🔍 Analyze My Skills →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
