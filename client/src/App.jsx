import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import CreateShipmentPage from './pages/CreateShipmentPage';
import TrackShipmentPage from './pages/TrackShipmentPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';

import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* App Layout with Sidebar */}
            <Route
              path="/*"
              element={
                <div className="flex min-h-screen bg-bg-primary text-text-primary font-inter">
                  <Sidebar />
                  <main className="flex-1 ml-64 overflow-x-hidden">
                    <Routes>
                      {/* Dashboard — role-aware */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <HomePage />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Track shipment */}
                      <Route
                        path="/track/:id"
                        element={
                          <ProtectedRoute>
                            <TrackShipmentPage />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Create Order — users only */}
                      <Route
                        path="/orders/new"
                        element={
                          <ProtectedRoute userOnly>
                            <CreateShipmentPage />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* History */}
                      <Route
                        path="/history"
                        element={
                          <ProtectedRoute>
                            <HistoryPage />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Settings */}
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <SettingsPage />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Catch-all redirects to register */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              }
            />
          </Routes>
        </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
