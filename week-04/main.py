import requests
import csv

BASE_URL = "https://hcde530-week4-api.onrender.com"
OUTPUT_FILE = "results.csv"

def fetch_all_reviews():
    reviews = []
    offset = 0
    limit = 100

    while True:
        response = requests.get(f"{BASE_URL}/reviews", params={"offset": offset, "limit": limit})
        response.raise_for_status()
        data = response.json()

        reviews.extend(data["reviews"])

        if offset + data["returned"] >= data["total"]:
            break
        offset += data["returned"]

    return reviews

def main():
    print("Fetching reviews from API...")
    reviews = fetch_all_reviews()
    print(f"Retrieved {len(reviews)} reviews total.\n")

    for review in reviews:
        print(f"App: {review['app']} | Category: {review['category']} | Helpful Votes: {review['helpful_votes']}")

    with open(OUTPUT_FILE, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["app", "category", "helpful_votes"])
        writer.writeheader()
        for review in reviews:
            writer.writerow({
                "app": review["app"],
                "category": review["category"],
                "helpful_votes": review["helpful_votes"]
            })

    print(f"\nResults saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
