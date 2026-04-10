import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { parkingService } from '../services/parkingService';
import { useTodayIncome } from '../hooks/useTodayIncome';

const CashRegisterPage = () => {
  const { refreshTodayIncome } = useTodayIncome();
  const [openCashModal, setOpenCashModal] = useState(false);
  const [closeCashModal, setCloseCashModal] = useState(false);
  const [openingAmount, setOpeningAmount] = useState('0');
  const [openingCash, setOpeningCash] = useState(false);
  const [closingCash, setClosingCash] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [history, setHistory] = useState([]);
  const [expandedClosures, setExpandedClosures] = useState({});
  const [closeResult, setCloseResult] = useState(null);

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
    if (Number.isNaN(date.getTime())) return value;
    return `${date.toLocaleDateString('es-CR')} ${date.toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const escapeHtml = (value) => {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
      refreshTodayIncome();
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
      const result = await parkingService.closeCashRegister();
      const data = result?.data || result;
      setCloseResult(data);
      setCloseCashModal(false);
      loadHistory();
      refreshTodayIncome();
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

  const renderBreakdown = (item) => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-xl font-bold text-green-800 mb-0.5">
          💰 {formatColones(item.total || item.closingAmount)}
        </div>
        <div className="text-xs text-green-600">Monto total de cierre</div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-blue-800">Parking</span>
          <span className="text-sm font-bold text-blue-800">{item.parkingSessionCount ?? 0} vehículos</span>
        </div>
        <div className="flex justify-between text-xs text-blue-700">
          <span>Subtotal</span><span className="font-semibold">{formatColones(item.parkingSessionTotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-blue-600">
          <span>Efectivo</span><span>{formatColones(item.parkingCash)}</span>
        </div>
        <div className="flex justify-between text-xs text-blue-600">
          <span>Tarjeta</span><span>{formatColones(item.parkingCard)}</span>
        </div>
        <div className="flex justify-between text-xs text-blue-600">
          <span>Sinpe</span><span>{formatColones(item.parkingSinpe)}</span>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-purple-800">Suscripciones</span>
          <span className="text-sm font-bold text-purple-800">{item.subscriptionCount ?? 0} cobradas</span>
        </div>
        <div className="flex justify-between text-xs text-purple-700">
          <span>Subtotal</span><span className="font-semibold">{formatColones(item.subscriptionTotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-purple-600">
          <span>Efectivo</span><span>{formatColones(item.subscriptionCash)}</span>
        </div>
        <div className="flex justify-between text-xs text-purple-600">
          <span>Tarjeta</span><span>{formatColones(item.subscriptionCard)}</span>
        </div>
        <div className="flex justify-between text-xs text-purple-600">
          <span>Sinpe</span><span>{formatColones(item.subscriptionSinpe)}</span>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
        <p className="text-sm font-semibold text-gray-800">Totales por Método de Pago</p>
        <div className="flex justify-between text-xs text-gray-700">
          <span>Total Efectivo</span><span className="font-semibold">{formatColones(item.totalCash)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-700">
          <span>Total Tarjeta</span><span className="font-semibold">{formatColones(item.totalCard)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-700">
          <span>Total Sinpe</span><span className="font-semibold">{formatColones(item.totalSinpe)}</span>
        </div>
      </div>

      {item.openingAmount != null && (
        <div className="text-sm text-gray-600 text-center">
          Monto apertura: <b>{formatColones(item.openingAmount)}</b>
        </div>
      )}
    </div>
  );

  const printClosureTicket = (item) => {
    const closureId = escapeHtml(item.cashRegisterId || item.id || '-');
    const closingTime = escapeHtml(formatDateTime(item.closedAt || item.closingTime));
    const fc = (v) => escapeHtml(formatColones(v));

    const ticketHtml = `
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; width: 80mm; }
            .ticket { padding: 10px; }
            .title { text-align: center; font-size: 16px; margin-bottom: 6px; }
            .subtitle { text-align: center; font-size: 12px; margin-bottom: 10px; color: #555; }
            p { margin: 3px 0; font-size: 12px; }
            .row { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; }
            .section { margin-top: 8px; border-top: 1px dashed #999; padding-top: 6px; }
            .section-title { font-weight: bold; font-size: 12px; margin-bottom: 4px; }
            .total-line { font-size: 14px; font-weight: bold; text-align: center; margin: 10px 0; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 6px 0; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h2 class="title">CIERRE DE CAJA #${closureId}</h2>
            <p class="subtitle">Fecha: ${closingTime}</p>
            <p>Monto apertura: ${fc(item.openingAmount)}</p>

            <div class="section">
              <p class="section-title">--- PARKING ---</p>
              <p>Cantidad: ${escapeHtml(item.parkingSessionCount ?? 0)}</p>
              <div class="row"><span>Efectivo:</span><span>${fc(item.parkingCash)}</span></div>
              <div class="row"><span>Tarjeta:</span><span>${fc(item.parkingCard)}</span></div>
              <div class="row"><span>Sinpe:</span><span>${fc(item.parkingSinpe)}</span></div>
              <div class="row"><span><strong>Subtotal:</strong></span><span><strong>${fc(item.parkingSessionTotal)}</strong></span></div>
            </div>

            <div class="section">
              <p class="section-title">--- SUSCRIPCIONES ---</p>
              <p>Cantidad: ${escapeHtml(item.subscriptionCount ?? 0)}</p>
              <div class="row"><span>Efectivo:</span><span>${fc(item.subscriptionCash)}</span></div>
              <div class="row"><span>Tarjeta:</span><span>${fc(item.subscriptionCard)}</span></div>
              <div class="row"><span>Sinpe:</span><span>${fc(item.subscriptionSinpe)}</span></div>
              <div class="row"><span><strong>Subtotal:</strong></span><span><strong>${fc(item.subscriptionTotal)}</strong></span></div>
            </div>

            <div class="section">
              <p class="section-title">--- TOTALES ---</p>
              <div class="row"><span>Total Efectivo:</span><span>${fc(item.totalCash)}</span></div>
              <div class="row"><span>Total Tarjeta:</span><span>${fc(item.totalCard)}</span></div>
              <div class="row"><span>Total Sinpe:</span><span>${fc(item.totalSinpe)}</span></div>
            </div>

            <p class="total-line">TOTAL: ${fc(item.total || item.closingAmount)}</p>
          </div>
          <script>
            window.onload = function () {
              window.print();
              window.close();
            };
          <\/script>
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

        {/* History */}
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
              {history.map((item, index) => {
                const cid = getClosureId(item, index);
                return (
                  <div key={cid} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <p className="text-sm font-semibold text-gray-900">
                        Cierre #{item.cashRegisterId || item.id || index + 1}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printClosureTicket(item)}
                          className="text-white bg-blue-600 hover:bg-blue-700 border-blue-600"
                        >
                          Reimprimir
                        </Button>
                        <button
                          type="button"
                          onClick={() => toggleClosureDetails(cid)}
                          aria-label={expandedClosures[cid] ? 'Ocultar desglose' : 'Mostrar desglose'}
                          title={expandedClosures[cid] ? 'Ocultar desglose' : 'Mostrar desglose'}
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
                          {expandedClosures[cid] ? (
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
                        <strong>Apertura:</strong> {formatDateTime(item.openedAt)}
                      </p>
                      <p className="text-gray-700">
                        <strong>Cierre:</strong> {formatDateTime(item.closedAt || item.closingTime)}
                      </p>
                      <p className="text-gray-700">
                        <strong>Monto apertura:</strong> {formatColones(item.openingAmount)}
                      </p>
                      <p className="text-gray-700">
                        <strong>Total:</strong> {formatColones(item.closingAmount || item.total)}
                      </p>
                    </div>

                    {expandedClosures[cid] && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        {renderBreakdown(item)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Open Cash Modal */}
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

        {/* Close Cash Confirmation Modal */}
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

        {/* Close Result Modal */}
        <Modal
          isOpen={!!closeResult}
          onClose={() => setCloseResult(null)}
          title="Caja Cerrada Exitosamente"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => printClosureTicket(closeResult)}>
                Imprimir
              </Button>
              <Button onClick={() => setCloseResult(null)}>Entendido</Button>
            </div>
          }
        >
          {closeResult && renderBreakdown(closeResult)}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default CashRegisterPage;
