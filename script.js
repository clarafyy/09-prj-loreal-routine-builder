/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
let allProducts = [];
let selectedProducts = new Set();
const selectedProductsList = document.getElementById("selectedProductsList");

/* Show initial placeholder while products load */
productsContainer.innerHTML = `
  <div class="placeholder-message">Loading products…</div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  allProducts = data.products || [];
  return allProducts;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  if (!products || products.length === 0) {
    productsContainer.innerHTML = `
      <div class="placeholder-message">No products found for this category.</div>
    `;
    return;
  }

  productsContainer.innerHTML = products.map(generateCardHtml).join("");
  // Re-apply selection visuals in case some rendered cards were previously selected
  applySelectionToDOM();
}

// Generate HTML for a single product card (used by both list and grouped views)
function generateCardHtml(product) {
  const safeAlt = product.name ? product.name : product.brand;
  return `
    <article class="product-card" data-category="${
      product.category
    }" data-id="${product.id}" tabindex="0">
      <div class="select-badge" aria-hidden="true"><i class="fa-solid fa-check"></i></div>
      <img src="${product.image}" alt="${safeAlt}">
      <div class="product-info">
        <div class="title-row" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <h3 style="margin:0;font-size:16px;">${product.name}</h3>
          <button class="expand-btn" aria-expanded="false" aria-controls="desc-${
            product.id
          }" title="Show details">
            <i class="fa-solid fa-chevron-down expand-icon"></i>
          </button>
        </div>
        <p style="margin:6px 0 0 0;color:var(--muted);">${product.brand}</p>
        <div id="desc-${product.id}" class="product-desc">${
    product.description || ""
  }</div>
      </div>
    </article>
  `;
}

// Display products grouped by their `category` with a header for each group
function displayGroupedProducts(products) {
  if (!products || products.length === 0) {
    productsContainer.innerHTML = `
      <div class="placeholder-message">No products available.</div>
    `;
    return;
  }

  // Group products in insertion order by category
  const groups = new Map();
  products.forEach((p) => {
    if (!groups.has(p.category)) groups.set(p.category, []);
    groups.get(p.category).push(p);
  });

  const sections = [];
  for (const [category, items] of groups) {
    const sectionHtml = `
      <section class="category-section">
        <h3 class="category-header">${capitalize(category)}</h3>
        <div class="products-grid">
          ${items.map(generateCardHtml).join("")}
        </div>
      </section>
    `;
    sections.push(sectionHtml);
  }

  productsContainer.innerHTML = sections.join("");
  applySelectionToDOM();
}

function capitalize(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Apply selection visuals to DOM cards after rendering
function applySelectionToDOM() {
  const cards = productsContainer.querySelectorAll(".product-card");
  cards.forEach((card) => {
    const id = Number(card.dataset.id);
    if (selectedProducts.has(id)) {
      card.classList.add("is-selected");
    } else {
      card.classList.remove("is-selected");
    }
  });
}

function renderSelectedProductsList() {
  if (!selectedProductsList) return;

  const items = Array.from(selectedProducts).map((id) => {
    const p = allProducts.find((x) => x.id === id);
    if (!p) return "";
    return `
      <div class="selected-item" data-id="${p.id}">
        <img src="${p.image}" alt="${p.name}">
        <span>${p.name}</span>
        <button aria-label="Remove ${p.name}" title="Remove">&times;</button>
      </div>
    `;
  });

  selectedProductsList.innerHTML = items.join("");
}

// Toggle selection for a product id
function toggleProductSelection(id) {
  if (selectedProducts.has(id)) {
    selectedProducts.delete(id);
  } else {
    selectedProducts.add(id);
  }
  applySelectionToDOM();
  renderSelectedProductsList();
}

// Click or keyboard events on product cards (delegation)
productsContainer.addEventListener("click", (e) => {
  // Expand button handling — don't toggle selection when expanding
  const expandBtn = e.target.closest(".expand-btn");
  if (expandBtn) {
    const card = expandBtn.closest(".product-card");
    if (!card) return;
    const expanded = card.classList.toggle("is-expanded");
    expandBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    return;
  }

  // Ignore clicks on buttons inside the card (like the badge or other controls)
  if (e.target.closest("button")) return;

  const card = e.target.closest(".product-card");
  if (!card) return;
  const id = Number(card.dataset.id);
  toggleProductSelection(id);
});

productsContainer.addEventListener("keydown", (e) => {
  // allow Enter/Space to toggle selection when card is focused
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".product-card");
  if (!card) return;
  // if focus is on a button inside the card, don't toggle here
  if (e.target.closest("button")) return;
  e.preventDefault();
  const id = Number(card.dataset.id);
  toggleProductSelection(id);
});

// Allow removing from selected list via its remove button
if (selectedProductsList) {
  selectedProductsList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const item = e.target.closest(".selected-item");
    if (!item) return;
    const id = Number(item.dataset.id);
    if (!id) return;
    toggleProductSelection(id);
  });
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const selectedCategory = e.target.value;

  // ensure products are loaded
  if (!allProducts || allProducts.length === 0) {
    await loadProducts();
  }

  if (selectedCategory === "all" || !selectedCategory) {
    displayGroupedProducts(allProducts);
    return;
  }

  const filteredProducts = allProducts.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

// Load & display all products on initial page load
document.addEventListener("DOMContentLoaded", async () => {
  const products = await loadProducts();
  // default is 'all' so show grouped view on load
  displayGroupedProducts(products);
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});

/* ---------- Generate Routine (OpenAI) ---------- */
const generateBtn = document.getElementById("generateRoutine");

function appendChatMessage(role, text) {
  const el = document.createElement("div");
  el.className = `chat-msg chat-${role}`;
  el.innerText = text;
  chatWindow.appendChild(el);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

generateBtn.addEventListener("click", async () => {
  // collect selected products
  const ids = Array.from(selectedProducts);
  if (!ids || ids.length === 0) {
    appendChatMessage(
      "assistant",
      "Please select at least one product to generate a routine."
    );
    return;
  }

  const productsForApi = ids
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => ({
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
    }));

  // show loading message in chat
  appendChatMessage(
    "user",
    `Generate routine for ${productsForApi.length} products...`
  );
  const loadingEl = document.createElement("div");
  loadingEl.className = "chat-msg chat-assistant loading";
  loadingEl.innerText = "Generating routine…";
  chatWindow.appendChild(loadingEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // craft messages: system + user (include JSON of products)
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful skincare and haircare routine assistant. Produce a clear, step-by-step routine using the provided products and indicate when to use each product (AM/PM/Weekly) and any pairing notes. Keep it concise and actionable.",
      },
      {
        role: "user",
        content: `Here are the selected products as JSON. Generate a simple routine that lists steps and where each product fits:\n\n${JSON.stringify(
          productsForApi,
          null,
          2
        )}`,
      },
    ];

    // If a Cloudflare Worker URL is provided via `WORKER_URL` (e.g., in secrets.js), prefer calling it.
    // The Worker should accept POST JSON: { model, messages, max_tokens }
    if (typeof WORKER_URL !== "undefined" && WORKER_URL) {
      const workerRes = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o", messages, max_tokens: 800 }),
      });

      const workerData = await workerRes.json();
      loadingEl.remove();

      // Worker returns normalized { reply, raw } when using the supplied RESOURCE_cloudflare-worker.js
      if (workerData && workerData.reply) {
        appendChatMessage("assistant", workerData.reply);
      } else if (workerData && workerData.error) {
        appendChatMessage(
          "assistant",
          `Worker error: ${JSON.stringify(workerData.error)}`
        );
      } else {
        appendChatMessage("assistant", "Unexpected worker response format.");
      }
      return;
    }

    // Fallback: direct call to OpenAI if OPENAI_API_KEY is present in the page (not recommended for production)
    if (typeof OPENAI_API_KEY === "undefined" || !OPENAI_API_KEY) {
      loadingEl.remove();
      appendChatMessage(
        "assistant",
        "Missing API configuration. For best practice deploy the provided Cloudflare Worker and set `WORKER_URL` in `secrets.js`, or provide `OPENAI_API_KEY` in `secrets.js` for direct calls (not recommended in production)."
      );
      return;
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: "gpt-4o", messages, max_tokens: 800 }),
    });

    const data = await res.json();
    loadingEl.remove();

    if (!data) {
      appendChatMessage("assistant", "No response from API.");
      return;
    }

    // follow the workspace convention: check data.choices[0].message.content
    const content =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;
    if (content) {
      appendChatMessage("assistant", content);
    } else if (data.error && data.error.message) {
      appendChatMessage("assistant", `API error: ${data.error.message}`);
    } else {
      appendChatMessage("assistant", "Unexpected API response format.");
    }
  } catch (err) {
    loadingEl.remove();
    appendChatMessage("assistant", `Request failed: ${err.message}`);
  }
});
