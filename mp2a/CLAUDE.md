# Mini Project 2: Usability Session Analyzer

## What This Tool Does
A browser-based usability testing tool. A UX researcher defines a golden path (the expected sequence of steps a user should take), then runs a live session where a participant clicks through a prototype or embedded URL. Every click is automatically logged and compared against the golden path. At the end, the tool generates a minimalist structured report.

## Who Uses It
- UX researchers set up the session and read the report
- Usability test participants interact with the embedded prototype during the session
- UX designers and developers consume the report output

## Core Features to Build

### 1. Golden Path Setup
- Researcher inputs an ordered list of expected steps (e.g., "Click Sign Up → Click Email Field → Click Submit")
- Each step has a label and an expected target element or URL state
- Steps can be added, reordered, and removed before the session starts

### 2. Live Session Capture
- Embed a URL or prototype iframe inside the tool
- Log every click the participant makes: timestamp, element clicked, position
- Track time from session start to session end
- Do not log researcher clicks — only participant interactions during an active session

### 3. Path Comparison Engine
- After the session, compare the logged click sequence against the golden path
- Identify:
  - Correct steps (click matched the expected target)
  - Misclicks (click did not match expected target before moving on)
  - Backtracking (user returned to a previous step)
  - Skipped steps (user bypassed an expected step)

### 4. Report Output
Generate a clean, minimalist report containing:
- Task name
- Golden path (the expected sequence)
- How the user actually moved through the flow
- Total decisions made (total clicks logged)
- Total errors (misclicks + backtracking + skips)
- Error breakdown by type (misclick / backtrack / skip)
- Time on task (in seconds and minutes)

Report should be readable, not a raw data dump. Use plain language.

## Tech Stack
- React (functional components, hooks)
- Plain CSS or Tailwind for styling — keep it minimal
- No backend required — store session data in component state or localStorage
- No authentication needed

## Data Structures

### Golden Path Step
```json
{
  "id": "step-1",
  "label": "Click Sign Up button",
  "expectedTarget": "#signup-btn"
}
```

### Click Event Log
```json
{
  "timestamp": 1234567890,
  "element": "#signup-btn",
  "label": "Sign Up",
  "position": { "x": 240, "y": 180 }
}
```

### Session Report
```json
{
  "taskName": "Complete sign-up flow",
  "goldenPath": ["...steps"],
  "actualPath": ["...clickEvents"],
  "totalDecisions": 12,
  "totalErrors": 3,
  "errorBreakdown": {
    "misclicks": 2,
    "backtracks": 1,
    "skips": 0
  },
  "timeOnTask": 94
}
```

## UI Principles
- Minimalist — no clutter, no decorative elements
- Two clear modes: Setup mode (researcher) and Session mode (participant)
- Report is the hero of the output — make it scannable and clean
- No authentication, no onboarding — researcher lands and can start immediately

## Constraints
- Designed for short, simple usability sessions (under 10 minutes)
- Prototype must be embeddable via iframe
- One session at a time — no multi-session management needed for MVP
- No video recording or playback
- One week to build — keep scope tight

## What Not to Build
- User accounts or login
- Session history or database persistence
- Video recording or playback
- Multi-participant sessions
- Analytics dashboards
- Export to PDF (nice to have, not MVP)

## Editing Behavior
- Make minimal, targeted edits — no scope creep
- Explain changes in plain terms suitable for someone who does not code
- If requirements are unclear, ask one focused clarification question before building
