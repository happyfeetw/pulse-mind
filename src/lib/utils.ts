// Utility functions

// Generate URL-safe slug from string
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format date short
export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Calculate reading time (minutes)
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

// Category mapping
export const categories = [
  { value: "ai", label: "AI/ML", icon: "🤖" },
  { value: "backend", label: "后端", icon: "⚙️" },
  { value: "frontend", label: "前端", icon: "🎨" },
] as const;

export type CategoryValue = (typeof categories)[number]["value"];

// Get category info
export function getCategoryInfo(value: string) {
  return categories.find((c) => c.value === value) || categories[0];
}
