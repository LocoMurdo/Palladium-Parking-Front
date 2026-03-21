import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { authService } from '../services/authService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.getUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudieron cargar los usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Deseas eliminar este usuario?')) return;
    try {
      await authService.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'No se pudo eliminar el usuario');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Usuarios</h1>
          <Button variant="secondary" onClick={fetchUsers} loading={loading}>Actualizar</Button>
        </div>

        {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">{error}</div>}

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No hay usuarios disponibles.</td>
                </tr>
              )}

              {users.map((user) => (
                <tr key={user.userId || user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.userId || user.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.userName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{`${user.names || ''} ${user.lastNames || ''}`.trim() || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Button size="sm" variant="danger" onClick={() => handleDelete(user.userId || user.id)}>
                      Eliminar
                    </Button>
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

export default UsersPage;
