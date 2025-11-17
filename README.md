# Project 9: L'Oréal Routine Builder
L’Oréal is expanding what’s possible with AI, and now your chatbot is getting smarter. This week, you’ll upgrade it into a product-aware routine builder. 

Users will be able to browse real L’Oréal brand products, select the ones they want, and generate a personalized routine using AI. They can also ask follow-up questions about their routine—just like chatting with a real advisor.

## Connecting to OpenAI

This project supports two ways to call the OpenAI API. The recommended, secure option is to deploy the included Cloudflare Worker (`RESOURCE_cloudflare-worker.js`) and point the frontend at it. For quick local testing you can also provide an `OPENAI_API_KEY` directly (not recommended for production).

1. Create a `secrets.js` file in the project root (it is ignored by git).
	- Copy `secrets.example.js` to `secrets.js` and then uncomment and set either `WORKER_URL` (recommended) or `OPENAI_API_KEY` (local testing only).

2. Deploy the Cloudflare Worker (recommended):
	- Use the code in `RESOURCE_cloudflare-worker.js`.
	- Set the Worker secret `OPENAI_API_KEY` in the Cloudflare dashboard or via `wrangler secret put OPENAI_API_KEY`.
	- After deploying, set `WORKER_URL` in your `secrets.js` to your worker's public URL (e.g. `https://<subdomain>.workers.dev`).

3. Local testing (not secure):
	- Put `const OPENAI_API_KEY = "sk-...";` in `secrets.js` and keep this file private.

4. Start the local server and open the app:
```bash
python3 -m http.server 8000
$BROWSER http://127.0.0.1:8000
```

When `WORKER_URL` is set the frontend will POST to the worker which proxies the request to OpenAI. If `WORKER_URL` is not set but `OPENAI_API_KEY` is present, the frontend will call the OpenAI REST API directly.

## Deploying the Cloudflare Worker with Wrangler (example)

If you'd like to deploy the worker using Cloudflare's Wrangler CLI, here's a minimal example.

1. Install Wrangler (you can install globally or use npx):

```bash
npm install -g wrangler
# or:
npx wrangler --version
```

2. Edit `wrangler.toml` in the repo root and set your `account_id` (or leave blank if you plan to login first).

3. Login and publish the worker:

```bash
wrangler login
wrangler publish
# Or publish to an env named "production":
wrangler publish --env production
```

4. Set the OpenAI key in the Worker environment (recommended):

```bash
wrangler secret put OPENAI_API_KEY --env production
```

5. After publishing you'll have a `workers.dev` URL. Set `WORKER_URL` in your `secrets.js` to point at that URL.

Note: `wrangler` has more features (routes, durable objects, and CI integration). The example above is intentionally minimal — let me know if you want a GitHub Actions workflow or more advanced config.