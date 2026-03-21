import axiosClient from '../api/axios';
import { unwrapResult } from './apiResult';

export const vehicleService = {
  createVehicle: async (licensePlate, carModel) => {
    const response = await axiosClient.post('/vehicles', {
      licensePlate,
      carModel,
    });
    return unwrapResult(response.data, 'Vehiculo creado');
  },

  getVehicles: async () => {
    const response = await axiosClient.get('/vehicles');
    const result = unwrapResult(response.data, 'Vehiculos obtenidos');
    return Array.isArray(result.data) ? result.data : [];
  },

  getVehicleById: async (id) => {
    const response = await axiosClient.get(`/vehicles/${id}`);
    return unwrapResult(response.data, 'Vehiculo obtenido');
  },

  updateVehicle: async (id, licensePlate, carModel) => {
    const response = await axiosClient.put(`/vehicles/${id}`, {
      licensePlate,
      carModel,
      carmodel: carModel,
    });
    return unwrapResult(response.data, 'Vehiculo actualizado');
  },

  deleteVehicle: async (id) => {
    const response = await axiosClient.delete(`/vehicles/${id}`);
    return unwrapResult(response.data, 'Vehiculo eliminado');
  },
};