import React, { useEffect, useState } from 'react';
import { appointmentsApi } from '../api/appointments';
import { businessesApi } from '../api/businesses';
import Navbar from '../components/Navbar';
import { useTableFilter } from '../hooks/useTableFilter';
import {
  TableControls,
  SortableTh,
  STATUS_FILTER_OPTIONS,
  statusFilterFn,
} from '../components/TableControls';

const statusBadge = (status) => {
  const cls = {
    PENDING:   'badge badge-pending',
    CONFIRMED: 'badge badge-confirmed',
    CANCELLED: 'badge badge-cancelled',
    COMPLETED: 'badge badge-completed',
  }[status] || 'badge';
  return <span className={cls}>{status}</span>;
};

function timeSlots() {
  const slots = [];
  for (let h = 8; h <= 19; h++) {
    for (const m of [0, 30]) {
      if (h === 19 && m === 30) break;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const ampm = h < 12 ? 'AM' : 'PM';
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      slots.push({ value: `${hh}:${mm}`, label: `${displayH}:${mm} ${ampm}` });
    }
  }
  return slots;
}
const TIME_SLOTS = timeSlots();

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [showModal, setShowModal]       = useState(false);

  /* ── Search · Filter · Sort ──
     Search:  business name, service name
     Filter:  appointment status
     Sort:    date ↓ (default), business name, service name, status   */
  const apptFilter = useTableFilter(
    appointments,
    ['businessName', 'serviceName'],
    statusFilterFn,
    'appointmentDate', 'desc',
  );

  useEffect(() => {
    appointmentsApi.getMy()
      .then((res) => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments'))
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

  const handleBooked = (newAppointment) => {
    setAppointments((prev) => [newAppointment, ...prev]);
    setShowModal(false);
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">
        <div className="page-header page-header--flex">
          <div>
            <h1>Appointments</h1>
            <p>View and manage your upcoming bookings</p>
          </div>
          <button className="btn-book" onClick={() => setShowModal(true)}>
            + Book Appointment
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading">Loading appointments…</div>
        ) : (
          <div className="table-card">
            {appointments.length === 0 ? (
              <div className="empty-state">
                No appointments yet.{' '}
                <button
                  onClick={() => setShowModal(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-fg)', cursor: 'pointer', fontWeight: 600, fontSize: 'inherit', fontFamily: 'inherit', padding: 0 }}
                >
                  Book your first one →
                </button>
              </div>
            ) : (
              <>
                <TableControls
                  query={apptFilter.query}
                  onQueryChange={apptFilter.setQuery}
                  filterValue={apptFilter.filterValue}
                  onFilterChange={apptFilter.setFilterValue}
                  filterOptions={STATUS_FILTER_OPTIONS}
                  filtered={apptFilter.filtered.length}
                  total={apptFilter.total}
                  isFiltered={apptFilter.isFiltered}
                  onClearAll={apptFilter.clearAll}
                  placeholder="Search by business or service…"
                />

                {apptFilter.filtered.length === 0 ? (
                  <div className="empty-filtered">No appointments match your search.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <SortableTh label="Business" sortKey="businessName"   sort={apptFilter.sort} onSort={apptFilter.toggleSort} />
                        <SortableTh label="Service"  sortKey="serviceName"    sort={apptFilter.sort} onSort={apptFilter.toggleSort} />
                        <SortableTh label="Date"     sortKey="appointmentDate" sort={apptFilter.sort} onSort={apptFilter.toggleSort} />
                        <th>Time</th>
                        <SortableTh label="Status"   sortKey="status"         sort={apptFilter.sort} onSort={apptFilter.toggleSort} />
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apptFilter.filtered.map((a) => (
                        <tr key={a.id}>
                          <td>{a.businessName}</td>
                          <td>{a.serviceName}</td>
                          <td className="cell-muted">{a.appointmentDate}</td>
                          <td className="cell-muted">{a.appointmentTime}</td>
                          <td>{statusBadge(a.status)}</td>
                          <td>
                            {a.status === 'PENDING' && (
                              <button
                                className="btn-cancel"
                                onClick={() => handleStatusUpdate(a.id, 'CANCELLED')}
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
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
  const [businesses, setBusinesses]       = useState([]);
  const [services, setServices]           = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');
  const [form, setForm] = useState({
    businessId: '',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });

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
    setSelectedService(services.find((s) => String(s.id) === serviceId) || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await appointmentsApi.create({
        businessId:      Number(form.businessId),
        serviceId:       Number(form.serviceId),
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime + ':00',
        notes:           form.notes,
      });
      onBooked(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <h2>Book an Appointment</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business</label>
            <select value={form.businessId} onChange={handleBusinessChange} required>
              <option value="">Select a business…</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.businessName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Service</label>
            <select
              value={form.serviceId}
              onChange={handleServiceChange}
              required
              disabled={!form.businessId}
            >
              <option value="">Select a service…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>
              ))}
            </select>
            {selectedService && (
              <div className="service-info">
                {selectedService.durationMinutes} min
                {selectedService.description && ` · ${selectedService.description}`}
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
            <select
              value={form.appointmentTime}
              onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
              required
            >
              <option value="">Select a time…</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>{slot.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Notes <span style={{ fontWeight: 400, color: 'var(--fg-muted)' }}>(optional)</span></label>
            <input
              type="text"
              placeholder="Any special requests…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-flex" disabled={submitting}>
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
