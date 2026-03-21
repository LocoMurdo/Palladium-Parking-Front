# Parking Management System Frontend

Un moderno dashboard de administración para el Sistema de Gestión de Estacionamiento, construido con React, Vite y TailwindCSS.

## 🎯 Características

✅ Autenticación JWT con tokens de acceso y refresco  
✅ Dashboard responsive con estadísticas en tiempo real  
✅ Gestión de sesiones de parqueo (crear, ver, cerrar)  
✅ Registro de vehículos  
✅ Creación de usuarios  
✅ Interfaz moderna similar a un panel de control administrativo  
✅ Sidebar fijo y layout flexible  
✅ Componentes reutilizables  
✅ Protección de rutas con autenticación

## 📚 Stack Tecnológico

- **React 19** - Interfaz de usuario moderna
- **Vite** - Servidor de desarrollo rápido y construcción optimizada
- **TailwindCSS 4** - Estilos utilitarios responsivos
- **React Router v7** - Enrutamiento de aplicaciones
- **Axios** - Cliente HTTP con interceptores
- **Context API** - Gestión de estado global

## 📁 Estructura del Proyecto

```
src/
├── api/
│   └── axios.js              # Cliente Axios configurado con interceptores
├── auth/
│   └── (componentes de autenticación)
├── components/
│   ├── Button.jsx            # Componente botón reutilizable
│   ├── Card.jsx              # Componente tarjeta para estadísticas
│   ├── FormInput.jsx         # Componente input con validación
│   ├── Modal.jsx             # Componente modal
│   ├── Navbar.jsx            # Barra de navegación superior
│   ├── ProtectedRoute.jsx    # Componente para rutas protegidas
│   ├── Sidebar.jsx           # Barra lateral de navegación
│   └── Table.jsx             # Componente tabla
├── context/
│   └── AuthContext.jsx       # Contexto de autenticación
├── hooks/
│   └── useAuth.js            # Hook personalizado para autenticación
├── layouts/
│   └── MainLayout.jsx        # Layout principal del dashboard
├── pages/
│   ├── LoginPage.jsx         # Página de inicio de sesión
│   ├── Dashboard.jsx         # Panel de control principal
│   ├── ParkingSessionsPage.jsx # Gestión de sesiones
│   ├── CreateParkingSessionPage.jsx # Crear nueva sesión
│   ├── VehiclesPage.jsx      # Listado de vehículos
│   ├── CreateVehiclePage.jsx # Registro de vehículo
│   └── CreateUserPage.jsx    # Creación de usuario
├── services/
│   ├── authService.js        # Servicio de autenticación
│   ├── parkingService.js     # Servicio de sesiones
│   └── vehicleService.js     # Servicio de vehículos
└── utils/
    └── tokenStorage.js       # Utilidades para almacenar tokens
```

## 🚀 Inicio Rápido

### Requisitos previos
- Node.js 16+
- npm o yarn

### Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Configura la URL del API en `.env`:
```
VITE_API_BASE_URL=https://localhost:44363/
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:5173](http://localhost:5173) en tu navegador

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run preview` | Previsualiza la compilación de producción |
| `npm run lint` | Ejecuta ESLint para verificar el código |

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para la autenticación:

1. El usuario inicia sesión con su usuario y contraseña
2. El servidor devuelve `accessToken` y `refreshToken`
3. Los tokens se almacenan en `localStorage`
4. Se adjunta automáticamente a cada solicitud HTTP como header: `Authorization: Bearer accessToken`
5. Si el token expira (401), se redirige a la página de login

## 📡 Integración con Backend

### Endpoints utilizados

#### Autenticación
```
POST /User/login
Body: { userName: string, password: string }
Response: { status, success, message, data: { userId, accessToken, refreshToken, ... } }
```

#### Sesiones de Parqueo
```
GET /ParkingSeassion/GetParkingsession
Response: { data: [{ sessionId, visitorPlate, entryTime, rateId }] }

POST /ParkingSeassion
Body: { visitorPlate: string, rateId: number }

POST /ParkingSeassion/{sessionId}
Response: { sessionId, totalAmount, exitTime, minutes }
```

#### Vehículos
```
POST /vehicles
Body: { licensePlate: string, carModel: string }
```

#### Usuarios
```
POST /User
Body: { userName, password, names, lastNames, cellPhone }
```

## 🎨 Características de Diseño

### Layout
- **Sidebar fijo** (250px de ancho en desktop)
- **Navbar superior** con información del usuario
- **Contenido flexible** que se adapta al espacio disponible
- **Responsive**: Funciona en mobile, tablet y desktop

### Componentes
- **Button**: Variantes (primary, secondary, danger, success, outline)
- **Card**: Para mostrar estadísticas con iconos
- **FormInput**: Inputs con validación y manejo de errores
- **Table**: Tablas responsivas con acciones
- **Modal**: Diálogos para confirmaciones y acciones

### Estilos
- Colores profesionales (azul, verde, rojo, amarillo, púrpura)
- Tipografía clara y legible
- Espaciado consistente
- Bordes y sombras sutiles
- Transiciones suaves

## ⚠️ Problemas Comunes Solucionados

✅ **Texto blanco en fondo blanco**: Todos los inputs usan `bg-white text-gray-900`  
✅ **Layout que no ocupa pantalla completa**: Uso de `min-h-screen` y flexbox  
✅ **Responsividad**: Grid responsivo con `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`  
✅ **Accesibilidad**: Labels asociados con inputs, ARIA labels, colores de contraste

## 🔒 Seguridad

- Token almacenado en localStorage (protegido en producción con httpOnly cookies)
- Rutas protegidas que verifican autenticación
- Interceptores que manejan errores de autorización
- Logout automático en caso de token expirado

## 📱 Responsividad

La aplicación es completamente responsive:
- **Mobile (< 768px)**: Sidebar en drawer, tabla con scroll horizontal
- **Tablet (768px - 1024px)**: Layout de una columna
- **Desktop (> 1024px)**: Layout completo con sidebar fijo

## 🐛 Debugging

Para ver logs detallados de las solicitudes API, abre la consola del navegador (F12) e inspecciona la pestaña "Network".

## 📦 Dependencias Principales

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.13.1",
  "axios": "^1.13.6",
  "tailwindcss": "^4.2.1",
  "@tailwindcss/vite": "^4.2.1"
}
```

## 🤝 Contribución

Para hacer cambios:
1. Crea una rama: `git checkout -b feature/nueva-feature`
2. Haz commit: `git commit -m 'Agregar nueva feature'`
3. Push: `git push origin feature/nueva-feature`

## 📄 Licencia

Este proyecto es parte del Sistema de Gestión de Estacionamiento.

---

**¡Tu aplicación frontend está lista para producción!**
