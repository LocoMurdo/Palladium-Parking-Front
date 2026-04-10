import React, { useEffect } from 'react';
import DashboardLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import { useTodayIncome } from '../hooks/useTodayIncome';

const Dashboard = () => {
  const { todayIncome, loadingIncome, refreshTodayIncome } = useTodayIncome();

  useEffect(() => {
    refreshTodayIncome();
  }, [refreshTodayIncome]);

  const formatColones = (amount) => {
    const safeAmount = Number(amount || 0);
    return safeAmount.toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 2,
    });
  };

  if (loadingIncome && !todayIncome) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </DashboardLayout>
    );
  }

  const income = todayIncome || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Main metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            title="Ingresos Parqueo"
            value={formatColones(income.parkingIncome)}
            color="blue"
            icon={() => <span className="text-2xl">🚗</span>}
          />
          <Card
            title="Ingresos Suscripciones"
            value={formatColones(income.subscriptionIncome)}
            color="purple"
            icon={() => <span className="text-2xl">🧾</span>}
          />
          <Card
            title="Sesiones Activas"
            value={income.activeParkingSessions ?? 0}
            color="green"
            icon={() => <span className="text-2xl">🅿️</span>}
          />
          <Card
            title="Suscripciones Activas"
            value={income.activeSubscriptions ?? 0}
            color="yellow"
            icon={() => <span className="text-2xl">📊</span>}
          />
        </div>

        {/* Payment method breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Desglose por Método de Pago</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-800">{formatColones(income.totalCash)}</div>
              <div className="text-sm text-green-600 mt-1">Efectivo</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-800">{formatColones(income.totalCard)}</div>
              <div className="text-sm text-blue-600 mt-1">Tarjeta</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-800">{formatColones(income.totalSinpe)}</div>
              <div className="text-sm text-purple-600 mt-1">SINPE</div>
            </div>
          </div>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Sesiones de Parqueo Hoy</h2>
            <div className="text-3xl font-bold text-blue-700">{income.parkingSessionCount ?? 0}</div>
            <p className="text-sm text-gray-500 mt-1">sesiones cerradas</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Suscripciones Hoy</h2>
            <div className="text-3xl font-bold text-purple-700">{income.subscriptionCount ?? 0}</div>
            <p className="text-sm text-gray-500 mt-1">suscripciones cerradas</p>
          </div>
        </div>

        {income.date && (
          <p className="text-xs text-gray-400 text-right">Datos del {income.date}</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
