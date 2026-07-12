/**
 * Extracts prop tables from a component's source at render time, so the docs
 * can never drift from the code. It reads every `interface <X>Props` block —
 * the JSDoc comment above each prop becomes its description, and defaults are
 * picked up from the component's destructuring (`{ size = 40 }: XProps`).
 *
 * Deliberately regex-based and tolerant: if a shape it doesn't understand
 * appears, the prop is skipped rather than the page breaking.
 */

export interface PropRow {
  name: string
  type: string
  required: boolean
  default?: string
  description?: string
}

export interface PropsTable {
  /** Component name the interface documents (interface name minus "Props"). */
  title: string
  /** Heritage clause, when the interface extends other types. */
  extendsText?: string
  rows: PropRow[]
}

/** Index of the brace that closes the one at `openIndex`, or -1. */
function matchBrace(text: string, openIndex: number) {
  let depth = 0
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === "{") depth++
    else if (text[i] === "}" && --depth === 0) return i
  }
  return -1
}

/** Nesting delta of brackets that can make a type span multiple lines. */
function bracketDelta(line: string) {
  let delta = 0
  for (const ch of line) {
    if (ch === "(" || ch === "[" || ch === "{" || ch === "<") delta++
    if (ch === ")" || ch === "]" || ch === "}" || ch === ">") delta--
  }
  return delta
}

function parseBody(body: string): PropRow[] {
  const rows: PropRow[] = []
  const lines = body.split("\n")
  let doc: string[] = []
  let inDoc = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (inDoc) {
      doc.push(line.replace(/^\*+\s?/, "").replace(/\*+\/$/, "").trim())
      if (line.endsWith("*/")) inDoc = false
      continue
    }
    if (line.startsWith("/**")) {
      const oneLine = line.match(/^\/\*\*\s*(.*?)\s*\*\/$/)
      if (oneLine) {
        doc = [oneLine[1]]
      } else {
        doc = [line.replace(/^\/\*\*\s?/, "").trim()]
        inDoc = true
      }
      continue
    }
    if (line.startsWith("//") || line === "") continue

    const prop = line.match(/^(?:readonly\s+)?(\w+)(\?)?:\s*(.+?);?$/)
    if (!prop) {
      doc = []
      continue
    }

    // A type can spill onto the next lines (unions, function params) — keep
    // appending until the brackets it opened are balanced again.
    let type = prop[3]
    let depth = bracketDelta(type)
    while (depth > 0 && i + 1 < lines.length) {
      const next = lines[++i].trim()
      type += ` ${next}`
      depth += bracketDelta(next)
    }

    rows.push({
      name: prop[1],
      required: !prop[2],
      type: type.replace(/;$/, "").trim(),
      description: doc.filter(Boolean).join(" ") || undefined,
    })
    doc = []
  }
  return rows
}

/**
 * Defaults come from the destructuring pattern annotated with the interface,
 * e.g. `({ seed, size = 40, round = true }: AvatarProps)`.
 */
function extractDefaults(source: string, interfaceName: string) {
  const defaults = new Map<string, string>()
  const anchor = source.indexOf(`}: ${interfaceName})`)
  if (anchor === -1) return defaults

  // Walk back from the closing brace to its opener.
  let depth = 0
  let start = -1
  for (let i = anchor; i >= 0; i--) {
    if (source[i] === "}") depth++
    else if (source[i] === "{" && --depth === 0) {
      start = i
      break
    }
  }
  if (start === -1) return defaults

  // Split the pattern on top-level commas; `a = ["x", "y"]` stays whole.
  const inner = source.slice(start + 1, anchor)
  let piece = ""
  let nest = 0
  const pieces: string[] = []
  for (const ch of inner) {
    if ("([{".includes(ch)) nest++
    if (")]}".includes(ch)) nest--
    if (ch === "," && nest === 0) {
      pieces.push(piece)
      piece = ""
    } else {
      piece += ch
    }
  }
  pieces.push(piece)

  for (const p of pieces) {
    const m = p.trim().match(/^(\w+)\s*=\s*([\s\S]+)$/)
    if (m) defaults.set(m[1], m[2].trim())
  }
  return defaults
}

export function extractPropsTables(source: string): PropsTable[] {
  const tables: PropsTable[] = []
  const re = /(?:export\s+)?interface\s+(\w+)Props\b/g

  for (let m = re.exec(source); m; m = re.exec(source)) {
    const open = source.indexOf("{", m.index + m[0].length)
    if (open === -1) continue
    const close = matchBrace(source, open)
    if (close === -1) continue

    const heritage = source
      .slice(m.index + m[0].length, open)
      .replace(/\s+/g, " ")
      .trim()
    const extendsText = heritage.startsWith("extends")
      ? heritage.replace(/^extends\s+/, "")
      : undefined

    const rows = parseBody(source.slice(open + 1, close))
    const defaults = extractDefaults(source, `${m[1]}Props`)
    for (const row of rows) {
      const d = defaults.get(row.name)
      if (d) row.default = d
    }

    if (rows.length > 0) tables.push({ title: m[1], extendsText, rows })
  }
  return tables
}
