# **App Name**: FreshStart Resume Builder

## Core Features:

- Split-Screen Resume Editor: A persistent two-panel layout for creating resumes, featuring a structured input editor on the left and a real-time resume preview on the right. Layout stacks vertically on mobile devices.
- Guided Section Input: Pre-built, labelled form components for 10 specific resume sections, including placeholder text, collapsibility, and drag-and-drop re-ordering.
- Real-time Resume Preview: Dynamically renders the resume as the user types, exactly matching the exported PDF. Highlights the currently edited section with a subtle indicator and offers zoom controls for multi-page views.
- AI Content Refinement Tool: Automatically rewrites vague language into clear, action-verb-led statements, checks grammar and spelling, and provides context-aware suggestions for each resume section, which users can accept or reject.
- AI Gap Detection & Follow-up Questions Tool: Proactively detects missing high-value information in sections (e.g., project outcomes) and generates specific, inline follow-up questions to prompt the user for more detail, using their responses to refine future suggestions.
- PDF Export & Download: Enables users to export their resume as a PDF at any point, with server-side generation to ensure consistent rendering that matches the live preview and a clear file naming convention.
- User Authentication & Session Persistence: Email and password-based registration and login system, allowing authenticated users to save and resume their resume progress across multiple sessions. Unauthenticated users can try the editor but cannot save.

## Style Guidelines:

- Light color scheme emphasizing clarity and professionalism. Primary action color: a confident and clean medium blue (#2966A3). Background color: a very light, almost white, cool grey-blue for spaciousness and readability (#F0F2F4). Accent color: a vibrant and energetic cyan-green for highlights and interactive elements (#3CE0DC).
- Body and headline font: 'Inter', a neutral and highly readable grotesque sans-serif, for a modern, objective, and professional look that supports a clean layout.
- Use minimalist and clear line icons throughout the interface, focusing on intuitive functionality and a professional aesthetic that complements the overall clean design.
- The primary layout consists of a responsive split-screen with a structured editor on the left and a live resume preview on the right for desktop, transitioning to a vertical stack for mobile to optimize readability and interaction.
- Implement subtle animations, such as smooth scrolling in the preview, soft highlights for active sections, and streaming responses from AI interactions to minimize perceived waiting times, enhancing user experience without being distracting.