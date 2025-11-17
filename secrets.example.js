// Copy this file to `secrets.js` and fill in one of the two options below.
// KEEP `secrets.js` OUT OF SOURCE CONTROL. It's already listed in `.gitignore`.

/*
Option A (recommended): Use the Cloudflare Worker as a secure proxy.
1. Deploy the worker from `RESOURCE_cloudflare-worker.js` and set the worker secret OPENAI_API_KEY in Cloudflare.
2. Set WORKER_URL to your worker's public URL below.
*/
// const WORKER_URL = "https://your-worker-subdomain.workers.dev";

/*
Option B (not recommended for production): Call OpenAI directly from the browser.
If you choose this for local testing only, set your API key below. Be aware this exposes the key to anyone with access to the page/network.
*/
// const OPENAI_API_KEY = "sk-...your-openai-key-here...";

// After editing, save as `secrets.js` in the project root. Do NOT commit it.
