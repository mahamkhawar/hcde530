import csv
from pathlib import Path


def count_words(text):
    """Return the number of words in a string."""
    # split() divides on any whitespace — a simple proxy for response length
    # useful in HCD research for comparing how much participants elaborated
    return len(text.split())


# with_name() builds the file path relative to this script's location,
# so it works correctly no matter which directory the script is run from
filename = Path(__file__).with_name("sample_survey_responses.csv")

# storing counts in a list so summary stats (min, max, avg) can be
# calculated across all responses after the loop completes
word_counts = []

print(f"{'ID':<6} {'Words':<6} Response")
print("-" * 70)

with open(filename, newline="", encoding="utf-8") as f:
    # DictReader lets us access columns by name rather than position,
    # which is more readable and won't break if column order changes
    reader = csv.DictReader(f)
    for row in reader:
        participant_id = row["participant_id"]
        response = row["response"]
        words = count_words(response)
        word_counts.append(words)
        print(f"{participant_id:<6} {words:<6} {response}")

# summary stats reveal the spread of response lengths —
# a large gap between shortest and longest may indicate uneven participant engagement
print("\nSummary")
print("-" * 70)
print(f"Total responses: {len(word_counts)}")
print(f"Shortest: {min(word_counts)} words")
print(f"Longest: {max(word_counts)} words")
print(f"Average: {sum(word_counts) / len(word_counts):.1f} words")
