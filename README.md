# BrainMirror

![BrainMirror Banner](public/og-image.png)

> **Visualize your mind's patterns, strengths, and blind spots.**

BrainMirror is an advanced self-discovery platform that combines psychological frameworks (Big Five, Jungian Archetypes) with behavioral data analysis from your media consumption and mood logs.

---

## 🚀 Features

### 🧠 Deep Psychological Profiling
- **Living Profile**: Your personality scores (OCEAN) evolve dynamically as you add media and track moods.
- **Multi-Model Analysis**: We synthesize insights using Big Five, MBTI-style cognition, and Core Motivations.
- **Gemini AI Engine**: Our "Oracle" uses Google Gemini to generate deep, narrative insights about your "Taste DNA" and growth paths.

### 📊 Interactive Visualizations
- **3D Mind Map**: A force-directed graph visualizing the connections between your traits, media, and psychological intents.
- **Mood History**: Track your emotional well-being over time with visualizations.
- **Radar Charts**: Visualize your core motivations and cognitive style.

### 🎮 Gamification & Goals
- **Goal Tracker**: Set and track personal growth objectives (e.g., "Reduce Anxiety").
- **Badges**: Earn achievements for self-discovery milestones (e.g., "Deep Diver", "Consistent Tracker").

### 🔒 Privacy & Ethics First
- **Data Ownership**: Export or delete your data at any time.
- **Transparency**: Clear explanations of how AI and algorithms work.
- **Secure**: Built on Firebase with robust security rules.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **UI Framework**: Ant Design, Tailwind CSS
- **Visualization**: `react-force-graph-3d`, Ant Design Charts, Three.js
- **Backend/Database**: Firebase (Auth, Firestore)
- **AI**: Google Gemini API (`@google/genai`)

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Yarn
- A Firebase Project
- A Google Gemini API Key

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/brainmirror.git
   cd brainmirror
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   GOOGLE_GEMINI_API_KEY=your_gemini_key
   ```

4. **Run Development Server**
   ```bash
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment

### Vercel (Recommended)
1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the Environment Variables from step 3 to your Vercel project settings.
4. Deploy!

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init` (Choose Hosting, select your project).
4. Build and Deploy:
   ```bash
   yarn build
   firebase deploy
   ```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
MIT License - Copyright (c) 2025 BrainMirror
