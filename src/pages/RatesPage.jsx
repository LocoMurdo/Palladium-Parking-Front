import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { rateService } from '../services/rateService';

const RatesPage = () => {
  const [rates, setRates] = useState([]);
  const [vehicleType, setVehicleType] = useState('1');
  const [pricePerHour, setPricePerHour] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRates = async () => {
    setLoading(true);
    try {
      const data = await rateService.getRates();
      setRates(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudieron cargar las tarifas');
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await rateService.createRate(parseInt(vehicleType, 10), Number(pricePerHour));
      setPricePerHour('');
      fetchRates();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'No se pudo crear la tarifa');
    }
  };

  const handleUpdate = async (rate) => {
    const nextPrice = window.prompt('Nuevo precio por hora', String(rate.pricePerHour || ''));
    if (!nextPrice) return;

    try {
      await rateService.updateRate(rate.id, Number(nextPrice));
      fetchRates();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'No se pudo actualizar la tarifa');
    }
  };

  const handleDelete = async (rate) => {
    if (!window.confirm(`Deseas desactivar la tarifa ${rate.id}?`)) return;
    try {
      await rateService.deleteRate(rate.id);
      fetchRates();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'No se pudo desactivar la tarifa');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tarifas</h1>

        <form onSubmit={handleCreate} className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="1">Carro</option>
            <option value="2">Moto</option>
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={pricePerHour}
            onChange={(e) => setPricePerHour(e.target.value)}
            placeholder="Precio por hora"
            required
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <Button type="submit" className="md:col-span-2">Crear tarifa</Button>
        </form>

        {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">{error}</div>}

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Precio/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!loading && rates.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No hay tarifas disponibles.</td>
                </tr>
              )}

              {rates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{rate.id}</td>
                  <td className="px-6 py-4 text-sm">{Number(rate.vehicleType) === 1 ? 'Carro' : 'Moto'}</td>
                  <td className="px-6 py-4 text-sm">{Number(rate.pricePerHour || 0).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}</td>
                  <td className="px-6 py-4 text-sm">{rate.isActive ? 'Activa' : 'Inactiva'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleUpdate(rate)}>Actualizar</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(rate)}>Desactivar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RatesPage;
