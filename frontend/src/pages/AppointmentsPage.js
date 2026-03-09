import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../api/appointments';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    appointmentsApi.getAll()
      .then((res) => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const updated = await appointmentsApi.updateStatus(id, status);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? updated.data : a))
      );
    } catch {
      setError('Failed to update appointment status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statusBadge = (status) => {
    const cls = {
      PENDING: 'badge badge-pending',
      CONFIRMED: 'badge badge-confirmed',
      CANCELLED: 'badge badge-cancelled',
      COMPLETED: 'badge badge-completed',
    }[status] || 'badge';
    return <span className={cls}>{status}</span>;
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <span className="navbar-brand">BookingApp</span>
        <div className="navbar-user">
          <span>{user?.email}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="main-content">
        <div className="page-header">
          <h1>Appointments</h1>
          <p>Manage all upcoming bookings</p>
        </div>
        {error && <div className="error-msg">{error}</div>}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-card">
            {appointments.length === 0 ? (
              <div className="empty-state">No appointments found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td>{a.customerName}</td>
                      <td>{a.serviceName}</td>
                      <td>{a.appointmentDate}</td>
                      <td>{a.appointmentTime}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td>
                        {a.status === 'PENDING' && (
                          <>
                            <button className="btn-confirm" onClick={() => handleStatusUpdate(a.id, 'CONFIRMED')}>
                              Confirm
                            </button>
                            <button className="btn-cancel" onClick={() => handleStatusUpdate(a.id, 'CANCELLED')}>
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
