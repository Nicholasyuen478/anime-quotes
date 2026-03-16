import { fetchImageFromAniList } from "./anilist"
import { fetchImageFromJikan } from "./jikan"

export async function fetchImage(
  characterName: string,
  animeName: string,
): Promise<string | null> {
  const anilist = await fetchImageFromAniList(characterName, animeName)
  if (anilist) return anilist
  return fetchImageFromJikan(characterName, animeName)
}
