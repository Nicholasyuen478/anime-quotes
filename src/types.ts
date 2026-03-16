export interface Quote {
  content: string
  character: { id?: number; name: string }
  anime: { id?: number; name: string; altName?: string }
  source?: "animechan" | "custom" | "user"
}
