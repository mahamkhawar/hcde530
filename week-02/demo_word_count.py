# script to count the number of words in each response
# see context.md for more details
import csv
from pathlib import Path


# Load the CSV file (same folder as this script)
# Using Path(__file__) instead of a hardcoded path so the script works
# regardless of which directory it's run from
filename = Path(__file__).resolve().parent / "demo_responses.csv"
responses = []

with open(filename, newline="", encoding="utf-8") as f:
    # DictReader is used instead of a regular reader so columns can be accessed
    # by name (e.g. row["response"]) rather than by index — this makes the code
    # easier to read and less fragile if column order changes
    reader = csv.DictReader(f)
    for row in reader:
        responses.append(row)

# function to count the number of words in a response
def count_words(response):
    """Count the number of words in a response string.

    Takes a string, splits it on whitespace, and returns the word count.
    Used to measure response length across all participants.
    """
    # split() divides the string on any whitespace — this is a simple but effective
    # way to estimate response length, which matters in HCD research because longer
    # responses often signal more engaged or reflective participants
    return len(response.split())


# Count words in each response and print a row-by-row summary
print(f"{'ID':<6} {'Role':<22} {'Words':<6} {'Response (first 60 chars)'}")
print("-" * 75)
# initialize a list to store the word counts
# storing all counts in a list lets us run summary statistics (min, max, avg)
# across the full dataset after the loop, rather than recalculating from scratch
word_counts = []

for row in responses:
    participant = row["participant_id"]
    role = row["role"]
    response = row["response"]

    # Call our function to count words in this response
    count = count_words(response)
    word_counts.append(count)

    # Truncate the response preview for display
    # 60 characters keeps the table readable in a standard terminal window
    # without wrapping — we only need a glimpse to verify the data, not the full text
    if len(response) > 60:
        preview = response[:60] + "..."
    else:
        preview = response
# print the participant ID, role, word count, and response preview
    print(f"{participant:<6} {role:<22} {count:<6} {preview}")

# Print summary statistics
# min, max, and average give a quick sense of the spread in response length —
# a wide range may indicate inconsistent engagement or varied question interpretation
print()
print("── Summary ─────────────────────────────────")
print(f"  Total responses : {len(word_counts)}")
print(f"  Shortest        : {min(word_counts)} words")
print(f"  Longest         : {max(word_counts)} words")
print(f"  Average         : {sum(word_counts) / len(word_counts):.1f} words")
