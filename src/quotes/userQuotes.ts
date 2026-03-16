import type { Quote } from "../types"

const STORAGE_KEY = "userQuotes_v1"
const MAX_QUOTES = 500

export function getUserQuotes(): Quote[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

export function saveUserQuote(quote: Omit<Quote, "source">) {
  const quotes = getUserQuotes()
  quotes.unshift({ ...quote, source: "user" })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes.slice(0, MAX_QUOTES)))
}

export function clearUserQuotes() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getRandomUserQuote(): Quote | null {
  const quotes = getUserQuotes()
  if (!quotes.length) return null
  return quotes[Math.floor(Math.random() * quotes.length)]!
}

// ── Export ────────────────────────────────────────────────────────────────────
export function exportUserQuotes() {
  const quotes = getUserQuotes()
  const cleaned = quotes.map(({ content, character, anime }) => ({
    content,
    character: { name: character.name },
    anime: { name: anime.name },
    source: "custom",
  }))
  const blob = new Blob([JSON.stringify(cleaned, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `my-anime-quotes-${new Date().toISOString().split("T")[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Import ────────────────────────────────────────────────────────────────────
export async function importUserQuotes(file: File): Promise<number> {
  const text = await file.text()
  const imported: Quote[] = JSON.parse(text)
  const current = getUserQuotes()
  const merged = [
    ...imported.map((q) => ({ ...q, source: "user" as const })),
    ...current,
  ].slice(0, MAX_QUOTES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  return imported.length
}
