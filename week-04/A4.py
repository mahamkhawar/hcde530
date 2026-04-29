import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.environ["API_KEY"]

# Quoterism is a public quotes database API — BASE_URL is the root address all endpoints build from
BASE_URL = "https://www.quoterism.com"

# The /api/quotes/random endpoint fetches one quote selected at random from the Quoterism database.
# Each call returns a different quote. The API key is passed via the X-API-Key header, which is
# required for all requests — without it the API returns an error instead of data.
response = requests.get(
    f"{BASE_URL}/api/quotes/random",
    headers={"X-API-Key": API_KEY}
)

# The API returns a JSON object with three fields:
#   - "id": a unique identifier for the quote
#   - "text": the full text of the quote
#   - "author": a nested object containing the author's id, name, slug, and imageUrl
data = response.json()

# Extracting "text" because it is the core content — the actual quote we want to display
text = data["text"]

# Extracting "author" > "name" to give proper attribution to who said the quote
author = data["author"]["name"]

# Extracting "id" as a unique reference for the quote, useful for looking it up or citing it directly
quote_id = data["id"]

print(f'"{text}"')
print(f"— {author}")
print(f"Quote ID: {quote_id}")
