import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { vehicleService } from '../services/vehicleService';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleService.getVehicles();
      setVehicles(Array.isArray(response) ? response : []);
      setError('');
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err.response?.data?.message || err.message || 'No se pudieron cargar los vehiculos');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Deseas eliminar este vehiculo?')) return;
    try {
      await vehicleService.deleteVehicle(vehicleId);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'No se pudo eliminar el vehiculo');
    }
  };

  const handleEdit = async (vehicle) => {
    const newPlate = window.prompt('Nueva placa', vehicle.licensePlate);
    if (!newPlate) return;
    const newModel = window.prompt('Nuevo modelo', vehicle.carModel || vehicle.carmodel || '');
    if (!newModel) return;

    try {
      await vehicleService.updateVehicle(vehicle.id, newPlate.toUpperCase(), newModel);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'No se pudo actualizar el vehiculo');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Vehículos Registrados</h1>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">{error}</div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full bg-white">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Modelo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!loading && vehicles.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No hay vehiculos disponibles</td>
                </tr>
              )}

              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{vehicle.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{vehicle.licensePlate}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{vehicle.carModel || vehicle.carmodel || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 flex gap-2">
                    <Button size="sm" variant="info" onClick={() => handleEdit(vehicle)}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(vehicle.id)}>Eliminar</Button>
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

export default VehiclesPage;