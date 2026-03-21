import axiosClient from '../api/axios';
import { unwrapResult } from './apiResult';

export const rateService = {
  createRate: async (vehicleType, pricePerHour) => {
    const response = await axiosClient.post('/rates', {
      vehicleType,
      pricePerHour,
    });
    return unwrapResult(response.data, 'Tarifa creada');
  },

  getRates: async () => {
    const response = await axiosClient.get('/rates');
    const result = unwrapResult(response.data, 'Tarifas obtenidas');
    return Array.isArray(result.data) ? result.data : [];
  },

  updateRate: async (id, pricePerHour) => {
    const response = await axiosClient.put(`/rates/${id}`, {
      pricePerHour,
    });
    return unwrapResult(response.data, 'Tarifa actualizada');
  },

  deleteRate: async (id) => {
    const response = await axiosClient.delete(`/rates/${id}`);
    return unwrapResult(response.data, 'Tarifa desactivada');
  },
};
