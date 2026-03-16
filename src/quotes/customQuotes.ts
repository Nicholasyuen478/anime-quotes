import axios from "axios"
import type { Quote } from "../types"

let cache: Quote[] | null = null

export async function loadCustomQuotes(): Promise<Quote[]> {
  if (cache) return cache
  try {
    const { data } = await axios.get("./src/assets/quotes.json")
    cache = (Array.isArray(data) ? data : []).map((q: Quote) => ({
      ...q,
      source: "custom" as const,
    }))
    return cache
  } catch {
    return []
  }
}

export async function getRandomCustomQuote(): Promise<Quote | null> {
  const quotes = await loadCustomQuotes()
  if (!quotes.length) return null
  return quotes[Math.floor(Math.random() * quotes.length)]!
}
