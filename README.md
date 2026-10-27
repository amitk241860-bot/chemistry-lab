# 🧪 Virtual Chemistry Lab (VLab) — Unified Interactive Simulator

> **A World-Class Virtual Chemistry Laboratory** combining the visual realism and interactive tactile feedback of **NOBOOK** with the open-ended thermodynamic simulation, stockroom, and species molarity tracking of **ChemCollective VLab**, powered by **ChemMCP** and **Google Gemini 3.6 / 3.8 Flash AI**.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js)](https://nextjs.org/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-3.6_Flash_|_3.8_Flash-4285F4?logo=google)](https://ai.google.dev/)
[![ChemMCP Engine](https://img.shields.io/badge/ChemMCP-NLP--Group-059669)](https://github.com/OSU-NLP-Group/ChemMCP)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

## 🌟 Key Features

### 1. Unified Workbench Experience (NOBOOK + ChemCollective VLab)
* **Maximum Canvas Space**: Full-screen distraction-free interactive workbench with collapsible, non-blocking drawers for the **Stockroom**, **Solution Inspector**, and **Live Procedure Guide**.
* **Procedural SVG Glassware & Physics**: Meniscus physics, refraction gradients, dynamic liquid heights, glowing Bunsen burner flame zones, rising steam vapor, and bubbling effervescence.
* **Precise Drag-to-Transfer & Mixing**: Transfer exact mL volumes or press-and-hold to pour realistically with dynamic audio synthesis.
* **Real-Time Solution Information Panel**: Live tracking of solution volume (mL), pH (0.00 to 14.00), thermal temperature (°C), and individual ionic species molarities ($[H^+], [OH^-], [Na^+], [Cl^-], [Ag^+], [Ba^{2+}]$, etc.).

### 2. AI Custom Experiment Studio ("Make Your Own Experiment")
* **Intent Understanding**: Submit any experimental procedure, guide, or aim in plain natural language.
* **Powered by Google Gemini 3.6 Flash & 3.8 Flash**: Formulates balanced chemical equations, reaction thermodynamics ($\Delta H$, exothermic/endothermic), gas evolution, precipitate color, and initial workbench $(x, y)$ apparatus layouts.
* **Real-Time Step Milestone Validation**: Automatically checks student actions (mixing, heating, measuring) against sequential milestones and displays floating `"✓ Right Step!"` congratulatory toasts with procedural chimes.

### 3. AI Stockroom Reagent & Apparatus Generator
* **Inside-Stockroom Generator**: Need a reagent, glassware, or tool not currently in the stockroom? Type any chemical (e.g., `0.5M Potassium Permanganate`, `0.1M K2Cr2O7`) or equipment (`250mL Round Bottom Flask`, `Magnetic Stirrer Hotplate`).
* **Instant Synthesis**: AI calculates authentic liquid colors (HEX), pH, ionic dissociation species, and capacity, and adds the item immediately to the Stockroom with an `✨ AI` badge.
* **1-Click Auto-Detect for Active Experiments**: Automatically identifies any missing chemicals required by the current experiment and generates them all in one click!
* **Offline ChemMCP Fallback**: Fully functional even without an API key using the built-in ChemMCP chemical knowledge rules.

### 4. BYOK (Bring Your Own Key) Security & Settings
* **Safe Local Storage**: Enter your Google Gemini API Key in the Settings (`⚙️`) modal. Keys are saved strictly in your browser's `localStorage` and never sent to external servers or logged.
* **Supported Models**:
  - `gemini-3.6-flash` (Recommended: Fastest reaction analysis & live guidance)
  - `gemini-3.8-flash` (Ultra-Fast: State-of-the-art multimodal reasoning)
  - `gemini-3.1-pro-preview` (Advanced: Deep multi-step chemical synthesis planning)
* **Live Connection Test**: Click **"Test"** in Settings to ping Gemini with real-time latency feedback.

### 5. Progressive Web App (PWA) & Offline Ready
* Fully installable as a desktop or mobile application.
* Service worker caching with offline vector icons and synthesized Web Audio (zero external CDN audio or fonts required).

---

## 🔬 Practical Experiments Included

1. **Gravity Filtration**: Separation of Insoluble Sand and Prepared Aqueous NaCl (`exp-filtration`)
2. **Evaporation & Crystallization**: Recovery of Dissolved Solid Solute (`exp-evaporation`)
3. **Heat Water to Boiling**: Thermal Curve & Phase Transition (`exp-heat-water`)
4. **Acids, Bases & Indicators**: Neutralization Titration (`exp-acids-bases`)
5. **Single Displacement Reaction**: Iron & Copper(II) Sulfate (`exp-displacement`)
6. **Le Chatelier Equilibrium**: Iron(III) & Thiocyanate Complexation (`exp-equilibrium`)
7. **AI Custom Experiment Studio**: User-defined experiments with automated AI setup (`/experiments/create`)

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16.4.3 (App Router with Turbopack)
* **Language**: TypeScript
* **Styling**: Tailwind CSS & Modern Glassmorphism
* **Chemistry Intelligence**: ChemMCP (`https://github.com/OSU-NLP-Group/ChemMCP.git`) + `@google/genai`
* **Audio Synthesis**: HTML5 Web Audio API (procedural white-noise liquid pouring, clinks, and chimes)
* **Graphics**: 100% Procedural Vector SVGs

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/amitk241860-bot/chemistry-lab.git
cd chemistry-lab
npm install
```

### 2. Configure Environment (Optional)

Create a `.env.local` file or configure your API key directly in the app's Settings (`⚙️`) modal:

```bash
cp .env.example .env.local
```

Add your Google Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## 📄 License

MIT License. Created for students, teachers, and chemistry enthusiasts worldwide.
