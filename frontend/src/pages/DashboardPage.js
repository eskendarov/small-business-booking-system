import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../api/appointments';

export default function DashboardPage() {
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
      setError('Failed to update status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'PENDING').length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
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
          <span style={{ background: '#e0e7ff', color: '#6366f1', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
            Admin
          </span>
          <span>{user?.email}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="main-content">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Manage all bookings across your business</p>
        </div>
        {error && <div className="error-msg">{error}</div>}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card purple">
                <div className="stat-label">Total</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-card yellow">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
              <div className="stat-card green">
                <div className="stat-label">Confirmed</div>
                <div className="stat-value">{stats.confirmed}</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.completed}</div>
              </div>
            </div>
            <div className="table-card">
              {appointments.length === 0 ? (
                <div className="empty-state">No appointments yet.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Business</th>
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
                        <td>{a.businessName}</td>
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
                          {a.status === 'CONFIRMED' && (
                            <button className="btn-confirm" onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}>
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
