# Usability Session Analyzer

## What It Does

A browser-based tool for running structured usability tests. A UX researcher defines a **golden path** — the sequence of steps a user is expected to take — then runs a live session where a participant interacts with an embedded prototype. Every click is automatically logged and compared against the golden path. At the end, the tool generates a plain-language report showing what the user did right, where they went wrong, and how long they took.

## Who It's For

- **UX researchers** who need a lightweight way to run and document usability sessions without a paid platform
- **UX designers and developers** who want a structured summary of where users deviate from the expected flow

## How to Use It

No installation required. Access the live tool at:

**[https://wall-flower.bolt.host](https://wall-flower.bolt.host)**

1. **Setup mode** — Enter a task name and define your golden path (the ordered list of steps you expect the user to follow)
2. **Session mode** — Hand off to the participant; the tool logs their clicks inside the embedded prototype
3. **Report** — After the session ends, read the structured report showing correct steps, misclicks, backtracks, skips, and total time on task

## Tech Stack

Built with React and deployed via Bolt. Runs entirely in the browser — no backend, no login, no data leaves the session.
