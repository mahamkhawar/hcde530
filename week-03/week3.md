# Week 3

## C2 — Code Literacy and Documentation

My script includes inline comments explaining why key operations are performed, such as why role names are normalized with `.strip().title()` so entries like `"ux researcher"` and `"UX RESEARCHER"` are counted as the same group. I added a docstring to `calculate_avg_satisfaction()` documenting its input, return value, and how it handles missing data. Commit messages describe specific changes and their purpose, for example: `"Fixed bug #2 on line 45 that fixed order to be 5 highest scores"`.

## C3 — Data Cleaning and File Handling

My script reads from a real CSV file and handles multiple data problems: inconsistent casing in role and department fields, missing participant entries, a non-numeric experience value (`"fifteen"`), and an inverted sort returning the lowest scores instead of the highest. I identified the `ValueError` by asking Claude to explain the error without fixing it, understood that `int("fifteen")` was the root cause, then applied a `try/except` block myself. All fixes are reflected in a cleaned CSV output written by the script.
