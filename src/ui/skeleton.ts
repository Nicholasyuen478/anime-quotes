const skeleton = document.getElementById("skeleton") as HTMLElement

export function showSkeleton() {
  skeleton.classList.remove("hidden")
}
export function hideSkeleton() {
  skeleton.classList.add("hidden")
}
