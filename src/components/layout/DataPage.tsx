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
    <section className="p-6">
      <p className="text-sm font-medium text-[#236b4a]">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66736b]">{description}</p>
      <div className="mt-6 overflow-hidden rounded-lg border border-[#dbe3dc] bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-[#eef4ef] text-[#334139]">
            <tr>
              {columns.map((column) => (
                <th className="px-4 py-3 font-semibold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-[#dbe3dc]" key={row.join('-')}>
                {row.map((cell) => (
                  <td className="px-4 py-3 text-[#334139]" key={cell}>
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
