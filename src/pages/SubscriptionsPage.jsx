import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { subscriptionService } from '../services/subscriptionService';

const SubscriptionsPage = () => {
  const [form, setForm] = useState({
    licensePlate: '',
    carModel: '',
    vehicleType: '1',
    plan: '3',
  });
  const [subscriptions, setSubscriptions] = useState([]);
  const [prices, setPrices] = useState([]);
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
    if (!window.confirm('Deseas cancelar esta suscripcion?')) return;
    try {
      await subscriptionService.cancelSubscription(id);
      loadSubscriptions(activeOnly);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'No se pudo cancelar la suscripcion');
    }
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
                    <td className="py-3 text-sm">{Number(sub.plan) === 1 ? 'Diario' : Number(sub.plan) === 2 ? 'Quincena' : 'Mensual'}</td>
                    <td className="py-3 text-sm">{Number(sub.price || 0).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}</td>
                    <td className="py-3 text-sm">{sub.endDate ? new Date(sub.endDate).toLocaleDateString('es-CR') : '-'}</td>
                    <td className="py-3 text-sm">
                      <Button size="sm" variant="danger" onClick={() => handleCancel(sub.id || sub.subscriptionId)}>Cancelar</Button>
                    </td>
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
                {Number(price.vehicleType) === 1 ? 'Carro' : 'Moto'} - {Number(price.plan) === 1 ? 'Diario' : Number(price.plan) === 2 ? 'Quincena' : 'Mensual'}: {Number(price.price || 0).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
              </p>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionsPage;
