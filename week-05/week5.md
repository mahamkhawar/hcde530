# Week 5 — Data Analysis with Pandas

## Competency Claim: C5

My goal for this assignment was to understand how satisfaction is distributed across a dataset of 500 app reviews for UX research tools (Fieldkit, Lookback, Dovetail, Maze, Miro). I used pandas to load, explore, filter, and aggregate the data.

---

## What I did

**Dataset overview (`head()`, `info()`)**
The dataset had 10 columns: app name, category, star rating, review text, date, helpful votes, verified purchase status, device type, and app version. I used `info()` to check completeness before doing any analysis — two columns had meaningful gaps: `device_type` (12.6% missing) and `app_version` (22.2% missing).

**Rating distribution (`value_counts()`, `describe()`)**
I used `value_counts()` on the `rating` column to see how reviews spread across 1–5 stars, and `describe()` to get summary statistics. The mean rating was 3.95, and most reviews were 4 or 5 stars. 1-star reviews were relatively rare (only 29 out of 500). This positive skew is typical of app store data — satisfied users tend to leave reviews more than neutral ones.

**Filtering to credible complaints (boolean filtering)**
I filtered to verified purchasers who gave 1–2 stars — 55 rows. These are the most reliable negative signals because the users confirmed they actually used the product. Reading through them, concrete UX failures surfaced: broken integrations, session links expiring, search slowness under load, storage limits hitting quickly during recording sessions. These aren't vague complaints — they point to specific, reproducible problems.

**Average rating by category (`groupby`)**
I used `groupby('category')['rating'].mean()` to compare satisfaction across the five app categories. Field research tools averaged 3.67 — the lowest of any category — while research repository tools averaged 4.12. That result surprised me. I expected the categories to be roughly similar. The gap suggests field research tools may face higher user expectations or have harder usability problems to solve, given how context-dependent and variable fieldwork conditions are.

**Missing value audit (`isnull().sum()`)**
I used `isnull().sum()` combined with `mean()` to get both counts and percentages of missing data. `device_type` and `app_version` were the only incomplete columns. I noted this as a limitation: any comparison of mobile vs. desktop ratings would be weakened because 12.6% of rows have no device information.

---

## What I learned

`groupby` followed by an aggregation like `.mean()` was the operation I understood most clearly after this assignment. It answered a question I couldn't have answered by just reading the raw data: which category of tool do users find least satisfying, and by how much? The answer isn't just a number — a 0.45-point gap between field research (3.67) and research repositories (4.12) is meaningful when you're trying to decide where to focus a design investigation.

I also learned that missing data isn't just a technical problem — it limits what questions are safe to ask. I couldn't confidently compare mobile vs. desktop experience because 63 rows had no device type. Noting that limitation early prevented me from drawing a misleading conclusion.

---

## Connection to the MP

The specific UX failures in the low-rating reviews — broken integrations, session management problems, storage constraints — are the kind of patterns I want to carry into my MP. Rather than asking "which app has the worst rating," the more useful question is "what specific interaction breakdowns are users describing?" That shift from aggregate numbers to review text feels like the next step, and this analysis showed me where to look.
