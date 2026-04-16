import csv
from collections import Counter


INPUT_FILE = "responses.csv"


def normalize_role(role: str) -> str:
    return role.strip().lower()


def count_roles(input_file: str) -> Counter:
    role_counts: Counter = Counter()

    with open(input_file, mode="r", newline="", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)

        for row in reader:
            role = row.get("role", "")
            normalized = normalize_role(role)

            if normalized:
                role_counts[normalized] += 1

    return role_counts


def main() -> None:
    role_counts = count_roles(INPUT_FILE)

    print("Role counts:")
    for role, count in sorted(role_counts.items()):
        print(f"{role}: {count}")


if __name__ == "__main__":
    main()
