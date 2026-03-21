import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import { parkingService } from '../services/parkingService';
import { vehicleService } from '../services/vehicleService';
import { subscriptionService } from '../services/subscriptionService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeSessions: 0,
    totalVehicles: 0,
    cashToday: 0,
    totalSessions: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [openSessions, sessionsHistory, vehicles, cashHistory, activeSubscriptions] = await Promise.all([
          parkingService.getSessions(),
          parkingService.getHistory(),
          vehicleService.getVehicles(),
          parkingService.getCashClosures(),
          subscriptionService.getActiveSubscriptions(),
        ]);

        const activeSessionsCount = Array.isArray(openSessions) ? openSessions.length : 0;
        const totalSessionsCount = Array.isArray(sessionsHistory) ? sessionsHistory.length : activeSessionsCount;
        const vehiclesCount = Array.isArray(vehicles) ? vehicles.length : 0;
        const activeSubscriptionsCount = Array.isArray(activeSubscriptions) ? activeSubscriptions.length : 0;

        const lastCashClosure = Array.isArray(cashHistory) && cashHistory.length > 0
          ? cashHistory[0]
          : null;
        const cashTotal = Number(lastCashClosure?.total || lastCashClosure?.closingAmount || 0);

        setStats({
          activeSessions: activeSessionsCount,
          totalVehicles: vehiclesCount,
          cashToday: cashTotal,
          totalSessions: totalSessionsCount,
          activeSubscriptions: activeSubscriptionsCount,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setStats({
          activeSessions: 0,
          totalVehicles: 0,
          cashToday: 0,
          totalSessions: 0,
          activeSubscriptions: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            title="Sesiones Activas"
            value={`${stats.activeSessions} ${stats.activeSessions === 1 ? 'sesión activa' : 'sesiones activas'}`}
            color="blue"
            icon={() => <span className="text-2xl">🚗</span>}
          />
          <Card
            title="Vehículos Registrados"
            value={`${stats.totalVehicles} ${stats.totalVehicles === 1 ? 'vehículo registrado' : 'vehículos registrados'}`}
            color="green"
            icon={() => <span className="text-2xl">🚙</span>}
          />
          <Card
            title="Ingresos Hoy"
            value={stats.cashToday.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
            color="yellow"
            icon={() => <span className="text-2xl">💰</span>}
          />
          <Card
            title="Suscripciones Activas"
            value={stats.activeSubscriptions}
            color="purple"
            icon={() => <span className="text-2xl">📊</span>}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;