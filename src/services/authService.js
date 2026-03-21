import axiosClient from '../api/axios';
import { unwrapResult } from './apiResult';

export const authService = {
  login: async (userName, password) => {
    const response = await axiosClient.post('/User/login', {
      userName,
      password,
    });
    return unwrapResult(response.data, 'Login exitoso');
  },

  refresh: async (refreshToken) => {
    const response = await axiosClient.post('/User/refresh', {
      refreshToken,
    });
    return unwrapResult(response.data, 'Sesion refrescada');
  },

  revoke: async (refreshToken) => {
    const response = await axiosClient.post('/User/revoke', {
      refreshToken,
    });
    return unwrapResult(response.data, 'Sesion cerrada');
  },

  createUser: async (userData) => {
    const response = await axiosClient.post('/User', userData);
    return unwrapResult(response.data, 'Usuario creado exitosamente');
  },

  getUsers: async () => {
    const response = await axiosClient.get('/User');
    const result = unwrapResult(response.data, 'Usuarios obtenidos');
    return Array.isArray(result.data) ? result.data : [];
  },

  deleteUser: async (id) => {
    const response = await axiosClient.delete(`/User/${id}`);
    return unwrapResult(response.data, 'Usuario eliminado');
  },
};