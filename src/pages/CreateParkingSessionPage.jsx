import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/MainLayout';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { parkingService } from '../services/parkingService';
import { subscriptionService } from '../services/subscriptionService';

const CreateParkingSessionPage = () => {
  const [visitorPlate, setVisitorPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const parsedVehicleType = parseInt(vehicleType, 10);
      if (parsedVehicleType !== 1 && parsedVehicleType !== 2) {
        setError('Tipo de vehículo inválido. Usa 1 para carro o 2 para moto.');
        return;
      }

      let hasActiveSubscription = false;
      try {
        const checkResult = await subscriptionService.checkPlate(visitorPlate);
        const activeData = checkResult.data;
        hasActiveSubscription = Boolean(activeData?.hasActiveSubscription);
        setSubscriptionInfo(activeData || null);
      } catch {
        setSubscriptionInfo(null);
      }

      const response = await parkingService.createSession(
        visitorPlate,
        parsedVehicleType
      );

      setSuccess(
        hasActiveSubscription
          ? 'Sesion creada. La placa tiene suscripcion activa.'
          : (response.message || 'Sesion de parqueo creada exitosamente')
      );
      printTicket(visitorPlate, new Date().toLocaleString());
      setVisitorPlate('');
      setVehicleType('');
      setTimeout(() => navigate('/parking-sessions'), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error al crear la sesion');
    } finally {
      setLoading(false);
    }
  };

  const printTicket = (plate, entryTime) => {
    console.log('Printing entry ticket for plate:', plate, 'entry time:', entryTime);
    const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(plate)}&code=Code128&dpi=96`;
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
            <h2>Ticket de Entrada</h2>
            <p><strong>Placa:</strong> ${plate}</p>
            <p><strong>Hora de Entrada:</strong> ${entryTime}</p>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Crear Nueva Sesión de Parqueo
        </h1>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-md w-full">
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Placa del Vehículo"
              name="visitorPlate"
              type="text"
              value={visitorPlate}
              onChange={(e) => setVisitorPlate(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
              required
            />

            <div className="mb-4">
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-900 mb-2">
                Tipo de Vehículo<span className="text-red-500">*</span>
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="" disabled>Selecciona un tipo</option>
                <option value="1">Carro</option>
                <option value="2">Moto</option>
              </select>
            </div>

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

            {subscriptionInfo?.hasActiveSubscription && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded-lg">
                Esta placa tiene suscripcion activa hasta {subscriptionInfo.endDate || 'fecha no disponible'}.
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              Crear Sesión
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateParkingSessionPage;