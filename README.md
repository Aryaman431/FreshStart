# 🚀 FreshStart: AI-Powered Resume Architect

**FreshStart** is a high-fidelity, professional resume builder specifically engineered for fresh graduates and final-year students. Built with **Next.js**, **Firebase**, and **Google Genkit (Gemini)**, it transforms basic details into elite career narratives that command recruiter attention.

![FreshStart Preview](https://picsum.photos/seed/freshstart-hero/1200/600)

## ✨ Key Features

- **🧠 AI-Powered Refinement**: Uses Google Gemini (via Genkit) to polish your bullet points into elite, technically authoritative language.
- **🔍 Real-time Gap Detection**: Automatically identifies missing high-value information (like CGPA, project outcomes, or certifications).
- **🖨️ High-Fidelity Print Engine**: A dedicated CSS isolation layer ensuring your resume prints as a perfect 1:1 scale professional PDF.
- **⚡ Quick Start & Sync**: Start instantly with anonymous auth. Your drafts are automatically saved to **Firebase Firestore** as you type.
- **🔐 Secure Auth**: Robust email/password authentication with mandatory verification to protect your career data.
- **🎨 Posh UI**: A modern "Spatial" interface built with Tailwind CSS and Radix UI primitives.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **AI Engine**: [Genkit](https://firebase.google.com/docs/genkit) + [Google Gemini 1.5 Flash](https://aistudio.google.com/)
- **Backend**: [Firebase Authentication](https://firebase.google.com/docs/auth) & [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Deployment**: [Vercel](https://vercel.com/) or [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## 🚀 Getting Started Locally

### 1. Download & Extract
Download the project ZIP from the Firebase Studio and extract it to your preferred directory.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your Google AI API key:
```env
GOOGLE_GENAI_API_KEY=your_api_key_here
```
> Get your free API key at [Google AI Studio](https://aistudio.google.com/).

### 4. Run Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to start building.

## 📤 Pushing to GitHub

After downloading and setting up locally:

1. **Initialize Git**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: FreshStart Resume Builder"
   ```
2. **Create a Remote**: Create a new repository on [GitHub](https://github.com/new).
3. **Connect & Push**:
   ```bash
   git remote add origin https://github.com/yourusername/freshstart-resume.git
   git branch -M main
   git push -u origin main
   ```

## 🌐 Deployment to Vercel

1. **Import Project**: In Vercel, click **Add New > Project** and select your GitHub repository.
2. **Configure Environment**: Add `GOOGLE_GENAI_API_KEY` in the project settings under "Environment Variables".
3. **Deploy**: Click **Deploy**. Vercel will handle the Next.js build and optimization automatically.

---

*Crafted with ❤️ for the next generation of top-tier talent.*
