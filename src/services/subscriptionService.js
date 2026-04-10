import axiosClient from '../api/axios';
import { unwrapResult } from './apiResult';

export const subscriptionService = {
  createSubscription: async (payload) => {
    const response = await axiosClient.post('/subscriptions', payload);
    return unwrapResult(response.data, 'Suscripcion creada');
  },

  getSubscriptions: async () => {
    const response = await axiosClient.get('/subscriptions');
    const result = unwrapResult(response.data, 'Suscripciones obtenidas');
    return Array.isArray(result.data) ? result.data : [];
  },

  getActiveSubscriptions: async () => {
    const response = await axiosClient.get('/subscriptions/active');
    const result = unwrapResult(response.data, 'Suscripciones activas obtenidas');
    return Array.isArray(result.data) ? result.data : [];
  },

  checkPlate: async (plate) => {
    const response = await axiosClient.get(`/subscriptions/check/${plate}`);
    return unwrapResult(response.data, 'Placa verificada');
  },

  getPrices: async () => {
    const response = await axiosClient.get('/subscriptions/prices');
    const result = unwrapResult(response.data, 'Precios de suscripcion obtenidos');
    return Array.isArray(result.data) ? result.data : [];
  },

  cancelSubscription: async (id) => {
    const response = await axiosClient.post(`/subscriptions/${id}/cancel`);
    return unwrapResult(response.data, 'Suscripcion cancelada');
  },

  closeSubscription: async (id, method) => {
    const response = await axiosClient.post(`/subscriptions/${id}/close`, { method });
    return unwrapResult(response.data, 'Membresía cerrada');
  },

  changePaymentMethod: async (id, method) => {
    const response = await axiosClient.put(`/subscriptions/${id}/payment-method`, { method });
    return unwrapResult(response.data, 'Método de pago actualizado');
  },
};
