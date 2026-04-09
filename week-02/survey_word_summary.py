import csv
from pathlib import Path


def count_words(text):
    """Return the number of words in a string."""
    return len(text.split())


filename = Path(__file__).with_name("sample_survey_responses.csv")
word_counts = []

print(f"{'ID':<6} {'Words':<6} Response")
print("-" * 70)

with open(filename, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        participant_id = row["participant_id"]
        response = row["response"]
        words = count_words(response)
        word_counts.append(words)
        print(f"{participant_id:<6} {words:<6} {response}")

print("\nSummary")
print("-" * 70)
print(f"Total responses: {len(word_counts)}")
print(f"Shortest: {min(word_counts)} words")
print(f"Longest: {max(word_counts)} words")
print(f"Average: {sum(word_counts) / len(word_counts):.1f} words")
