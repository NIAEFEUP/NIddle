import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name?: string | null, fallback = "A"): string {
  if (!name || !name.trim()) return fallback;
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("");
  return (letters || fallback).slice(0, 2).toUpperCase();
}
