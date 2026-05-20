# MP1B — Competency Claims

## C4 — APIs and Data Acquisition

For this project I called the PurpleAir API to pull live PM2.5 readings from outdoor and indoor sensors across Seattle and seven other U.S. cities. I chose PurpleAir from a list of APIs provided in class after reading its documentation to understand what the `/sensors` endpoint returns — a JSON snapshot of all active sensors within a bounding box, with fields like `pm2.5`, `pm2.5_24hour`, `temperature`, and `humidity`. I made multiple requests with different `location_type` parameters (0 for outdoor, 1 for indoor) and different bounding boxes per city, then parsed each JSON response into a pandas DataFrame. My API key is stored in a `.env` file loaded with `python-dotenv`; the `.env` file is in `.gitignore` so it was never committed to the repository.

---

## C6 — Data Visualization

I built three charts in this notebook using Plotly — a neighborhood PM2.5 bar chart, an indoor vs. outdoor grouped bar chart, and a city comparison bar chart. For the neighborhood and city charts I chose a horizontal bar orientation because there were many categories with long labels (e.g., "University District", "San Francisco"); a vertical bar would have made the x-axis labels illegible or required rotation. I discovered this the hard way — the first render had the y-axis labels clipped because the left margin was set too small. I caught the problem by looking at the output, diagnosed it as a margin issue, and fixed it by increasing `margin=dict(l=...)` in the layout. Each chart was exported as a `.png` using kaleido so it could be embedded outside the notebook. Each chart section includes a markdown cell that explains what the chart shows and what its limitations are — not just the output but what it means.

---

## C7 — Critical Evaluation and Professional Judgment

I used Claude Code in my VSCode environment throughout this project — both to generate code and as a troubleshooting assistant. The clearest example of evaluation on my part: the chart code Claude produced initially rendered with labels visually cut off. I noticed this was wrong when I looked at the output, and worked through the fix (a margin adjustment) rather than accepting the broken version. A second moment of evaluation came during the data profiling step: `describe()` showed a mean PM2.5 of 74 µg/m³ against a median of 1.6 µg/m³ — an obvious red flag. I identified that one or two sensors were reporting physically implausible readings (the max was 6666 µg/m³), added a filter to drop anything above 200 µg/m³, and switched to reporting medians throughout the analysis rather than means. I would not have presented the unfiltered mean to a stakeholder — it would have been a misleading number.
