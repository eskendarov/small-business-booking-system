import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../api/appointments';
import { businessesApi } from '../api/businesses';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    appointmentsApi.getMy()
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

  const handleBooked = (newAppointment) => {
    setAppointments((prev) => [newAppointment, ...prev]);
    setShowModal(false);
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
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Appointments</h1>
            <p>Manage all upcoming bookings</p>
          </div>
          <button className="btn-book" onClick={() => setShowModal(true)}>
            + Book Appointment
          </button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-card">
            {appointments.length === 0 ? (
              <div className="empty-state">
                No appointments yet. Click "+ Book Appointment" to get started.
              </div>
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
                          <button className="btn-cancel" onClick={() => handleStatusUpdate(a.id, 'CANCELLED')}>
                            Cancel
                          </button>
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
      {showModal && (
        <BookingModal onClose={() => setShowModal(false)} onBooked={handleBooked} />
      )}
    </div>
  );
}

function BookingModal({ onClose, onBooked }) {
  const [businesses, setBusinesses] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    businessId: '',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });
  const [selectedService, setSelectedService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    businessesApi.getAll().then((res) => setBusinesses(res.data));
  }, []);

  const handleBusinessChange = async (e) => {
    const businessId = e.target.value;
    setForm({ ...form, businessId, serviceId: '' });
    setSelectedService(null);
    if (businessId) {
      const res = await businessesApi.getServices(businessId);
      setServices(res.data);
    } else {
      setServices([]);
    }
  };

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setForm({ ...form, serviceId });
    const svc = services.find((s) => String(s.id) === serviceId);
    setSelectedService(svc || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await appointmentsApi.create({
        businessId: Number(form.businessId),
        serviceId: Number(form.serviceId),
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime + ':00',
        notes: form.notes,
      });
      onBooked(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Book an Appointment</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business</label>
            <select value={form.businessId} onChange={handleBusinessChange} required>
              <option value="">Select a business...</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.businessName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Service</label>
            <select value={form.serviceId} onChange={handleServiceChange} required disabled={!form.businessId}>
              <option value="">Select a service...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>
              ))}
            </select>
            {selectedService && (
              <div className="service-info">
                {selectedService.description} · {selectedService.durationMinutes} min
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              min={today}
              value={form.appointmentDate}
              onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={form.appointmentTime}
              onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <input
              type="text"
              placeholder="Any special requests..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary-flex" disabled={submitting}>
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
