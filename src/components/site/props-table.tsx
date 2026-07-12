import type { PropsTable } from "@/lib/props"

/**
 * The Props reference on a component page. Tables scroll horizontally inside
 * their own container on narrow screens — the page never scrolls sideways.
 */
export function PropsTables({ tables }: { tables: PropsTable[] }) {
  if (tables.length === 0) return null

  return (
    <section className="mt-14">
      <h2 className="text-lg font-semibold tracking-tight">Props</h2>

      {tables.map((table) => (
        <div key={table.title} className="mt-5">
          {tables.length > 1 && (
            <h3 className="mb-2 font-mono text-sm text-foreground">
              {`<${table.title} />`}
            </h3>
          )}

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Prop</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Default</th>
                  <th className="px-4 py-2.5 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 align-top font-mono text-[13px] text-foreground">
                      {row.name}
                      {row.required && (
                        <span className="text-destructive" title="Required">
                          *
                        </span>
                      )}
                    </td>
                    <td className="max-w-72 px-4 py-2.5 align-top font-mono text-[13px] text-muted-foreground">
                      {row.type}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 align-top font-mono text-[13px] text-muted-foreground">
                      {row.default ?? "—"}
                    </td>
                    <td className="min-w-56 px-4 py-2.5 align-top text-[13px] leading-relaxed text-muted-foreground">
                      {row.description ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {table.extendsText && (
            <p className="mt-2 text-xs text-muted-foreground">
              Also accepts all{" "}
              <code className="font-mono">{table.extendsText}</code> props.
            </p>
          )}
        </div>
      ))}
    </section>
  )
}
