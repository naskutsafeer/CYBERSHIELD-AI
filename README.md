# CyberShield AI 🛡️
LINK TO WEBAPP:https://cybershield-ai-113521169153.us-west1.run.app/
## Problem Statement
In an era of rapidly evolving digital threats, both individuals and organizations struggle to keep pace with sophisticated cyberattacks. Traditional security tools often generate overwhelming amounts of raw technical data that require expert knowledge to interpret. This "information gap" leads to delayed responses, successful phishing attempts, and undetected vulnerabilities in source code or system logs, leaving users exposed to significant risks.

## Project Description
CyberShield AI is an advanced cybersecurity intelligence platform designed to bridge the gap between complex security data and actionable human intelligence. Our solution centralizes multiple specialized detection modules into a single, intuitive dashboard. 

**How it works:**
The platform ingests suspicious data—be it an email, a URL, a system log, or a snippet of code—and processes it through our AI-driven analysis engine. It doesn't just flag threats; it explains *why* something is a risk, provides a confidence score, and suggests immediate remediation steps. This makes high-level security analysis accessible to everyone, from home users to IT administrators.

**What makes it useful:**
- **Centralized Intelligence:** One platform for phishing, URL, log, code, and deepfake analysis.
- **Human-Readable Insights:** AI translates technical jargon into clear, actionable advice.
- **Real-time Monitoring:** Instant alerts and a live audit trail for administrators.
- **Proactive Defense:** Identifies vulnerabilities before they can be exploited.

## Google AI Usage

### Tools / Models Used
- **Google Gemini API:** Specifically the `gemini-3-flash-preview` model for high-speed, high-reasoning security analysis.
- **Google Generative AI SDK:** `@google/genai` for seamless integration between our React frontend and the Gemini intelligence engine.

### How Google AI Was Used
AI is the "brain" of CyberShield AI. It is integrated into every core module:
- **Phishing Detection:** Gemini analyzes the intent, tone, and structural red flags in emails that traditional filters might miss.
- **URL Reputation:** The AI predicts the risk of unknown domains by analyzing their structure and context.
- **Log Anomaly Detection:** Gemini identifies patterns of unauthorized access or brute-force attempts within thousands of lines of raw system logs.
- **Vulnerability Scanning:** The AI performs deep static analysis on source code to find complex logic flaws and security holes like SQLi or XSS.
- **Deepfake Verification:** AI models assist in identifying inconsistencies in digital media to verify authenticity.

## Proof of Google AI Usage
*Screenshots of the AI integration and API calls can be found in the `/proof` folder.*

### AI Proof
- [Link to AI Integration Code](src/lib/gemini.ts) (Example)

## Screenshots

### Screenshot1
![Dashboard Overview](https://drive.google.com/file/d/1DFd502lPmSoZB9CeekELbPm62K3u5SLz/view?usp=drivesdk)
*The main dashboard showing real-time security stats and recent activity.*



## Demo Video
Watch our 3-minute walkthrough to see CyberShield AI in action:
[Watch Demo](https://drive.google.com/file/d/1ZQ09L1XLXMvUrtrfYHHgg1qM4IxKdGIs/view?usp=drivesdk)

## Installation Steps

### 1. Clone the repository
```bash
git clone <your-repo-link>
```

### 2. Go to project folder
```bash
cd cybershield-ai
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run the project
```bash
npm run dev
```
