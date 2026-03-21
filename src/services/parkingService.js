import axiosClient from '../api/axios';
import { unwrapResult } from './apiResult';

export const parkingService = {
  createSession: async (visitorPlate, vehicleType) => {
    const ratesResponse = await axiosClient.get('/rates');
    const ratesResult = unwrapResult(ratesResponse.data, 'Tarifas obtenidas');
    const rates = Array.isArray(ratesResult.data) ? ratesResult.data : [];

    const selectedRate = rates.find((rate) => {
      return Number(rate.vehicleType) === Number(vehicleType) && (rate.isActive ?? true);
    });

    if (!selectedRate) {
      throw new Error('No hay una tarifa activa para el tipo de vehiculo seleccionado.');
    }

    const response = await axiosClient.post('/ParkingSeassion', {
      visitorPlate,
      rateId: selectedRate.id,
    });

    return unwrapResult(response.data, 'Sesion creada');
  },

  closeSession: async (sessionId, method) => {
    const response = await axiosClient.post('/ParkingSeassion/CloseParkingSession', {
      sessionId,
      method,
    });

    const result = unwrapResult(response.data, 'Sesion cerrada');
    return result.data;
  },

  getSessions: async () => {
    const response = await axiosClient.get('/ParkingSeassion/GetParkingsession');
    const result = unwrapResult(response.data, 'Sesiones abiertas obtenidas');
    return Array.isArray(result.data) ? result.data : [];
  },

  getHistory: async () => {
    const response = await axiosClient.get('/ParkingSeassion/history');
    const result = unwrapResult(response.data, 'Historial obtenido');
    return Array.isArray(result.data) ? result.data : [];
  },

  getSessionById: async (id) => {
    const response = await axiosClient.get(`/ParkingSeassion/${id}`);
    return unwrapResult(response.data, 'Sesion obtenida');
  },

  cancelSession: async (id) => {
    const response = await axiosClient.post(`/ParkingSeassion/${id}/cancel`);
    return unwrapResult(response.data, 'Sesion cancelada');
  },

  getStats: async () => {
    try {
      const response = await axiosClient.get('/ParkingSeassion/stats');
      const result = unwrapResult(response.data, 'Estadisticas obtenidas');
      return result.data;
    } catch (err) {
      console.error('Error fetching stats:', err);
      return null;
    }
  },

  openCashRegister: async (openingAmount) => {
    const response = await axiosClient.post('/CashRegister/open', {
      openingAmount,
    });
    return unwrapResult(response.data, 'Caja abierta');
  },

  closeCashRegister: async () => {
    const response = await axiosClient.post('/CashRegister/close');
    return unwrapResult(response.data, 'Caja cerrada');
  },

  getCashClosures: async () => {
    const response = await axiosClient.get('/CashRegister/history');
    const result = unwrapResult(response.data, 'Historial de cajas obtenido');
    return Array.isArray(result.data) ? result.data : [];
  },
};