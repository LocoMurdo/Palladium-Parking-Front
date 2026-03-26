  // Formato de fecha igual que en ParkingSessionsPage
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
import React, { useCallback, useEffect, useState } from 'react';
import axiosClient from '../api/axios';
import Modal from '../components/Modal';
import DashboardLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { subscriptionService } from '../services/subscriptionService s';

const SubscriptionsPage = () => {
  const [form, setForm] = useState({
    licensePlate: '',
    carModel: '',
    vehicleType: '1',
    plan: '3',
  });
  const [subscriptions, setSubscriptions] = useState([]);
  const [cancelModal, setCancelModal] = useState({ open: false, data: null });
  const [prices, setPrices] = useState([]);
  const [closeModal, setCloseModal] = useState({ open: false, data: null });
  const [confirmCloseModal, setConfirmCloseModal] = useState({ open: false, data: null });
  // Cerrar membresía
  // Lanza el modal de confirmación antes de cerrar membresía
  const handleCloseMembership = (id) => {
    // Buscar la suscripción a cerrar para mostrar info
    const sub = subscriptions.find((s) => (s.id || s.subscriptionId) === id);
    if (!sub) return;
    setConfirmCloseModal({ open: true, data: sub });
  };

  // Confirma y ejecuta el cierre de membresía
  const confirmCloseMembership = async () => {
    const id = confirmCloseModal.data?.id || confirmCloseModal.data?.subscriptionId;
    try {
      const response = await axiosClient.post(`/subscriptions/${id}/close`);
      const result = response.data?.data || response.data;
      setCloseModal({ open: true, data: result });
      loadSubscriptions(activeOnly);
    } catch (err) {
      setCloseModal({ open: true, data: { error: err.response?.data?.message || err.message || 'No se pudo cerrar la membresía' } });
    } finally {
      setConfirmCloseModal({ open: false, data: null });
    }
  };

  // Imprimir factura de cierre de membresía (mejorada)
  const printCloseMembership = (info) => {
    const planLabel = info.plan === 'Daily' ? 'Diario' : info.plan === 'Biweekly' ? 'Quincena' : info.plan === 'Monthly' ? 'Mensual' : info.plan;
    const formattedAmount = info.amount != null ? Number(info.amount).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' }) : '-';
    const ticketHtml = `
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; width: 80mm; }
            .ticket { padding: 10px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h2>Factura de Cierre de Membresía</h2>
            <p><strong>Plan:</strong> ${planLabel}</p>
            <p><strong>Monto pagado:</strong> ${formattedAmount}</p>
            <p><strong>Mensaje:</strong> ${info.message || '-'}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CR')}</p>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(ticketHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  const [loading, setLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [checkPlate, setCheckPlate] = useState('');
  const [checkResult, setCheckResult] = useState(null);

  const loadSubscriptions = useCallback(async (onlyActive = activeOnly) => {
    setLoading(true);
    try {
      const data = onlyActive
        ? await subscriptionService.getActiveSubscriptions()
        : await subscriptionService.getSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  const loadPrices = useCallback(async () => {
    try {
      const data = await subscriptionService.getPrices();
      setPrices(data);
    } catch {
      setPrices([]);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions(false);
    loadPrices();
  }, [loadSubscriptions, loadPrices]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await subscriptionService.createSubscription({
        ...form,
        vehicleType: Number(form.vehicleType),
        plan: Number(form.plan),
        licensePlate: form.licensePlate.toUpperCase(),
      });

      setForm({ licensePlate: '', carModel: '', vehicleType: '1', plan: '3' });
      loadSubscriptions(activeOnly);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'No se pudo crear la suscripcion');
    }
  };

  const handleCancel = async (id) => {
    // Buscar la suscripción a cancelar para mostrar info
    const sub = subscriptions.find((s) => (s.id || s.subscriptionId) === id);
    if (!sub) return;
    setCancelModal({ open: true, data: sub });
  };

  const confirmCancel = async () => {
    const id = cancelModal.data?.id || cancelModal.data?.subscriptionId;
    try {
      // Llama al backend y espera respuesta con info de cancelación
      const result = await subscriptionService.cancelSubscription(id);
      setCancelModal((prev) => ({ ...prev, result: result.data }));
      loadSubscriptions(activeOnly);
      // Imprimir ticket si hay info
      if (result.data) {
        printCancelTicket({
          ...cancelModal.data,
          ...result.data,
        });
      }
    } catch (err) {
      setCancelModal({ open: false, data: null, error: err.response?.data?.message || err.message || 'No se pudo cancelar la suscripcion' });
    }
  };

  // Imprimir ticket de cancelación de suscripción (mejorada)
  const printCancelTicket = (info) => {
    const planLabel = info.plan === 'Daily' ? 'Diario' : info.plan === 'Biweekly' ? 'Quincena' : info.plan === 'Monthly' ? 'Mensual' : info.plan;
    const formattedStart = info.startDate ? new Date(info.startDate).toLocaleString('es-CR') : '-';
    const formattedEnd = info.endDate ? new Date(info.endDate).toLocaleString('es-CR') : '-';
    const formattedCancel = info.cancelDate ? new Date(info.cancelDate).toLocaleString('es-CR') : new Date().toLocaleString('es-CR');
    const formattedAmount = info.amount != null ? Number(info.amount).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' }) : '-';
    const duration = info.startDate && info.endDate ? Math.round((new Date(info.endDate) - new Date(info.startDate)) / (1000 * 60 * 60 * 24)) : '-';
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
            <h2>Cancelación de Suscripción</h2>
            <p><strong>Placa:</strong> ${info.licensePlate || '-'}</p>
            <p><strong>Plan:</strong> ${planLabel}</p>
            <p><strong>Inicio:</strong> ${formattedStart}</p>
            <p><strong>Fin:</strong> ${formattedEnd}</p>
            <p><strong>Duración:</strong> ${duration !== '-' ? duration + ' días' : '-'}</p>
            <p><strong>Monto:</strong> ${formattedAmount}</p>
            <p><strong>Fecha de cancelación:</strong> ${formattedCancel}</p>
            <div class="barcode">
              <img src="https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(info.licensePlate || '')}&code=Code128&dpi=96" alt="Barcode" onload="window.print(); window.close();" />
            </div>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(ticketHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleCheck = async () => {
    if (!checkPlate) return;
    try {
      const result = await subscriptionService.checkPlate(checkPlate.toUpperCase());
      setCheckResult(result.data || null);
    } catch (err) {
      setCheckResult({ hasActiveSubscription: false, error: err.message });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Suscripciones</h1>

        <form onSubmit={handleCreate} className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={form.licensePlate}
            onChange={(e) => setForm((prev) => ({ ...prev, licensePlate: e.target.value }))}
            placeholder="Placa"
            required
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            value={form.carModel}
            onChange={(e) => setForm((prev) => ({ ...prev, carModel: e.target.value }))}
            placeholder="Modelo"
            required
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={form.vehicleType}
            onChange={(e) => setForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="1">Carro</option>
            <option value="2">Moto</option>
          </select>
          <select
            value={form.plan}
            onChange={(e) => setForm((prev) => ({ ...prev, plan: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="1">Diario</option>
            <option value="2">Quincena</option>
            <option value="3">Mensual</option>
          </select>
          <Button type="submit" className="md:col-span-4">Crear Suscripcion</Button>
        </form>

        <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 space-y-3">
          <h2 className="font-semibold text-gray-900">Verificar Placa</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={checkPlate}
              onChange={(e) => setCheckPlate(e.target.value)}
              placeholder="ABC123"
              className="px-3 py-2 border border-gray-300 rounded-lg w-full"
            />
            <Button variant="info" onClick={handleCheck}>Verificar</Button>
          </div>
          {checkResult && (
            <div className="text-sm text-gray-700">
              {checkResult.hasActiveSubscription
                ? `Activa: plan ${checkResult.plan} hasta ${checkResult.endDate}`
                : 'No tiene suscripcion activa'}
            </div>
          )}
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h2 className="font-semibold text-gray-900">Listado</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const next = !activeOnly;
                  setActiveOnly(next);
                  loadSubscriptions(next);
                }}
              >
                {activeOnly ? 'Ver todas' : 'Solo activas'}
              </Button>
              <Button variant="secondary" onClick={() => loadSubscriptions(activeOnly)} loading={loading}>Actualizar</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">ID</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Placa</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Plan</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Precio</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Fin</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!loading && subscriptions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-500">No hay suscripciones.</td>
                  </tr>
                )}
                {subscriptions.map((sub) => (
                  <tr key={sub.id || sub.subscriptionId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-sm">{sub.id || sub.subscriptionId}</td>
                    <td className="py-3 text-sm">{sub.licensePlate}</td>
                    <td className="py-3 text-sm">{
                      sub.plan === 'Daily' ? 'Diario' :
                      sub.plan === 'Biweekly' ? 'Quincena' :
                      sub.plan === 'Monthly' ? 'Mensual' : sub.plan
                    }</td>
                    <td className="py-3 text-sm">{Number(sub.price || 0).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}</td>
                    <td className="py-3 text-sm">{formatDateTime(sub.endDate)}</td>
                    <td className="py-3 text-sm flex gap-2">
                      <Button size="sm" variant="danger" onClick={() => handleCancel(sub.id || sub.subscriptionId)}>Cancelar</Button>
                      <Button size="sm" variant="success" onClick={() => handleCloseMembership(sub.id || sub.subscriptionId)}>Cerrar Membresía</Button>
                          {/* Modal de confirmación de cierre de membresía */}
                          <Modal
                            isOpen={confirmCloseModal.open}
                            onClose={() => setConfirmCloseModal({ open: false, data: null })}
                            title="Confirmar cierre de membresía"
                            actions={
                              <>
                                <Button variant="secondary" onClick={() => setConfirmCloseModal({ open: false, data: null })}>No cerrar</Button>
                                <Button variant="danger" onClick={confirmCloseMembership}>Sí, cerrar</Button>
                              </>
                            }
                          >
                            {confirmCloseModal.data && (
                              <div className="space-y-2">
                                <div>¿Seguro que deseas cerrar la membresía de la placa <b>{confirmCloseModal.data.licensePlate}</b>?</div>
                                <div>Plan: <b>{confirmCloseModal.data.plan === 'Daily' ? 'Diario' : confirmCloseModal.data.plan === 'Biweekly' ? 'Quincena' : confirmCloseModal.data.plan === 'Monthly' ? 'Mensual' : confirmCloseModal.data.plan}</b></div>
                                <div>Vence: <b>{confirmCloseModal.data.endDate ? new Date(confirmCloseModal.data.endDate).toLocaleDateString('es-CR') : '-'}</b></div>
                              </div>
                            )}
                          </Modal>
                    </td>
                        {/* Modal de cierre de membresía (fuera del map) */}
                        <Modal
                          isOpen={closeModal.open}
                          onClose={() => setCloseModal({ open: false, data: null })}
                          title={closeModal.data?.error ? 'Error al cerrar membresía' : 'Membresía cerrada'}
                          actions={
                            closeModal.data?.error ? (
                              <Button onClick={() => setCloseModal({ open: false, data: null })}>Cerrar</Button>
                            ) : (
                              <>
                                <Button variant="info" onClick={() => printCloseMembership(closeModal.data)}>Imprimir factura</Button>
                                <Button onClick={() => setCloseModal({ open: false, data: null })}>Cerrar</Button>
                              </>
                            )
                          }
                        >
                          {closeModal.data?.error ? (
                            <div className="text-red-600">{closeModal.data.error}</div>
                          ) : closeModal.data && (
                            <div className="space-y-2 text-center">
                              <div className="text-2xl font-bold text-green-800 mb-2">
                                💰 {closeModal.data.amount != null ? Number(closeModal.data.amount).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' }) : '-'}
                              </div>
                              <div className="text-green-700">Plan: <b>{closeModal.data.plan === 'Daily' ? 'Diario' : closeModal.data.plan === 'Biweekly' ? 'Quincena' : closeModal.data.plan === 'Monthly' ? 'Mensual' : closeModal.data.plan}</b></div>
                              <div className="text-gray-700">{closeModal.data.message}</div>
                            </div>
                          )}
                        </Modal>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Precios de planes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {prices.map((price, index) => (
              <p key={price.id || index} className="text-gray-700">
                {price.vehicleType === 'Car' ? 'Carro' : 'Moto'} - {
                  price.plan === 'Daily' ? 'Diario' :
                  price.plan === 'Biweekly' ? 'Quincena' :
                  price.plan === 'Monthly' ? 'Mensual' : price.plan
                }: {Number(price.price || 0).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de cancelación de suscripción */}
      <Modal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, data: null })}
        title={cancelModal.result ? 'Suscripción Cancelada' : 'Cancelar Suscripción'}
        actions={
          cancelModal.result ? (
            <Button onClick={() => setCancelModal({ open: false, data: null })}>Cerrar</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setCancelModal({ open: false, data: null })}>No cancelar</Button>
              <Button variant="danger" onClick={confirmCancel}>Sí, cancelar</Button>
            </>
          )
        }
      >
        {cancelModal.error && (
          <div className="text-red-600 mb-2">{cancelModal.error}</div>
        )}
        {!cancelModal.result && cancelModal.data && (
          <div className="space-y-2">
            <div>¿Seguro que deseas cancelar la suscripción de la placa <b>{cancelModal.data.licensePlate}</b>?</div>
            <div>Plan: <b>{Number(cancelModal.data.plan) === 1 ? 'Diario' : Number(cancelModal.data.plan) === 2 ? 'Quincena' : 'Mensual'}</b></div>
            <div>Vence: <b>{cancelModal.data.endDate ? new Date(cancelModal.data.endDate).toLocaleDateString('es-CR') : '-'}</b></div>
          </div>
        )}
        {cancelModal.result && (
          <div className="space-y-2 text-center">
            <div className="text-2xl font-bold text-green-800 mb-2">
              💰 {cancelModal.result.amount != null ? Number(cancelModal.result.amount).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' }) : '-'}
            </div>
            <div className="text-green-700">Monto devuelto o cobrado</div>
            <div className="text-gray-700">Fecha de cancelación: <b>{cancelModal.result.cancelDate ? new Date(cancelModal.result.cancelDate).toLocaleString('es-CR') : new Date().toLocaleString('es-CR')}</b></div>
            <div className="text-gray-700">Plan: <b>{Number(cancelModal.data?.plan) === 1 ? 'Diario' : Number(cancelModal.data?.plan) === 2 ? 'Quincena' : 'Mensual'}</b></div>
            <div className="text-gray-700">Placa: <b>{cancelModal.data?.licensePlate || '-'}</b></div>
            <div className="text-gray-700">Inicio: <b>{cancelModal.data?.startDate ? new Date(cancelModal.data.startDate).toLocaleString('es-CR') : '-'}</b></div>
            <div className="text-gray-700">Fin: <b>{cancelModal.data?.endDate ? new Date(cancelModal.data.endDate).toLocaleString('es-CR') : '-'}</b></div>
            <div className="text-gray-600 text-sm">La suscripción ha sido cancelada exitosamente.</div>
            <Button variant="info" onClick={() => printCancelTicket({ ...cancelModal.data, ...cancelModal.result })}>Imprimir</Button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default SubscriptionsPage;
