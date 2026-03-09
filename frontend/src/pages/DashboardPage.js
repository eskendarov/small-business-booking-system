import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../api/appointments';
import { businessesApi } from '../api/businesses';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newService, setNewService] = useState({ name: '', durationMinutes: '', price: '' });
  const [addingService, setAddingService] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      appointmentsApi.getAll(),
      businessesApi.getMyBusiness(),
    ])
      .then(([apptRes, bizRes]) => {
        setAppointments(apptRes.data);
        setBusiness(bizRes.data);
        return businessesApi.getServices(bizRes.data.id);
      })
      .then((svcRes) => setServices(svcRes.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const updated = await appointmentsApi.updateStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated.data : a)));
    } catch {
      setError('Failed to update status');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setAddingService(true);
    try {
      const res = await businessesApi.addService({
        name: newService.name,
        durationMinutes: Number(newService.durationMinutes),
        price: Number(newService.price),
      });
      setServices((prev) => [...prev, res.data]);
      setNewService({ name: '', durationMinutes: '', price: '' });
      setShowAddForm(false);
    } catch {
      setError('Failed to add service');
    } finally {
      setAddingService(false);
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await businessesApi.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError('Failed to delete service');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'PENDING').length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
  };

  const statusBadge = (status) => {
    const cls = { PENDING: 'badge badge-pending', CONFIRMED: 'badge badge-confirmed', CANCELLED: 'badge badge-cancelled', COMPLETED: 'badge badge-completed' }[status] || 'badge';
    return <span className={cls}>{status}</span>;
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <span className="navbar-brand">BookingApp</span>
        <div className="navbar-user">
          <span style={{ background: '#e0e7ff', color: '#6366f1', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>Admin</span>
          <span>{user?.email}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="main-content">
        {error && <div className="error-msg">{error}</div>}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Business header */}
            <div className="page-header">
              <h1>{business?.businessName || 'My Business'}</h1>
              <p>Owner: {business?.ownerName} · {business?.email}</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card purple"><div className="stat-label">Total</div><div className="stat-value">{stats.total}</div></div>
              <div className="stat-card yellow"><div className="stat-label">Pending</div><div className="stat-value">{stats.pending}</div></div>
              <div className="stat-card green"><div className="stat-label">Confirmed</div><div className="stat-value">{stats.confirmed}</div></div>
              <div className="stat-card blue"><div className="stat-label">Completed</div><div className="stat-value">{stats.completed}</div></div>
            </div>

            {/* Services panel */}
            <div className="table-card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Services</h2>
                <button
                  onClick={() => setShowAddForm((v) => !v)}
                  style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {showAddForm ? 'Cancel' : '+ Add Service'}
                </button>
              </div>
              {showAddForm && (
                <form onSubmit={handleAddService} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px auto', gap: 8, marginBottom: 16, alignItems: 'center' }}>
                  <input
                    type="text" placeholder="Service name" value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    required style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
                  />
                  <input
                    type="number" placeholder="Min" min={1} value={newService.durationMinutes}
                    onChange={(e) => setNewService({ ...newService, durationMinutes: e.target.value })}
                    required style={{ padding: '8px 8px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
                  />
                  <input
                    type="number" placeholder="Price $" min={0} step="0.01" value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    required style={{ padding: '8px 8px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
                  />
                  <button type="submit" disabled={addingService}
                    style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {addingService ? '...' : 'Save'}
                  </button>
                </form>
              )}
              {services.length === 0 ? (
                <div className="empty-state">No services yet. Add your first service above.</div>
              ) : (
                <table>
                  <thead>
                    <tr><th>Service</th><th>Duration</th><th>Price</th><th></th></tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}{s.description && <span style={{ color: '#9ca3af', marginLeft: 6, fontSize: 12 }}>— {s.description}</span>}</td>
                        <td>{s.durationMinutes} min</td>
                        <td>${s.price}</td>
                        <td>
                          <button onClick={() => handleDeleteService(s.id)} className="btn-cancel">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Appointments */}
            <div className="table-card">
              <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Appointments</h2>
              {appointments.length === 0 ? (
                <div className="empty-state">No appointments yet.</div>
              ) : (
                <table>
                  <thead>
                    <tr><th>Customer</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr>
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
                              <button className="btn-confirm" onClick={() => handleStatusUpdate(a.id, 'CONFIRMED')}>Confirm</button>
                              <button className="btn-cancel" onClick={() => handleStatusUpdate(a.id, 'CANCELLED')}>Cancel</button>
                            </>
                          )}
                          {a.status === 'CONFIRMED' && (
                            <button className="btn-confirm" onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}>Complete</button>
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
