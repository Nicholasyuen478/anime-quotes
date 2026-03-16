import axios from "axios";
import type { Quote } from "../types";

const ANIMECHAN_BASE = "https://api.animechan.io/v1";

// Simple state to flag if we are currently rate limited
let isRateLimited = false;

export function getAnimeChanStatus(): boolean {
  return isRateLimited;
}

export async function fetchAnimeChanQuote(): Promise<Quote> {
  try {
    const { data } = await axios.get(`${ANIMECHAN_BASE}/quotes/random`);
    isRateLimited = false; // Reset flag on success
    const quote = data.data;
    return { ...quote, source: "animechan" };
  } catch (error: any) {
    if (error.response?.status === 429) {
      isRateLimited = true;
      throw new Error("RATE_LIMIT_REACHED");
    }
    throw error;
  }
}
