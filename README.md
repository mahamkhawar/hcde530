# HCDE 530 — course repository

This is the **single repository** for the whole course. Each week’s work lives in its own folder so assignments stay organized.

## Layout

```text
.
├── README.md
├── .gitignore
├── .cursorrules
└── week-02/          # Week 2 — CSV + Python + optional HTML dashboard
    ├── context.md
    ├── week2.md
    ├── demo_responses.csv
    ├── demo_word_count.py
    ├── sample_survey_responses.csv
    ├── survey_word_summary.py
    └── dashboard.html
```

## Week 2 — run scripts

From the repo root:

```bash
python3 week-02/demo_word_count.py
python3 week-02/survey_word_summary.py
```

Open `week-02/dashboard.html` in a browser for the static dashboard view.

## Next weeks

Add new folders alongside `week-02` (for example `week-03/`) so the main repo always contains the full course history.
