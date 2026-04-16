import csv


INPUT_FILE = "responses.csv"
OUTPUT_FILE = "responses_cleaned.csv"


def is_empty(value: str) -> bool:
    return value is None or value.strip() == ""


def clean_csv(input_file: str, output_file: str) -> None:
    with open(input_file, mode="r", newline="", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames

        if not fieldnames:
            raise ValueError("Input CSV has no header row.")

        with open(output_file, mode="w", newline="", encoding="utf-8") as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()

            for row in reader:
                name_value = row.get("name", "")
                if is_empty(name_value):
                    continue

                role_value = row.get("role")
                if role_value is not None:
                    row["role"] = role_value.upper()

                writer.writerow(row)


if __name__ == "__main__":
    clean_csv(INPUT_FILE, OUTPUT_FILE)
