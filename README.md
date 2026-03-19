# Skill-Bridge Career Navigator

**Candidate Name:** Ayush Gupta

**Scenario Chosen:** Skill-Bridge Career Navigator 

**Estimated Time Spent:** ~5 hours  

## Quick Start
* **Prerequisites:** Node.js 18.x or newer, npm/yarn.
* **Run Commands:**
  1. `npm install`
  2. Copy `env.example` to `.env.local` and add your Gemini API Key.
  3. `npm run dev`
  4. Open `http://localhost:3000`
* **Test Commands:**
  Run `npm test` (Uses standard test runner to evaluate the Gap Analysis engine).

## AI Disclosure
* **Did you use an AI assistant (Copilot, ChatGPT, etc.)?** Yes
* **How did you verify the suggestions?** I verified AI-generated UI code by running it locally, testing responsiveness, and verifying the logic outputs for the rule-based gap analysis algorithms against expected mathematical set theory. 
* **Give one example of a suggestion you rejected or changed:** The AI initially suggested comparing skills using exact string matching for the rule-based engine. I rejected this and implemented an ID-based system connected to a taxonomy with aliases to ensure fuzzy matching worked properly for variations like "React" vs "React.js".

## Tradeoffs & Prioritization
* **What did you cut to stay within the 4–6 hour limit?** 
  I used mock JSON datasets instead of setting up a PostgreSQL/MongoDB database to ensure the core logic and AI fallback behaviors were prioritized. I also cut full user authentication (OAuth) to focus strictly on the core user flow (Gap Analysis -> Roadmap).
* **What would you build next if you had more time?** 
  I would implement real user accounts with progress saving, and integrate a live API (like scraping LinkedIn or specific job boards) instead of using synthetic data files.
* **Known limitations:** 
  The synthetic job roles data is inherently limited to about 8 major career tracks. Searching for highly niche roles outside the `jobRoles.json` will trigger an "Unknown Role" fallback.

## Live Demo
[Live Demo : Skills Bridge](https://skill-bridge-six-opal.vercel.app/)

## Link to Video Presentation


