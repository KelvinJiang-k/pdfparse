import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  // client
  if (typeof window !== 'undefined') return path
  // server AND deployed on vercel
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`
  // server and localhost
  return `http://localhost:${process.env.PORT ?? 3000}${path}`
}
