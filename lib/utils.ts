import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDeterministicId(prefix: string, seed: string): string {
  let hash = 0
  const cleanSeed = seed || ''
  for (let i = 0; i < cleanSeed.length; i++) {
    hash = (hash << 5) - hash + cleanSeed.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return `${prefix}-${Math.abs(hash)}`
}
