# FreshStart Resume Builder

This is a high-fidelity, AI-powered resume builder built with Next.js, Genkit, and Firebase.

## Local Setup

To run this project on your machine:

1. **Download the project**: Use the download button in the Firebase Studio UI to get the ZIP file.
2. **Extract**: Unzip the project into a directory of your choice.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Environment Variables**:
   Create a `.env.local` file in the root directory and add your Google AI API key from [Google AI Studio](https://aistudio.google.com/):
   ```
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```
5. **Run Development Server**:
   ```bash
   npm run dev
   ```
6. **Open in Browser**: Navigate to [http://localhost:3000](http://localhost:3000).

## Pushing to GitHub

After downloading and extracting the project locally, follow these steps to push your code to GitHub:

1. **Initialize Git**:
   ```bash
   git init
   ```
2. **Add Files**:
   ```bash
   git add .
   ```
3. **Commit**:
   ```bash
   git commit -m "Initial commit of FreshStart Resume Builder"
   ```
4. **Create GitHub Repo**: Go to [GitHub](https://github.com/new) and create a new repository. (Do not initialize with README).
5. **Add Remote**:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   ```
6. **Push**:
   ```bash
   git push -u origin main
   ```

## Vercel Deployment

1. **Connect to Vercel**: Import your GitHub repository into Vercel.
2. **Environment Variables**: Add `GOOGLE_GENAI_API_KEY` in the Vercel project settings.
3. **Build Settings**: Vercel will automatically detect the Next.js framework.
4. **Deploy**: Click deploy and your high-fidelity resume builder will be live!

## Features

- **AI-Powered Refinement**: Elite professional language suggestions via Google Gemini.
- **Real-time Gap Detection**: Identifies missing high-value info in your resume sections.
- **Firebase Auth**: Secure email/password login and one-click anonymous "Quick Start".
- **Firestore Persistence**: Resume drafts are saved automatically to the cloud as you type.
- **High-Fidelity Print Engine**: Professional 1:1 scale PDF output using custom CSS print isolation.
