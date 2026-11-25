const input = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const resultsEl = document.getElementById("results");
const hero = document.getElementById("hero");
const hints = document.getElementById("hints");
const isHome = !!resultsEl;

function showResults(items) {
  hero.style.display = "none";
  hints.style.display = "none";
  resultsEl.innerHTML = "";
  if (items.length === 0) {
    resultsEl.innerHTML = "<p class='none'>No results found. Try beach or country.</p>";
    return;
  }
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<img src="${item.imageUrl}" alt="${item.name}" />
      <div class="card-body"><h3>${item.name}</h3><p>${item.description}</p>
      <button class="visit">Visit</button></div>`;
    resultsEl.appendChild(card);
  });
}

async function search(term) {
  const keyword = term.trim().toLowerCase();
  if (!keyword) return;
  try {
    const res = await fetch("travel_recommendation_api.json");
    const data = await res.json();
    const countries = data.countries || [];
    const beaches = data.beaches || [];
    let results = [];

    if (keyword.startsWith("beach")) {
      results = beaches;
    } else if (keyword.startsWith("countr")) {
      countries.forEach(c => results.push(...c.cities));
    } else {
      countries.forEach(c => {
        if (c.name.toLowerCase().includes(keyword)) results.push(...c.cities);
        else c.cities.forEach(city => {
          if (city.name.toLowerCase().includes(keyword)) results.push(city);
        });
      });
      beaches.forEach(b => {
        if (b.name.toLowerCase().includes(keyword)) results.push(b);
      });
    }
    showResults(results);
  } catch (err) {
    console.error("Error fetching data:", err);
    if (isHome) resultsEl.innerHTML = "<p class='none'>Could not load recommendations.</p>";
  }
}

function runSearch() {
  const term = input.value;
  if (!term.trim()) return;
  if (isHome) search(term);
  else window.location.href = "index.html?search=" + encodeURIComponent(term);
}

function clearResults() {
  input.value = "";
  if (isHome) {
    resultsEl.innerHTML = "";
    hero.style.display = "";
    hints.style.display = "";
  }
}

searchBtn.addEventListener("click", runSearch);
clearBtn.addEventListener("click", clearResults);
input.addEventListener("keydown", e => { if (e.key === "Enter") runSearch(); });

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    input.value = chip.dataset.search;
    search(chip.dataset.search);
  });
});

if (isHome) {
  const q = new URLSearchParams(window.location.search).get("search");
  if (q) { input.value = q; search(q); }
}