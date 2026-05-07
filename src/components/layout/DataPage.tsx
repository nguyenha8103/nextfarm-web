export function DataPage({
  eyebrow,
  title,
  description,
  columns,
  rows,
}: {
  eyebrow: string;
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <section className="px-6 py-8">
      <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200/60 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-600">
            <tr>
              {columns.map((column) => (
                <th className="px-4 py-3 font-medium" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-slate-200/60 transition-colors hover:bg-slate-50" key={row.join('-')}>
                {row.map((cell) => (
                  <td className="px-4 py-3 text-slate-700" key={cell}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
