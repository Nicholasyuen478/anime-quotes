import type { Quote } from "../types"

const card = document.getElementById("card") as HTMLElement
const quoteText = document.getElementById("quote-text") as HTMLElement
const charName = document.getElementById("char-name") as HTMLElement
const animeNameEl = document.getElementById("anime-name") as HTMLElement
const sourceTag = document.getElementById("source-tag") as HTMLElement
const charImg = document.getElementById("char-img") as HTMLImageElement
const imgPlaceholder = document.getElementById("img-placeholder") as HTMLElement

const SOURCE_LABELS: Record<string, string> = {
  animechan: "🌐 AnimeChan",
  custom: "📁 My Quotes",
  user: "✍️ My Quotes",
}

export function showCard() {
  card.classList.remove("hidden")
  card.classList.remove("pop")
  void card.offsetWidth
  card.classList.add("pop")
}

export function hideCard() {
  card.classList.add("hidden")
}

export function renderQuote(quote: Quote, imgUrl: string | null) {
  quoteText.textContent = `"${quote.content}"`
  charName.textContent = quote.character?.name ?? "Unknown"
  animeNameEl.textContent = quote.anime?.name ?? "Unknown"
  sourceTag.textContent = SOURCE_LABELS[quote.source ?? "animechan"] ?? ""

  charImg.style.opacity = "0"

  if (imgUrl) {
    charImg.src = imgUrl
    charImg.alt = `${quote.character?.name} from ${quote.anime?.name}`
    charImg.onload = () => {
      const ar = charImg.naturalWidth / charImg.naturalHeight
      charImg.style.objectFit = ar > 1 ? "cover" : "contain"
      charImg.style.opacity = "1"
      charImg.classList.remove("hidden")
      imgPlaceholder.classList.add("hidden")
    }
    charImg.onerror = () => {
      charImg.classList.add("hidden")
      imgPlaceholder.classList.remove("hidden")
    }
  } else {
    charImg.classList.add("hidden")
    imgPlaceholder.classList.remove("hidden")
  }
}
