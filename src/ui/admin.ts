import { saveUserQuote, getUserQuotes, exportUserQuotes, importUserQuotes, clearUserQuotes } from "../quotes/userQuotes";
import { loadCustomQuotes } from "../quotes/customQuotes";
import { loadNextCard } from "../main";
import type { Quote } from "../types";

const countEl = document.getElementById("quote-count") as HTMLElement;
const listEl = document.getElementById("quotes-list") as HTMLElement;

// Tab Elements
const tabCreate = document.getElementById("sheet-tab-create") as HTMLButtonElement;
const tabLibrary = document.getElementById("sheet-tab-library") as HTMLButtonElement;
const viewCreate = document.getElementById("view-create") as HTMLElement;
const viewLibrary = document.getElementById("view-library") as HTMLElement;

let closeAdminFn: () => void = () => {};

// Store merged list for click-by-index to work correctly
let mergedQuoteList: Quote[] = [];

export function bindAdminClose(fn: () => void) {
  closeAdminFn = fn;
}

export function initAdmin() {
  // Bind Tab Switching
  tabCreate.addEventListener("click", () => switchTab("create"));
  tabLibrary.addEventListener("click", () => switchTab("library"));

  // Bind Actions
  document.getElementById("add-quote-btn")!.addEventListener("click", handleAdd);
  document.getElementById("export-btn")!.addEventListener("click", exportUserQuotes);
  document.getElementById("clear-btn")!.addEventListener("click", handleClear);
  document.getElementById("import-file")!.addEventListener("change", handleImport);

  // Library item click — use index from mergedQuoteList
  listEl.addEventListener("click", (e) => {
    const item = (e.target as HTMLElement).closest(".list-item");
    if (!item) return;

    const index = parseInt(item.getAttribute("data-index") || "0", 10);
    const selectedQuote = mergedQuoteList[index];

    if (selectedQuote) {
      closeAdminFn();
      document.getElementById("card-container")!.innerHTML = "";
      loadNextCard(selectedQuote);
    }
  });

  updateCountAndList();
}

function switchTab(tab: "create" | "library") {
  if (tab === "create") {
    tabCreate.classList.add("active");
    tabLibrary.classList.remove("active");
    viewCreate.classList.remove("hidden");
    viewLibrary.classList.add("hidden");
  } else {
    tabLibrary.classList.add("active");
    tabCreate.classList.remove("active");
    viewLibrary.classList.remove("hidden");
    viewCreate.classList.add("hidden");
    // ✅ Refresh list every time library tab is opened to stay in sync
    updateCountAndList();
  }
  if ((window as any).feather) (window as any).feather.replace();
}

function handleAdd() {
  const content = (document.getElementById("input-content") as HTMLInputElement).value.trim();
  const character = (document.getElementById("input-char") as HTMLInputElement).value.trim();
  const anime = (document.getElementById("input-anime") as HTMLInputElement).value.trim();

  if (!content || !character || !anime) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  const newQuote = {
    content,
    character: { name: character },
    anime: { name: anime },
    source: "user" as const,
  };

  saveUserQuote(newQuote);

  (document.getElementById("input-content") as HTMLInputElement).value = "";
  (document.getElementById("input-char") as HTMLInputElement).value = "";
  (document.getElementById("input-anime") as HTMLInputElement).value = "";

  updateCountAndList();
  closeAdminFn();
  document.getElementById("card-container")!.innerHTML = "";
  loadNextCard(newQuote);
}

function handleClear() {
  if (confirm("🗑️ Clear all your custom quotes from library?")) {
    clearUserQuotes();
    updateCountAndList();
  }
}

async function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  await importUserQuotes(file);
  updateCountAndList();
  alert(`✅ Imported successfully!`);
}

export async function updateCountAndList() {
  const userQuotes = getUserQuotes();
  const customQuotes = await loadCustomQuotes();

  // ✅ Merge both: user-created first, then default JSON quotes
  mergedQuoteList = [...userQuotes, ...customQuotes];

  countEl.textContent = mergedQuoteList.length.toString();

  if (mergedQuoteList.length === 0) {
    listEl.innerHTML = `<div class="empty-list">No quotes yet.</div>`;
    return;
  }

  listEl.innerHTML = mergedQuoteList
    .map(
      (q, index) => `
    <div class="list-item" data-index="${index}">
      <div class="list-badge">${q.source === "user" ? "✍️ Mine" : "📁 Default"}</div>
      <div class="list-q">"${q.content}"</div>
      <div class="list-meta">— ${q.character?.name || q.character} · ${q.anime?.name || q.anime}</div>
    </div>
  `
    )
    .join("");
}
