import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/MainLayout';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { authService } from '../services/authService';

const CreateUserPage = () => {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    names: '',
    lastNames: '',
    cellPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.createUser(formData);

      setSuccess(response.message || 'Usuario creado exitosamente');
      setFormData({
        userName: '',
        password: '',
        names: '',
        lastNames: '',
        cellPhone: '',
      });
      setTimeout(() => navigate('/users'), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Crear Nuevo Usuario
        </h1>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-md w-full">
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Nombre de Usuario"
              name="userName"
              type="text"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Nombre único para acceso"
              required
            />

            <FormInput
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña segura"
              required
            />

            <FormInput
              label="Nombres"
              name="names"
              type="text"
              value={formData.names}
              onChange={handleChange}
              placeholder="José, María, etc."
              required
            />

            <FormInput
              label="Apellidos"
              name="lastNames"
              type="text"
              value={formData.lastNames}
              onChange={handleChange}
              placeholder="González, López, etc."
              required
            />

            <FormInput
              label="Teléfono"
              name="cellPhone"
              type="tel"
              value={formData.cellPhone}
              onChange={handleChange}
              placeholder="Número de teléfono"
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
              Crear Usuario
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateUserPage;