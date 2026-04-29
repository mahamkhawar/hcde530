# C4 — APIs and Data Acquisition

## What I Did

I searched for a public API through the master list provided in class and selected the Quoterism API (https://www.quoterism.com), a database of inspirational quotes. I read the API documentation to understand the available endpoints, what each one returns, and how authentication works.

## The API Call

I used the `/api/quotes/random` endpoint, which returns a single randomly selected quote as a JSON object each time it is called. The response contains three fields:

- `text` — the full text of the quote
- `author` — a nested object containing the author's name, id, slug, and image URL
- `id` — a unique identifier for the quote

Authentication is required via an `X-API-Key` header. Without it, the API returns an error instead of data.

## What I Extracted and Why

I extracted `text`, `author.name`, and `id` because these were the fields with meaningful, human-readable output. Other available fields (such as slug and imageUrl) were less useful for plain-text display. I printed all three to the terminal.

## Keeping the API Key Secure

I stored my API key in a `.env` file and loaded it using `python-dotenv` so the key never appears directly in the source code. I also added `.env` to `.gitignore` so it is never committed to the repository and remains local to my machine.

## Why This Matters for HCD Work

This is important for HCD work because APIs are human-created datasets — whether it is a quote bank like this or real-life situations involving user interview or survey data. Being able to extract from datasets is an important skill for informing design decisions.
