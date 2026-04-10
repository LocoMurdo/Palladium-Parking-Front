import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../components/Modal';
import DashboardLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from '../hooks/useAuth';
import { useTodayIncome } from '../hooks/useTodayIncome';

const SubscriptionsPage = () => {
  const { role } = useAuth();
  const isAdmin = role === 1 || role === 'Admin';
  const { refreshTodayIncome } = useTodayIncome();

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
  const [closePaymentMethod, setClosePaymentMethod] = useState('1');
  const [changePaymentModal, setChangePaymentModal] = useState({ open: false, data: null });
  const [changePaymentMethod, setChangePaymentMethod] = useState('1');
  const [changingPayment, setChangingPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [checkPlate, setCheckPlate] = useState('');
  const [checkResult, setCheckResult] = useState(null);

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

  const formatPlan = (plan) => {
    if (plan === 'Daily') return 'Diario';
    if (plan === 'Biweekly') return 'Quincena';
    if (plan === 'Monthly') return 'Mensual';
    return plan;
  };

  const formatColones = (amount) => {
    const safeAmount = Number(amount || 0);
    return safeAmount.toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 2,
    });
  };

  const paymentMethodLabel = (method) => {
    if (method === 1 || method === 'Cash') return 'Efectivo';
    if (method === 2 || method === 'Card') return 'Tarjeta';
    if (method === 3 || method === 'Sinpe') return 'SINPE';
    return method || '-';
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  const getDaysBadge = (days) => {
    if (days === null) return null;
    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          ⚠️ Vencida hace {Math.abs(days)}d
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 animate-pulse">
          🔴 Vence hoy
        </span>
      );
    }
    if (days <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
          🟠 {days}d restante{days > 1 ? 's' : ''}
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          🟡 {days}d restantes
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        🟢 {days}d restantes
      </span>
    );
  };

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

  // --- Close Membership ---
  const handleCloseMembership = (id) => {
    const sub = subscriptions.find((s) => (s.id || s.subscriptionId) === id);
    if (!sub) return;
    setClosePaymentMethod('1');
    setConfirmCloseModal({ open: true, data: sub });
  };

  const confirmCloseMembership = async () => {
    const id = confirmCloseModal.data?.id || confirmCloseModal.data?.subscriptionId;
    try {
      const result = await subscriptionService.closeSubscription(id, parseInt(closePaymentMethod, 10));
      setCloseModal({ open: true, data: result.data || result });
      loadSubscriptions(activeOnly);
      refreshTodayIncome();
    } catch (err) {
      setCloseModal({ open: true, data: { error: err.response?.data?.message || err.message || 'No se pudo cerrar la membresía' } });
    } finally {
      setConfirmCloseModal({ open: false, data: null });
    }
  };

  const printCloseMembership = (info) => {
    const planLabel = formatPlan(info.plan);
    const formattedAmount = info.amount != null ? formatColones(info.amount) : '-';
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

  // --- Cancel Subscription ---
  const handleCancel = (id) => {
    const sub = subscriptions.find((s) => (s.id || s.subscriptionId) === id);
    if (!sub) return;
    setCancelModal({ open: true, data: sub });
  };

  const confirmCancel = async () => {
    const id = cancelModal.data?.id || cancelModal.data?.subscriptionId;
    try {
      const result = await subscriptionService.cancelSubscription(id);
      setCancelModal((prev) => ({ ...prev, result: result.data }));
      loadSubscriptions(activeOnly);
      if (result.data) {
        printCancelTicket({ ...cancelModal.data, ...result.data });
      }
    } catch (err) {
      setCancelModal({ open: false, data: null, error: err.response?.data?.message || err.message || 'No se pudo cancelar la suscripcion' });
    }
  };

  const printCancelTicket = (info) => {
    const planLabel = formatPlan(info.plan);
    const formattedStart = info.startDate ? new Date(info.startDate).toLocaleString('es-CR') : '-';
    const formattedEnd = info.endDate ? new Date(info.endDate).toLocaleString('es-CR') : '-';
    const formattedCancel = info.cancelDate ? new Date(info.cancelDate).toLocaleString('es-CR') : new Date().toLocaleString('es-CR');
    const formattedAmount = info.amount != null ? formatColones(info.amount) : '-';
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

  // --- Change Payment Method ---
  const handleChangePayment = (sub) => {
    setChangePaymentMethod('1');
    setChangePaymentModal({ open: true, data: sub });
  };

  const confirmChangePayment = async () => {
    const id = changePaymentModal.data?.id || changePaymentModal.data?.subscriptionId;
    setChangingPayment(true);
    try {
      await subscriptionService.changePaymentMethod(id, parseInt(changePaymentMethod, 10));
      setChangePaymentModal({ open: false, data: null });
      loadSubscriptions(activeOnly);
      refreshTodayIncome();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'No se pudo cambiar el método de pago');
    } finally {
      setChangingPayment(false);
    }
  };

  // --- Check Plate ---
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

          {/* Alerts for expiring subscriptions */}
          {(() => {
            const active = subscriptions.filter((s) => s.status === 'Active' || s.status === 1 || s.isActive === true);
            const expired = active.filter((s) => getDaysRemaining(s.endDate) !== null && getDaysRemaining(s.endDate) < 0);
            const today = active.filter((s) => getDaysRemaining(s.endDate) === 0);
            const soon = active.filter((s) => { const d = getDaysRemaining(s.endDate); return d !== null && d >= 1 && d <= 3; });
            if (expired.length === 0 && today.length === 0 && soon.length === 0) return null;
            return (
              <div className="mb-4 space-y-2">
                {expired.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-lg">⚠️</span>
                    <div className="text-sm text-red-800">
                      <b>{expired.length} suscripción{expired.length > 1 ? 'es' : ''} vencida{expired.length > 1 ? 's' : ''}:</b>{' '}
                      {expired.map((s) => s.licensePlate).join(', ')}
                    </div>
                  </div>
                )}
                {today.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <span className="text-lg">🔴</span>
                    <div className="text-sm text-orange-800">
                      <b>{today.length} suscripción{today.length > 1 ? 'es' : ''} vence{today.length > 1 ? 'n' : ''} hoy:</b>{' '}
                      {today.map((s) => s.licensePlate).join(', ')}
                    </div>
                  </div>
                )}
                {soon.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-lg">🟠</span>
                    <div className="text-sm text-yellow-800">
                      <b>{soon.length} suscripción{soon.length > 1 ? 'es' : ''} por vencer (1-3 días):</b>{' '}
                      {soon.map((s) => `${s.licensePlate} (${getDaysRemaining(s.endDate)}d)`).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Placa</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Plan</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Precio</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Fin</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Días</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Estado</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!loading && subscriptions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-500">No hay suscripciones.</td>
                  </tr>
                )}
                {subscriptions.map((sub) => {
                  const subId = sub.id || sub.subscriptionId;
                  const isActive = sub.status === 'Active' || sub.status === 1 || sub.isActive === true;
                  const isClosed = sub.status === 'Closed' || sub.status === 2;
                  const daysLeft = isActive ? getDaysRemaining(sub.endDate) : null;
                  return (
                    <tr key={subId} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isActive && daysLeft !== null && daysLeft <= 0 ? 'bg-red-50/50' : isActive && daysLeft !== null && daysLeft <= 3 ? 'bg-orange-50/40' : ''}`}>
                      <td className="py-3 text-sm font-medium">{sub.licensePlate}</td>
                      <td className="py-3 text-sm">{formatPlan(sub.plan)}</td>
                      <td className="py-3 text-sm">{formatColones(sub.price)}</td>
                      <td className="py-3 text-sm">{formatDateTime(sub.endDate)}</td>
                      <td className="py-3 text-sm">
                        {isActive ? getDaysBadge(daysLeft) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="py-3 text-sm">
                        {isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Activa</span>
                        ) : isClosed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Cerrada</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelada</span>
                        )}
                      </td>
                      <td className="py-3 text-sm">
                        <div className="flex flex-wrap gap-2">
                          {isActive && (
                            <>
                              {isAdmin && (
                                <Button size="sm" variant="danger" onClick={() => handleCancel(subId)}>Cancelar</Button>
                              )}
                              <Button size="sm" variant="success" onClick={() => handleCloseMembership(subId)}>Cerrar Membresía</Button>
                            </>
                          )}
                          {isClosed && (
                            <Button size="sm" variant="secondary" onClick={() => handleChangePayment(sub)}>Cambiar Pago</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Precios de planes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {prices.map((price, index) => (
              <p key={price.id || index} className="text-gray-700">
                {price.vehicleType === 'Car' ? 'Carro' : 'Moto'} - {formatPlan(price.plan)}: {formatColones(price.price)}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Close Membership Modal */}
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
          <div className="space-y-4">
            <div className="space-y-2">
              <div>¿Seguro que deseas cerrar la membresía de la placa <b>{confirmCloseModal.data.licensePlate}</b>?</div>
              <div>Plan: <b>{formatPlan(confirmCloseModal.data.plan)}</b></div>
              <div>Vence: <b>{confirmCloseModal.data.endDate ? new Date(confirmCloseModal.data.endDate).toLocaleDateString('es-CR') : '-'}</b></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2" htmlFor="closePaymentMethod">
                Método de pago
              </label>
              <select
                id="closePaymentMethod"
                value={closePaymentMethod}
                onChange={(e) => setClosePaymentMethod(e.target.value)}
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

      {/* Close Membership Result Modal */}
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
              💰 {closeModal.data.amount != null ? formatColones(closeModal.data.amount) : '-'}
            </div>
            <div className="text-green-700">Plan: <b>{formatPlan(closeModal.data.plan)}</b></div>
            <div className="text-gray-700">{closeModal.data.message}</div>
          </div>
        )}
      </Modal>

      {/* Cancel Subscription Modal */}
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
            <div>Plan: <b>{formatPlan(cancelModal.data.plan)}</b></div>
            <div>Vence: <b>{cancelModal.data.endDate ? new Date(cancelModal.data.endDate).toLocaleDateString('es-CR') : '-'}</b></div>
          </div>
        )}
        {cancelModal.result && (
          <div className="space-y-2 text-center">
            <div className="text-2xl font-bold text-green-800 mb-2">
              💰 {cancelModal.result.amount != null ? formatColones(cancelModal.result.amount) : '-'}
            </div>
            <div className="text-green-700">Monto devuelto o cobrado</div>
            <div className="text-gray-700">Fecha de cancelación: <b>{cancelModal.result.cancelDate ? new Date(cancelModal.result.cancelDate).toLocaleString('es-CR') : new Date().toLocaleString('es-CR')}</b></div>
            <div className="text-gray-700">Plan: <b>{formatPlan(cancelModal.data?.plan)}</b></div>
            <div className="text-gray-700">Placa: <b>{cancelModal.data?.licensePlate || '-'}</b></div>
            <div className="text-gray-700">Inicio: <b>{cancelModal.data?.startDate ? new Date(cancelModal.data.startDate).toLocaleString('es-CR') : '-'}</b></div>
            <div className="text-gray-700">Fin: <b>{cancelModal.data?.endDate ? new Date(cancelModal.data.endDate).toLocaleString('es-CR') : '-'}</b></div>
            <div className="text-gray-600 text-sm">La suscripción ha sido cancelada exitosamente.</div>
            <Button variant="info" onClick={() => printCancelTicket({ ...cancelModal.data, ...cancelModal.result })}>Imprimir</Button>
          </div>
        )}
      </Modal>

      {/* Change Payment Method Modal */}
      <Modal
        isOpen={changePaymentModal.open}
        onClose={() => setChangePaymentModal({ open: false, data: null })}
        title="Cambiar Método de Pago"
        actions={
          <>
            <Button variant="secondary" onClick={() => setChangePaymentModal({ open: false, data: null })}>Cancelar</Button>
            <Button variant="success" onClick={confirmChangePayment} loading={changingPayment} disabled={changingPayment}>Confirmar</Button>
          </>
        }
      >
        {changePaymentModal.data && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Cambiar método de pago para la suscripción <b>#{changePaymentModal.data.id || changePaymentModal.data.subscriptionId}</b> - Placa: <b>{changePaymentModal.data.licensePlate}</b>
            </p>
            {changePaymentModal.data.paymentMethod && (
              <p className="text-sm text-gray-500">Método actual: <b>{paymentMethodLabel(changePaymentModal.data.paymentMethod)}</b></p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2" htmlFor="changeSubPayment">
                Nuevo método de pago
              </label>
              <select
                id="changeSubPayment"
                value={changePaymentMethod}
                onChange={(e) => setChangePaymentMethod(e.target.value)}
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
    </DashboardLayout>
  );
};

export default SubscriptionsPage;
