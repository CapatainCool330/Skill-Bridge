# Skill-Bridge Design Documentation

## Design & Architecture
The Skill-Bridge application is structured around a modular architecture using **Next.js**. It separates concerns into clear domains to ensure maintainability and testability:
- **Core Logic & AI Integrations (`/lib`)**: Contains pure business logic for parsing skills, conducting gap analysis, and generating roadmaps/interviews. It utilizes a hybrid rule-based and AI-fallback approach (via the Gemini API) for resilient matching and generative capabilities.
- **User Interface (`/app`)**: Built with React and CSS Modules, managing routing and component rendering for clear user flows (e.g., Input -> Dashboard -> Roadmap -> Interview).
- **Data Layer (`/data`)**: Currently relies on structured JSON taxonomies to emulate a functioning backend without deployment overhead.

## Tech Stack
- **Frontend Framework**: Next.js (App Router), React
- **Styling**: Global CSS and CSS Modules
- **Testing**: Vitest for unit testing core logic (e.g., Gap Analysis engine)
- **AI Integration**: Google Gemini API (`@google/generative-ai`) for dynamic generative fallback features
- **Deployment**: Vercel

## Future Enhancements
- **Database Integration**: Transition from static JSON datasets to a robust database (e.g., PostgreSQL or MongoDB) to persist user profiles, progress, and generated roadmaps.
- **Authentication**: Implement full user authentication (OAuth) for secure user session management.
- **Live Data APIs**: Integrate with live employment APIs (like LinkedIn or specific job boards) for real-time market data matching instead of relying solely on a static taxonomy.
- **Expanded Taxonomy**: Broaden the internal structure to categorize highly niche career paths and a wider range of domain-specific skills.
