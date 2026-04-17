import csv

# Load the survey data from a CSV file
filename = "week3_survey_messy.csv"
rows = []

with open(filename, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

# Count responses by role
# Normalize role names so "ux researcher" and "UX Researcher" are counted together
role_counts = {}

for row in rows:
    role = row["role"].strip().title()
    if role in role_counts:
        role_counts[role] += 1
    else:
        role_counts[role] = 1

print("Responses by role:")
for role, count in sorted(role_counts.items()):
    print(f"  {role}: {count}")

# Calculate the average years of experience
total_experience = 0
for row in rows:
    try:
        total_experience += int(row["experience_years"])
    except ValueError:
        pass  # or log, skip, substitute a default, etc.


avg_experience = total_experience / len(rows)
print(f"\nAverage years of experience: {avg_experience:.1f}")

# Calculate the average satisfaction score
def calculate_avg_satisfaction(rows):
    """
    Calculate the average satisfaction score from survey rows.

    Skips rows with missing or empty satisfaction_score values.

    Args:
        rows (list[dict]): List of survey response dicts loaded from the CSV.

    Returns:
        float: The average satisfaction score, or 0.0 if no valid scores exist.
    """
    scores = [
        int(row["satisfaction_score"])
        for row in rows
        if row["satisfaction_score"].strip()
    ]
    return sum(scores) / len(scores) if scores else 0.0

avg_satisfaction = calculate_avg_satisfaction(rows)
print(f"\nAverage satisfaction score: {avg_satisfaction:.1f}")

# Find the top 5 highest satisfaction scores
scored_rows = []
for row in rows:
    if row["satisfaction_score"].strip():
        scored_rows.append((row["participant_name"], int(row["satisfaction_score"])))

scored_rows.sort(key=lambda x: x[1], reverse=True)
top5 = scored_rows[:5]

print("\nTop 5 satisfaction scores:")
for name, score in top5:
    print(f"  {name}: {score}")

# Write cleaned data to a new CSV file
def write_cleaned_csv(rows, output_filename):
    """
    Write a cleaned version of the survey data to a new CSV file.

    Cleaning applied:
    - role and department are stripped of whitespace and title-cased
    - experience_years values that are not numeric are replaced with an empty string
    - All other string fields are stripped of leading/trailing whitespace

    Args:
        rows (list[dict]): List of raw survey response dicts loaded from the CSV.
        output_filename (str): Path to the output CSV file to create.
    """
    if not rows:
        return

    fieldnames = list(rows[0].keys())

    with open(output_filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for row in rows:
            cleaned = {key: value.strip() for key, value in row.items()}
            cleaned["role"] = cleaned["role"].title()
            cleaned["department"] = cleaned["department"].title()
            try:
                int(cleaned["experience_years"])
            except ValueError:
                cleaned["experience_years"] = ""
            writer.writerow(cleaned)

    print(f"\nCleaned data written to {output_filename}")

write_cleaned_csv(rows, "week3_survey_cleaned.csv")
