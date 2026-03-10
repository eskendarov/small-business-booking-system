import React, { useEffect, useState } from 'react';
import { appointmentsApi } from '../api/appointments';
import { businessesApi } from '../api/businesses';
import Navbar from '../components/Navbar';

const statusBadge = (status) => {
  const cls = {
    PENDING:   'badge badge-pending',
    CONFIRMED: 'badge badge-confirmed',
    CANCELLED: 'badge badge-cancelled',
    COMPLETED: 'badge badge-completed',
  }[status] || 'badge';
  return <span className={cls}>{status}</span>;
};

export default function DashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [business, setBusiness]         = useState(null);
  const [services, setServices]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [newService, setNewService]     = useState({ name: '', durationMinutes: '', price: '' });
  const [addingService, setAddingService] = useState(false);
  const [showAddForm, setShowAddForm]   = useState(false);

  useEffect(() => {
    Promise.all([appointmentsApi.getAll(), businessesApi.getMyBusiness()])
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

  const stats = {
    total:     appointments.length,
    pending:   appointments.filter((a) => a.status === 'PENDING').length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">
        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading">Loading dashboard…</div>
        ) : (
          <>
            <div className="page-header">
              <h1>{business?.businessName || 'My Business'}</h1>
              <p>Owner: {business?.ownerName} · {business?.email}</p>
            </div>

            {/* Stats */}
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

            {/* Services panel */}
            <div className="table-card" style={{ marginBottom: 20 }}>
              <div className="panel-header">
                <h2 className="panel-title">Services</h2>
                <button
                  className={`btn-primary-sm${showAddForm ? ' is-cancel' : ''}`}
                  onClick={() => setShowAddForm((v) => !v)}
                >
                  {showAddForm ? 'Cancel' : '+ Add Service'}
                </button>
              </div>

              {showAddForm && (
                <form className="svc-add-form" onSubmit={handleAddService}>
                  <div className="svc-add-grid">
                    <input
                      type="text"
                      placeholder="Service name"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Min"
                      min={1}
                      value={newService.durationMinutes}
                      onChange={(e) => setNewService({ ...newService, durationMinutes: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price $"
                      min={0}
                      step="0.01"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      required
                    />
                    <button type="submit" className="btn-success-sm" disabled={addingService}>
                      {addingService ? '…' : 'Save'}
                    </button>
                  </div>
                </form>
              )}

              {services.length === 0 ? (
                <div className="empty-state">No services yet. Add your first service above.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id}>
                        <td>
                          {s.name}
                          {s.description && (
                            <span className="cell-desc">— {s.description}</span>
                          )}
                        </td>
                        <td className="cell-muted">{s.durationMinutes} min</td>
                        <td className="cell-muted">${s.price}</td>
                        <td>
                          <button className="btn-cancel" onClick={() => handleDeleteService(s.id)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Appointments panel */}
            <div className="table-card">
              <div className="panel-header">
                <h2 className="panel-title">Appointments</h2>
              </div>
              {appointments.length === 0 ? (
                <div className="empty-state">No appointments yet.</div>
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
                        <td className="cell-muted">{a.appointmentDate}</td>
                        <td className="cell-muted">{a.appointmentTime}</td>
                        <td>{statusBadge(a.status)}</td>
                        <td>
                          {a.status === 'PENDING' && (
                            <>
                              <button
                                className="btn-confirm"
                                onClick={() => handleStatusUpdate(a.id, 'CONFIRMED')}
                              >
                                Confirm
                              </button>
                              <button
                                className="btn-cancel"
                                onClick={() => handleStatusUpdate(a.id, 'CANCELLED')}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {a.status === 'CONFIRMED' && (
                            <button
                              className="btn-confirm"
                              onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}
                            >
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
