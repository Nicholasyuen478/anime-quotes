import { fetchAnimeChanQuote, getAnimeChanStatus } from "./api/animechan";
import { fetchImage } from "./api/image";
import { loadCustomQuotes } from "./quotes/customQuotes";
import { getUserQuotes } from "./quotes/userQuotes";
import { initAdmin, bindAdminClose } from "./ui/admin";
import { initSwipeCard } from "./ui/swipe";
import type { Quote } from "./types";

const container = document.getElementById("card-container") as HTMLElement;
const tabAnimechan = document.getElementById("tab-animechan") as HTMLButtonElement;
const tabOwn = document.getElementById("tab-own") as HTMLButtonElement;
const rateBadge = document.getElementById("rate-badge") as HTMLElement;

let activeTab: "animechan" | "own" = "animechan";
let lastQuoteContent: string | null = null;

// ── Tabs ──
tabAnimechan.addEventListener("click", () => { activeTab = "animechan"; updateUI(); });
tabOwn.addEventListener("click", () => { activeTab = "own"; updateUI(); });

function updateUI() {
  tabAnimechan.classList.toggle("active", activeTab === "animechan");
  tabOwn.classList.toggle("active", activeTab === "own");
  
  if (activeTab === "animechan") {
    // Show a static friendly notice instead of counting
    rateBadge.innerHTML = `<i data-feather="heart" style="width:12px; height:12px;"></i> AnimeChan Free Tier`;
    rateBadge.classList.remove("hidden");
    rateBadge.style.color = "var(--text-muted)"; // Normal color
    if((window as any).feather) (window as any).feather.replace();
  } else {
    rateBadge.classList.add("hidden");
  }
  
  container.innerHTML = '';
  loadNextCard();
}

function showRateLimitWarning() {
  rateBadge.innerHTML = `<i data-feather="alert-triangle" style="width:12px; height:12px;"></i> AnimeChan Limit Reached! Switched to My Quotes.`;
  rateBadge.style.color = "var(--accent)"; // Highlight red/coral
  if((window as any).feather) (window as any).feather.replace();
}

// ── Quote Pool Combiner ──
async function getRandomCombinedOwnQuote(): Promise<Quote | null> {
  const userQs = getUserQuotes();
  const customQs = await loadCustomQuotes();
  const allOwnQuotes = [...userQs, ...customQs];
  
  if (allOwnQuotes.length === 0) return null;
  if (allOwnQuotes.length === 1) return allOwnQuotes[0];

  const filteredQuotes = allOwnQuotes.filter(q => q.content !== lastQuoteContent);
  const pool = filteredQuotes.length > 0 ? filteredQuotes : allOwnQuotes;
  
  return pool[Math.floor(Math.random() * pool.length)]!;
}

// ── DOM Card Creation ──
function createSkeletonCard(): HTMLElement {
  const el = document.createElement("div");
  el.className = "swipe-card is-skeleton";
  return el;
}

function createQuoteCard(quote: Quote, imgUrl: string | null, charName: string, animeName: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "swipe-card";
  
  const imgHtml = imgUrl 
    ? `<div class="card-img-wrap"><img src="${imgUrl}" alt="${charName}" /><div class="card-img-overlay"></div></div>`
    : `<div class="card-img-wrap"><div class="card-img-overlay" style="background: var(--card-bg)"></div></div>`;

  const sourceBadge = quote.source === "animechan" 
    ? `<span class="source-badge">🌐 AnimeChan</span>` 
    : `<span class="source-badge">📁 My Quotes</span>`;

  el.innerHTML = `
    ${imgHtml}
    <div class="card-content">
      <div class="quote-icon">"</div>
      <div class="quote-text">${quote.content}</div>
      <div class="card-meta">
        <span class="char-name">${charName}</span>
        <span class="anime-name">${animeName}</span>
        ${sourceBadge}
      </div>
    </div>
  `;
  return el;
}

// ── Workflow ──
export async function loadNextCard(forceQuote?: Quote) {
  const skeleton = createSkeletonCard();
  container.appendChild(skeleton);

  try {
    let quote: Quote | null = forceQuote || null;

    if (!quote) {
      if (activeTab === "animechan") {
        if (getAnimeChanStatus() === true) {
          // If we already know it's rate limited from a previous 429
          showRateLimitWarning();
          quote = await getRandomCombinedOwnQuote();
          if (!quote) throw new Error("Rate limit reached. Add custom quotes!");
        } else {
          try {
            quote = await fetchAnimeChanQuote();
          } catch (e: any) {
            if (e.message === "RATE_LIMIT_REACHED") {
              showRateLimitWarning();
              quote = await getRandomCombinedOwnQuote();
              if (!quote) throw new Error("Rate limit reached. Add custom quotes!");
            } else {
              throw e;
            }
          }
        }
      } else {
        quote = await getRandomCombinedOwnQuote();
        if (!quote) throw new Error("No custom quotes yet! Add some.");
      }
    }

    lastQuoteContent = quote.content;

    const charName = typeof quote.character === 'string' ? quote.character : quote.character?.name || "Unknown";
    const animeName = typeof quote.anime === 'string' ? quote.anime : quote.anime?.name || "Unknown";

    const imgUrl = await fetchImage(charName, animeName);
    const card = createQuoteCard(quote, imgUrl, charName, animeName);
    skeleton.replaceWith(card);

    initSwipeCard(card, () => {
      loadNextCard();
    });

  } catch (err: any) {
    skeleton.innerHTML = `<div class="card-content"><div class="quote-text">${err.message || "Failed to load."}</div></div>`;
    skeleton.classList.remove('is-skeleton');
    initSwipeCard(skeleton, () => loadNextCard());
  }
}

// ── Admin Panel Binding ──
const adminBtn = document.getElementById('btn-admin')!;
const overlay = document.getElementById('overlay')!;
const adminPanel = document.getElementById('admin-panel')!;

const closeAdmin = () => {
  adminPanel.classList.add('hidden');
  overlay.classList.add('hidden');
};

adminBtn.addEventListener('click', () => {
  adminPanel.classList.remove('hidden');
  overlay.classList.remove('hidden');
});
overlay.addEventListener('click', closeAdmin);

bindAdminClose(closeAdmin);
initAdmin();
updateUI();
setTimeout(() => (window as any).feather.replace(), 100);
