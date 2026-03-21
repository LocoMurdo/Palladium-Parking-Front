import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/MainLayout';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { vehicleService } from '../services/vehicleService';

const CreateVehiclePage = () => {
  const [licensePlate, setLicensePlate] = useState('');
  const [carModel, setCarModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await vehicleService.createVehicle(licensePlate, carModel);

      setSuccess(response.message || 'Vehiculo registrado exitosamente');
      setLicensePlate('');
      setCarModel('');
      setTimeout(() => navigate('/vehicles'), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error al registrar el vehiculo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Registrar Nuevo Vehículo
        </h1>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-md w-full">
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Placa del Vehículo"
              name="licensePlate"
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
              required
            />

            <FormInput
              label="Modelo del Vehículo"
              name="carModel"
              type="text"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              placeholder="Ej: Toyota Corolla 2022"
              required
            />

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              Registrar Vehículo
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateVehiclePage;