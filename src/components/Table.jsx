import React from 'react';

const Table = ({ headers, data, actions, loading = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full bg-white">
        <thead>
          <tr className="bg-slate-100/80 border-b border-slate-200">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((row, index) => {
            return (
              <tr key={index} className="hover:bg-blue-50/60 transition-colors duration-150">
                {headers.map((header, i) => {
                  // Map display headers to object properties
                  const fieldMap = {
                    'Session ID': 'sessionId',
                    'Visitor Plate': 'visitorPlate',
                    'Entry Time': 'entryTime',
                    'Rate ID': 'rateId'
                  };
                  
                  const fieldName = fieldMap[header] || header.toLowerCase().replace(/\s+/g, '');
                  let value = row[fieldName] || '-';
                  
                  // Format entry time to show only hours and minutes
                  if (fieldName === 'entryTime' && value !== '-') {
                    try {
                      const date = new Date(value);
                      value = date.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                    } catch (error) {
                      console.warn('Error formatting entry time:', error);
                    }
                  }
                  
                  return (
                    <td
                      key={i}
                      className="px-6 py-4 whitespace-nowrap text-sm text-slate-800"
                    >
                      {value}
                    </td>
                  );
                })}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {actions(row)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;