import axios from "axios"

const JIKAN_BASE = "https://api.jikan.moe/v4"

export async function fetchImageFromJikan(
  characterName: string,
  animeName: string,
): Promise<string | null> {
  try {
    const { data } = await axios.get(
      `${JIKAN_BASE}/characters?q=${encodeURIComponent(characterName)}&limit=1`,
    )
    const img = data?.data?.[0]?.images?.jpg?.image_url
    if (img) return img
  } catch (_) {}

  try {
    const { data } = await axios.get(
      `${JIKAN_BASE}/anime?q=${encodeURIComponent(animeName)}&limit=1`,
    )
    const img = data?.data?.[0]?.images?.jpg?.large_image_url
    if (img) return img
  } catch (_) {}

  return null
}
