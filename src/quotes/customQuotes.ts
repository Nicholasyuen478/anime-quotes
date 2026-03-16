import axios from "axios";
import type { Quote } from "../types";

let cache: Quote[] | null = null;

export async function loadCustomQuotes(): Promise<Quote[]> {
  if (cache && cache.length > 0) return cache;
  
  try {
    // import.meta.env.BASE_URL automatically handles the /anime-quotes/ prefix on GitHub Pages
    // It evaluates to '/' in local dev, and '/anime-quotes/' in production.
    const url = `${import.meta.env.BASE_URL}quotes.json`;
    
    const { data } = await axios.get(url);
    
    cache = (Array.isArray(data) ? data : []).map((q: Quote) => ({
      ...q,
      source: "custom" as const,
    }));
    return cache;
  } catch (error) {
    console.error("Failed to load default quotes:", error);
    cache = null; 
    return [];
  }
}

export async function getRandomCustomQuote(): Promise<Quote | null> {
  const quotes = await loadCustomQuotes();
  if (!quotes.length) return null;
  return quotes[Math.floor(Math.random() * quotes.length)]!;
}
