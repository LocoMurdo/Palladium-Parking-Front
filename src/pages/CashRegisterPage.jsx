import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { parkingService } from '../services/parkingService';

const CashRegisterPage = () => {
  const [openCashModal, setOpenCashModal] = useState(false);
  const [closeCashModal, setCloseCashModal] = useState(false);
  const [openingAmount, setOpeningAmount] = useState('0');
  const [openingCash, setOpeningCash] = useState(false);
  const [closingCash, setClosingCash] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [history, setHistory] = useState([]);
  const [expandedClosures, setExpandedClosures] = useState({});

  const formatColones = (amount) => {
    const safeAmount = Number(amount || 0);
    return safeAmount.toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 2,
    });
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return `${date.toLocaleDateString('es-CR')} ${date.toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError('');

    try {
      const closures = await parkingService.getCashClosures();
      setHistory(Array.isArray(closures) ? closures : []);
    } catch (err) {
      console.error('Error loading cash closures:', err);
      setHistory([]);
      setHistoryError('No se pudo cargar el historial de cierres por ahora.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleConfirmOpenCashRegister = async () => {
    const parsedOpeningAmount = Number(openingAmount);

    if (Number.isNaN(parsedOpeningAmount) || parsedOpeningAmount < 0) {
      alert('Ingresa un monto valido mayor o igual a 0.');
      return;
    }

    setOpeningCash(true);
    try {
      const openResult = await parkingService.openCashRegister(parsedOpeningAmount);
      alert(openResult?.message || 'Caja abierta exitosamente.');
      setOpenCashModal(false);
      setOpeningAmount('0');
    } catch (err) {
      console.error('Error opening cash register:', err);
      alert(err.response?.data?.message || err.message || 'No se pudo abrir la caja.');
    } finally {
      setOpeningCash(false);
    }
  };

  const handleConfirmCloseCashRegister = async () => {
    setClosingCash(true);
    try {
      const closeResult = await parkingService.closeCashRegister();
      alert(closeResult?.message || 'Caja cerrada exitosamente.');
      setCloseCashModal(false);
      loadHistory();
    } catch (err) {
      console.error('Error closing cash register:', err);
      alert(err.response?.data?.message || err.message || 'No se pudo cerrar la caja.');
    } finally {
      setClosingCash(false);
    }
  };

  const getClosureId = (item, index) => String(item.cashRegisterId || item.id || index);

  const toggleClosureDetails = (closureId) => {
    setExpandedClosures((prev) => ({
      ...prev,
      [closureId]: !prev[closureId],
    }));
  };

  const getBreakdownEntries = (item) => {
    const hiddenKeys = [
      'cashRegisterId',
      'id',
      'closingTime',
      'closedAt',
      'date',
      'openingAmount',
      'closingAmount',
      'totalAmount',
    ];

    return Object.entries(item || {}).filter(([key]) => !hiddenKeys.includes(key));
  };

  const formatFieldLabel = (key) => {
    if (!key) return '-';
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/^./, (char) => char.toUpperCase());
  };

  const escapeHtml = (value) => {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const formatBreakdownValue = (key, value) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    const lowerKey = String(key).toLowerCase();
    if (lowerKey.includes('amount') || lowerKey.includes('total') || lowerKey.includes('monto')) {
      const numeric = Number(value);
      if (!Number.isNaN(numeric)) {
        return formatColones(numeric);
      }
    }

    if (lowerKey.includes('time') || lowerKey.includes('date') || lowerKey.includes('fecha')) {
      return formatDateTime(value);
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const printClosureTicket = (item, index) => {
    const closureId = item.cashRegisterId || item.id || index + 1;
    const closingTime = formatDateTime(item.closingTime || item.closedAt || item.date);
    const opening = formatColones(item.openingAmount);
    const closing = formatColones(item.closingAmount || item.totalAmount);
    const breakdownRows = getBreakdownEntries(item)
      .map(([key, value]) => {
        const label = escapeHtml(formatFieldLabel(key));
        const formattedValue = escapeHtml(formatBreakdownValue(key, value));
        return `<p><strong>${label}:</strong> ${formattedValue}</p>`;
      })
      .join('');

    const ticketHtml = `
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; width: 80mm; }
            .ticket { padding: 10px; }
            .title { text-align: center; font-size: 16px; margin-bottom: 10px; }
            p { margin: 4px 0; font-size: 12px; }
            .section { margin-top: 10px; border-top: 1px dashed #999; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h2 class="title">Cierre de Caja</h2>
            <p><strong>ID:</strong> ${escapeHtml(closureId)}</p>
            <p><strong>Fecha de cierre:</strong> ${escapeHtml(closingTime)}</p>
            <p><strong>Monto apertura:</strong> ${escapeHtml(opening)}</p>
            <p><strong>Monto cierre:</strong> ${escapeHtml(closing)}</p>
            <div class="section">
              <p><strong>Desglose:</strong></p>
              ${breakdownRows || '<p>Sin datos adicionales.</p>'}
            </div>
          </div>
          <script>
            window.onload = function () {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('No se pudo abrir la ventana de impresion. Revisa el bloqueador de ventanas emergentes.');
      return;
    }

    printWindow.document.write(ticketHtml);
    printWindow.document.close();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Caja</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Abrir Caja</h2>
            <p className="text-sm text-gray-600">
              Registra el monto inicial para habilitar cobros del día.
            </p>
            <Button variant="success" onClick={() => setOpenCashModal(true)}>
              Abrir Caja
            </Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Cerrar Caja</h2>
            <p className="text-sm text-gray-600">
              Cierra la caja activa y deja el cierre disponible para historial.
            </p>
            <Button variant="danger" onClick={() => setCloseCashModal(true)}>
              Cerrar Caja
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Historial de Cierres</h2>
            <Button variant="outline" onClick={loadHistory} loading={historyLoading}>
              Actualizar
            </Button>
          </div>

          {historyError && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
              {historyError}
            </div>
          )}

          {!historyLoading && history.length === 0 && !historyError && (
            <p className="text-sm text-gray-500">No hay cierres de caja para mostrar.</p>
          )}

          {history.length > 0 && (
            <div className="space-y-3">
              {history.map((item, index) => (
                <div key={item.cashRegisterId || item.id || index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <p className="text-sm font-semibold text-gray-900">
                      Cierre #{item.cashRegisterId || item.id || index + 1}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printClosureTicket(item, index)}
                        className="text-white bg-blue-600 hover:bg-blue-700 border-blue-600"
                      >
                        Imprimir
                      </Button>
                      <button
                        type="button"
                        onClick={() => toggleClosureDetails(getClosureId(item, index))}
                        aria-label={expandedClosures[getClosureId(item, index)] ? 'Ocultar desglose' : 'Mostrar desglose'}
                        title={expandedClosures[getClosureId(item, index)] ? 'Ocultar desglose' : 'Mostrar desglose'}
                        className="inline-flex items-center justify-center text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-0"
                        style={{
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          background: 'transparent',
                          border: 'none',
                          boxShadow: 'none',
                          padding: 0,
                          margin: 0,
                          lineHeight: 1,
                        }}
                      >
                        {expandedClosures[getClosureId(item, index)] ? (
                          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M7.23 5.21a.75.75 0 0 1 1.06.02l4.25 4.5a.75.75 0 0 1 0 1.04l-4.25 4.5a.75.75 0 1 1-1.08-1.04L10.46 10 7.21 6.27a.75.75 0 0 1 .02-1.06Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-700">
                      <strong>ID:</strong> {item.cashRegisterId || item.id || '-'}
                    </p>
                    <p className="text-gray-700">
                      <strong>Fecha de cierre:</strong> {formatDateTime(item.closingTime || item.closedAt || item.date)}
                    </p>
                    <p className="text-gray-700">
                      <strong>Monto apertura:</strong> {formatColones(item.openingAmount)}
                    </p>
                    <p className="text-gray-700">
                      <strong>Monto cierre:</strong> {formatColones(item.closingAmount || item.totalAmount)}
                    </p>
                  </div>

                  {expandedClosures[getClosureId(item, index)] && (
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <p className="text-sm font-semibold text-gray-800 mb-2">Desglose del cierre</p>

                      {getBreakdownEntries(item).length === 0 ? (
                        <p className="text-sm text-gray-500">No hay más campos de desglose en este cierre.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {getBreakdownEntries(item).map(([key, value]) => {
                            const parsedValue = typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value ?? '-');

                            return (
                              <p key={key} className="text-gray-700 break-words">
                                <strong>{key}:</strong> {parsedValue}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal
          isOpen={openCashModal}
          onClose={() => {
            setOpenCashModal(false);
            setOpeningAmount('0');
          }}
          title="Abrir Caja"
          actions={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setOpenCashModal(false);
                  setOpeningAmount('0');
                }}
                disabled={openingCash}
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                onClick={handleConfirmOpenCashRegister}
                loading={openingCash}
              >
                Confirmar
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900" htmlFor="openingAmount">
              Monto de apertura
            </label>
            <input
              id="openingAmount"
              type="number"
              min="0"
              step="0.01"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="0"
            />
          </div>
        </Modal>

        <Modal
          isOpen={closeCashModal}
          onClose={() => setCloseCashModal(false)}
          title="Cerrar Caja"
          actions={
            <>
              <Button variant="secondary" onClick={() => setCloseCashModal(false)} disabled={closingCash}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleConfirmCloseCashRegister} loading={closingCash}>
                Confirmar Cierre
              </Button>
            </>
          }
        >
          <p className="text-gray-700">
            ¿Deseas cerrar la caja actual? Esta acción registrará el cierre para historial.
          </p>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default CashRegisterPage;
