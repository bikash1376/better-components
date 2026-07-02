/**
 * Single source of truth for the registry's public URL.
 *
 * Change domains by setting NEXT_PUBLIC_REGISTRY_URL (in Vercel + .env) — every
 * install command and doc example is derived from it, so nothing else changes.
 */
export const REGISTRY_URL = (
  process.env.NEXT_PUBLIC_REGISTRY_URL ??
  "https://better-components-alpha.vercel.app"
).replace(/\/$/, "")

/** The registry namespace (for the shadcn `components.json` `registries` map). */
export const REGISTRY_NAMESPACE = "@bettercomp"

/** Zero-config install command for a component (works without any setup). */
export function installCommand(slug: string) {
  return `npx shadcn@latest add ${REGISTRY_URL}/r/${slug}.json`
}
