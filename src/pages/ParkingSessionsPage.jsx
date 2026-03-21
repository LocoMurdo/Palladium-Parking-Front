import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { parkingService } from '../services/parkingService';

const ParkingSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [cancelSessionData, setCancelSessionData] = useState(null);
  const [closing, setClosing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [closeData, setCloseData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('1');

  useEffect(() => {
    loadOpenSessions();
    loadHistory();
  }, []);

  const loadOpenSessions = async () => {
    setLoading(true);
    try {
      const openSessions = await parkingService.getSessions();
      setSessions(Array.isArray(openSessions) ? openSessions : []);
    } catch (err) {
      console.error('Error fetching open sessions:', err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const historyRows = await parkingService.getHistory();
      setHistory(Array.isArray(historyRows) ? historyRows : []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSession) return;

    setClosing(true);
    try {
      const closeResponse = await parkingService.closeSession(
        selectedSession.sessionId,
        parseInt(paymentMethod, 10)
      );

      setCloseData(closeResponse);
      printTicket(
        selectedSession.visitorPlate,
        selectedSession.entryTime,
        closeResponse.exitTime,
        closeResponse.minutes,
        closeResponse.totalAmount
      );
      await Promise.all([loadOpenSessions(), loadHistory()]);
    } catch (err) {
      console.error('Error closing session:', err);
      alert(err.response?.data?.message || err.message || 'Error al cerrar la sesion');
    } finally {
      setClosing(false);
      setSelectedSession(null);
      setPaymentMethod('1');
    }
  };

  const handleCancelSession = async () => {
    if (!cancelSessionData) return;

    setCancelling(true);
    try {
      await parkingService.cancelSession(cancelSessionData.sessionId);
      alert('Sesion cancelada exitosamente');
      await Promise.all([loadOpenSessions(), loadHistory()]);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'No se pudo cancelar la sesion');
    } finally {
      setCancelling(false);
      setCancelSessionData(null);
    }
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

  const formatColones = (amount) => {
    const safeAmount = Number(amount || 0);
    return safeAmount.toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 2,
    });
  };

  const printTicket = (plate, entryTime, exitTime, duration, totalAmount) => {
    console.log('Printing exit ticket for plate:', plate, 'entry:', entryTime, 'exit:', exitTime, 'duration:', duration, 'total:', totalAmount);
    const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(plate)}&code=Code128&dpi=96`;
    const formattedEntryTime = formatDateTime(entryTime);
    const formattedExitTime = formatDateTime(exitTime);
    const formattedTotal = formatColones(totalAmount);
    const ticketHtml = `
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; width: 80mm; }
            .ticket { padding: 10px; text-align: center; }
            .barcode { margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h2>Ticket de Salida</h2>
            <p><strong>Placa:</strong> ${plate}</p>
            <p><strong>Hora de Entrada:</strong> ${formattedEntryTime}</p>
            <p><strong>Hora de Salida:</strong> ${formattedExitTime}</p>
            <p><strong>Duración:</strong> ${duration} min</p>
            <p><strong>Total:</strong> ${formattedTotal}</p>
            <div class="barcode">
              <img src="${barcodeUrl}" alt="Barcode" onload="window.print(); window.close();" />
            </div>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(ticketHtml);
    printWindow.document.close();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sesiones de Parqueo</h1>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Sesiones Abiertas</h2>
            <Button variant="secondary" onClick={loadOpenSessions} loading={loading}>Actualizar</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Sesion</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Placa</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Entrada</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Tarifa</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!loading && sessions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">No hay sesiones abiertas.</td>
                  </tr>
                )}

                {sessions.map((row) => (
                  <tr key={row.sessionId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-sm">{row.sessionId}</td>
                    <td className="py-3 text-sm">{row.visitorPlate}</td>
                    <td className="py-3 text-sm">{formatDateTime(row.entryTime)}</td>
                    <td className="py-3 text-sm">{row.rateId}</td>
                    <td className="py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                      <Button variant="success" size="sm" onClick={() => setSelectedSession(row)}>Cerrar</Button>
                      <Button variant="danger" size="sm" onClick={() => setCancelSessionData(row)}>Cancelar</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Historial</h2>
            <Button variant="secondary" onClick={loadHistory} loading={historyLoading}>Actualizar</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-700">ID</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Placa</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Entrada</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Salida</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Total</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {!historyLoading && history.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-500">No hay historial disponible.</td>
                  </tr>
                )}

                {history.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-sm">{row.id}</td>
                    <td className="py-3 text-sm">{row.visitorPlate}</td>
                    <td className="py-3 text-sm">{formatDateTime(row.entryTime)}</td>
                    <td className="py-3 text-sm">{formatDateTime(row.exitTime)}</td>
                    <td className="py-3 text-sm">{formatColones(row.totalAmount)}</td>
                    <td className="py-3 text-sm">{row.status === 1 ? 'Abierta' : row.status === 2 ? 'Cerrada' : 'Cancelada'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Modal
          isOpen={!!selectedSession}
          onClose={() => {
            setSelectedSession(null);
            setPaymentMethod('1');
          }}
          title="Cerrar Sesión de Parqueo"
          actions={
            <>
              <Button
                onClick={() => {
                  setSelectedSession(null);
                }}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                onClick={handleCloseSession}
                disabled={closing}
                loading={closing}
              >
                Cerrar Sesión
              </Button>
            </>
          }
        >
          {selectedSession && (
            <div className="space-y-4">
              <p className="text-gray-900 mb-4">
                ¿Estás seguro que deseas cerrar la sesión para la placa{' '}
                <strong>{selectedSession.visitorPlate}</strong>?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2" htmlFor="paymentMethod">
                  Metodo de pago
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="1">Efectivo</option>
                  <option value="2">Tarjeta</option>
                  <option value="3">SINPE</option>
                </select>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={!!closeData}
          onClose={() => setCloseData(null)}
          title="¡Sesión Cerrada!"
          actions={
            <Button onClick={() => setCloseData(null)}>Entendido</Button>
          }
        >
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-800 mb-2">
                💰 {formatColones(closeData?.totalAmount)}
              </div>
              <div className="text-sm text-green-600">
                Monto total a pagar
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-semibold text-blue-800">
                  {closeData?.minutes} min
                </div>
                <div className="text-blue-600">
                  Tiempo estacionado
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="font-semibold text-gray-800">
                  {closeData?.exitTime ? new Date(closeData.exitTime).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </div>
                <div className="text-gray-600">
                  Hora de salida
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm">
              La sesion para la placa <strong>{selectedSession?.visitorPlate}</strong> ha sido cerrada exitosamente.
            </p>
          </div>
        </Modal>

        <Modal
          isOpen={!!cancelSessionData}
          onClose={() => setCancelSessionData(null)}
          title="Cancelar Sesion"
          actions={
            <>
              <Button variant="secondary" onClick={() => setCancelSessionData(null)}>Volver</Button>
              <Button variant="danger" onClick={handleCancelSession} loading={cancelling}>Confirmar</Button>
            </>
          }
        >
          <p className="text-gray-700">
            Estas seguro de cancelar la sesion {cancelSessionData?.sessionId} para la placa {cancelSessionData?.visitorPlate}?
          </p>
        </Modal>

      </div>
    </DashboardLayout>
  );
};

export default ParkingSessionsPage;