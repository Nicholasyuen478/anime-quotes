import axios from "axios"

const ANILIST_API = "https://graphql.anilist.co"

const CHARACTER_QUERY = `
query ($name: String) {
  Character(search: $name) {
    name { full }
    image { large }
  }
}`

const ANIME_QUERY = `
query ($name: String) {
  Media(search: $name, type: ANIME) {
    title { romaji english native }
    coverImage { extraLarge }
  }
}`

async function query(gql: string, variables: object): Promise<any> {
  const { data } = await axios.post(ANILIST_API, { query: gql, variables })
  if (data.errors) throw new Error(data.errors[0].message)
  return data.data
}

export async function fetchImageFromAniList(
  characterName: string,
  animeName: string,
): Promise<string | null> {
  try {
    const data = await query(CHARACTER_QUERY, { name: characterName })
    const img = data?.Character?.image?.large
    if (img) return img
  } catch (_) {}

  try {
    const data = await query(ANIME_QUERY, { name: animeName })
    const img = data?.Media?.coverImage?.extraLarge
    if (img) return img
  } catch (_) {}

  return null
}
