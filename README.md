# MindMirror

![MindMirror Banner](public/window.jpg)

> **Visualize your mind's patterns, strengths, and blind spots.**

**MindMirror** is an advanced "Digital Nutrition" and self-discovery platform. It combines verified psychological frameworks (Big Five/OCEAN, Jungian Archetypes) with behavioral data analysis from your media consumption, mood logs, and cognitive performance.

Unlike static personality tests, MindMirror creates a **living profile** that evolves as you do.

---

## 🚀 Key Features

### 🧠 Deep Psychological Profiling
- **Living OCEAN Model**: Your personality scores (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) update dynamically using Bayesian inference as you log books, movies, and moods.
- **Neural Glyph Identity**: A procedurally generated avatar that visually represents your psyche—shape determined by archetype, complexity by openness, and glow by your daily streak.
- **Gemini AI Engine**: Our "Digital Psychologist" uses Google Gemini 2.5 Flash to generate deep narrative insights, analyze your "Taste DNA", and suggest personalized growth paths.

### 🎮 Brain Gym (Cognitive Training)
- **Dual N-Back**: Train your Working Memory and Fluid Intelligence. High performance correlates with increased Conscientiousness.
- **Stroop Test**: Train your Inhibition Control and Focus. Low error rates correlate with emotional stability (low Neuroticism).
- **Neuroplasticity Index**: A real-time gauge showing how flexible or rigid your current personality traits are.

### 📊 Interactive Visualizations
- **3D Mind Map**: A stunning, interactive force-directed graph (`react-force-graph-3d`) that visualizes the neural connections between your traits, media consumption, and psychological intents.
- **Digital Phenotyping**: Background analysis of your interaction patterns (scroll speed, click hesitation) to infer subconscious personality traits.
- **Mood Radar**: Visualize your emotional history and get AI-generated journaling prompts tailored to your current state.

### 🔌 Integrations & Data
- **YouTube Import**: Connect your Google account to analyze your subscriptions and automatically populate your interest graph.
- **Gamification**: Earn badges like "Shifting Perspective" or "Deep Diver" as you explore your own mind.
- **Privacy First**: You own your data. Full export and delete capabilities included.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Ant Design (V5)
- **Visualization**: `react-force-graph-3d`, Three.js, Ant Design Charts
- **Backend/Database**: Firebase (Authentication, Firestore)
- **AI**: Google Gemini API (`@google/genai` & `@ai-sdk/google`)
- **Animation**: Framer Motion, Vanta.js

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Yarn or npm
- A Firebase Project (with Auth and Firestore enabled)
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindmirror.git
   cd mindmirror
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Google Gemini AI
   GOOGLE_GEMINI_API_KEY=your_gemini_key
   ```

4. **Run Development Server**
   ```bash
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/             # Server-side API routes (AI analysis)
│   ├── dashboard/       # Main user dashboard
│   ├── brain-gym/       # Cognitive training games
│   ├── quiz/            # Personality assessment
│   └── ...
├── components/          # React components
│   ├── MindMap.tsx      # 3D Graph visualization
│   ├── DataAvatar.tsx   # Procedural generative avatar
│   └── ...
├── lib/                 # Core logic libraries
│   ├── psychologyUtils.ts # Bayesian inference engine
│   ├── firestoreUtils.ts  # Database operations
│   └── gamificationUtils.ts # Badges & streaks
└── ...
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
MIT License - Copyright (c) 2025 MindMirror
