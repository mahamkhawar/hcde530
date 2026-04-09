# Project Context

## Purpose
This project demonstrates how to process a data file effectively and highlight important parts of the code for learning.

## Audience
- Primary audience: beginners with no coding experience.
- Audience should be able to run the script and understand what each major code section does.

## Desired outcomes
- Show clear data-processing workflow from CSV input to summary outputs.
- Provide an easy way to view results in a webpage with summaries and charts/visuals.
- Keep analysis general and data-driven.

## Success criteria
- A beginner can explain each major code section in plain language.
- A beginner can interpret summary metrics and chart outputs correctly.

## Project preferences
- It is okay to split code into multiple files/folders if it improves clarity.
- Support three run modes when possible:
  1. Terminal script output (`python ...`)
  2. Open an HTML file directly in the browser
  3. Run a tiny local app flow and view results on `localhost`

## Technical constraints
- Zero setup preferred (standard library and plain HTML/CSS/JS by default).
- Avoid extra dependencies unless explicitly requested.
- Keep naming clear and beginner-friendly.

## Code style and teaching approach
- Highlight key logic using both:
  - Inline comments in code
  - A separate explainer document
- Guide readers through this sequence:
  1. File loading
  2. Looping through rows
  3. Word-count or processing function
  4. Summary statistics/output

## Data handling expectations
- Treat `demo_responses.csv` as source of truth unless changed intentionally.
- Preserve schema when possible: `participant_id`, `role`, `response`.
- Include simple, beginner-friendly error handling examples for:
  - Missing values
  - Empty responses
  - Malformed rows

## Visualization expectations
- Emphasize summary + charts/visuals on the webpage.
- Any chart method is acceptable (HTML/CSS or SVG) if it is easy to understand.
