# MP2 Competency Claims

## C1 — Vibecoding and Rapid Prototyping

I used Bolt to build and deploy a browser-based usability testing tool. The app lets a researcher define a golden path, run a live session with a participant, and receive a structured report at the end. It is deployed at [https://wall-flower.bolt.host](https://wall-flower.bolt.host).

Building this took more than 10 rounds of prompting and iteration — it was not a one-shot result. Bolt got the click logging logic right early: the session capture correctly attached event listeners and recorded timestamps and element targets without me needing to redirect it. Where I had to push back was the report output. The first version was a raw data dump — a list of every logged click with no structure or interpretation. I redirected Bolt to generate a plain-language report that grouped results by category (correct steps, misclicks, backtracks, skips) and summarized findings in readable sentences rather than raw arrays. That required several follow-up prompts to get the tone and structure right.

---

## C8 — Building and Deploying a Complete Tool

My MP2 is a Usability Session Analyzer — a tool for UX researchers who need a fast, structured way to run usability tests without a paid platform. The tool has two modes: a setup mode where the researcher defines the expected flow, and a session mode where the participant interacts with an embedded prototype while every click is logged automatically. At the end, the tool outputs a report showing how closely the user followed the expected path, what types of errors occurred, and how long the task took.

The tool is deployed and usable at [https://wall-flower.bolt.host](https://wall-flower.bolt.host).

The biggest challenge was the report. Bolt's first version surfaced raw click event data with no interpretation — useful for debugging but not readable for a researcher. I iterated on the prompt until the output used plain language and organized findings into meaningful categories. If I were to scope this differently, I would start with the report format and work backwards — defining what the output should look like before building the session capture, rather than the other way around.
