export default function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: j === 0 ? "60%" : "80%" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
