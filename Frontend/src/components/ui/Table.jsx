import clsx from 'clsx';

export default function Table({ columns, data, keyExtractor, className }) {
  return (
    <div className={clsx("overflow-x-auto bg-white rounded-xl shadow-sm border border-[#EEEEEE]", className)}>
      <table className="min-w-full divide-y divide-[#EEEEEE]">
        <thead className="bg-[#F8F6F2]">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={col.key || idx} 
                className={clsx(
                  "px-6 py-4 text-left text-xs font-semibold text-[#717378] uppercase tracking-wider",
                  col.className
                )}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEEEEE] bg-white">
          {data?.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={keyExtractor ? keyExtractor(row) : rowIndex} className="hover:bg-[#FBF9FB] transition-colors">
                {columns.map((col, colIndex) => (
                  <td 
                    key={col.key || colIndex} 
                    className={clsx("px-6 py-4 whitespace-nowrap text-sm text-[#1A2B44]", col.cellClassName)}
                  >
                    {col.render ? col.render(row) : row[col.dataIndex]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-[#717378] text-sm">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
