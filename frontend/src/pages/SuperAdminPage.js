import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin';
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

export default function SuperAdminPage() {
  const [users, setUsers]             = useState([]);
  const [customers, setCustomers]     = useState([]);
  const [expandedUser, setExpandedUser]         = useState(null);
  const [userServices, setUserServices]         = useState({});
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([adminApi.getUsers(), adminApi.getCustomers()])
      .then(([usersRes, customersRes]) => {
        setUsers(usersRes.data);
        setCustomers(customersRes.data);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Business owners ── */
  const handleToggleUserServices = async (userId) => {
    if (expandedUser === userId) { setExpandedUser(null); return; }
    setExpandedUser(userId);
    if (!userServices[userId]) {
      try {
        const res = await adminApi.getUserServices(userId);
        setUserServices((prev) => ({ ...prev, [userId]: res.data }));
      } catch {
        setError('Failed to load services');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this business owner and all their data?')) return;
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (expandedUser === id) setExpandedUser(null);
    } catch {
      setError('Failed to delete business owner');
    }
  };

  const handleDeleteService = async (serviceId, userId) => {
    if (!window.confirm('Delete this service? All its appointments will also be removed.')) return;
    try {
      await adminApi.deleteService(serviceId);
      setUserServices((prev) => ({
        ...prev,
        [userId]: prev[userId].filter((s) => s.id !== serviceId),
      }));
    } catch {
      setError('Failed to delete service');
    }
  };

  /* ── Customers ── */
  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer and all their appointments?')) return;
    try {
      await adminApi.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (expandedCustomer === id) setExpandedCustomer(null);
    } catch {
      setError('Failed to delete customer');
    }
  };

  const handleDeleteAppointment = async (appointmentId, customerId) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await adminApi.deleteAppointment(appointmentId);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? { ...c, appointments: c.appointments.filter((a) => a.id !== appointmentId) }
            : c
        )
      );
    } catch {
      setError('Failed to delete appointment');
    }
  };

  const totalAppointments = customers.reduce(
    (sum, c) => sum + (c.appointments?.length || 0), 0
  );

  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">
        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <>
            <div className="page-header">
              <h1>Super Admin Dashboard</h1>
              <p>Full system overview — manage all business owners, services, and customers</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card purple">
                <div className="stat-label">Business Owners</div>
                <div className="stat-value">{users.length}</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-label">Customers</div>
                <div className="stat-value">{customers.length}</div>
              </div>
              <div className="stat-card green">
                <div className="stat-label">Total Appointments</div>
                <div className="stat-value">{totalAppointments}</div>
              </div>
            </div>

            {/* ── Business Owners Panel ── */}
            <div className="table-card" style={{ marginBottom: 20 }}>
              <div className="panel-header">
                <h2 className="panel-title">Business Owners</h2>
              </div>
              {users.length === 0 ? (
                <div className="empty-state">No business owners registered.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Owner</th>
                      <th>Email</th>
                      <th>Business</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <React.Fragment key={u.id}>
                        <tr
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleUserServices(u.id)}
                        >
                          <td className="cell-id">{u.id}</td>
                          <td>{u.name}</td>
                          <td className="cell-muted">{u.email}</td>
                          <td>
                            <span className="cell-expand">
                              {u.businessName}{' '}
                              <span style={{ fontSize: 10, opacity: 0.7 }}>
                                {expandedUser === u.id ? '▲' : '▼'}
                              </span>
                            </span>
                          </td>
                          <td className="cell-muted" style={{ fontSize: 12 }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button className="btn-cancel" onClick={() => handleDeleteUser(u.id)}>
                              Delete Owner
                            </button>
                          </td>
                        </tr>

                        {expandedUser === u.id && (
                          <tr className="sub-table-row">
                            <td colSpan={6}>
                              <div className="sub-table-wrapper">
                                {!userServices[u.id] ? (
                                  <div className="sub-table-empty">Loading services…</div>
                                ) : userServices[u.id].length === 0 ? (
                                  <div className="sub-table-empty">No services configured.</div>
                                ) : (
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Service</th>
                                        <th>Duration</th>
                                        <th>Price</th>
                                        <th>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {userServices[u.id].map((s) => (
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
                                            <button
                                              className="btn-cancel"
                                              onClick={() => handleDeleteService(s.id, u.id)}
                                            >
                                              Delete
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── Customers Panel ── */}
            <div className="table-card">
              <div className="panel-header">
                <h2 className="panel-title">Customers &amp; Appointments</h2>
              </div>
              {customers.length === 0 ? (
                <div className="empty-state">No customers yet.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Appointments</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <React.Fragment key={c.id}>
                        <tr
                          style={{ cursor: c.appointments?.length ? 'pointer' : 'default' }}
                          onClick={() =>
                            c.appointments?.length &&
                            setExpandedCustomer(expandedCustomer === c.id ? null : c.id)
                          }
                        >
                          <td className="cell-id">{c.id}</td>
                          <td>{c.name}</td>
                          <td className="cell-muted">{c.email}</td>
                          <td className="cell-muted">{c.phone || '—'}</td>
                          <td>
                            {c.appointments?.length > 0 ? (
                              <span className="cell-expand">
                                {c.appointments.length}{' '}
                                {c.appointments.length === 1 ? 'appointment' : 'appointments'}{' '}
                                <span style={{ fontSize: 10, opacity: 0.7 }}>
                                  {expandedCustomer === c.id ? '▲' : '▼'}
                                </span>
                              </span>
                            ) : (
                              <span className="cell-muted">None</span>
                            )}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button
                              className="btn-cancel"
                              onClick={() => handleDeleteCustomer(c.id)}
                            >
                              Delete All
                            </button>
                          </td>
                        </tr>

                        {expandedCustomer === c.id && c.appointments?.length > 0 && (
                          <tr className="sub-table-row">
                            <td colSpan={6}>
                              <div className="sub-table-wrapper">
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Business</th>
                                      <th>Service</th>
                                      <th>Date</th>
                                      <th>Time</th>
                                      <th>Status</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {c.appointments.map((a) => (
                                      <tr key={a.id}>
                                        <td>{a.businessName}</td>
                                        <td>{a.serviceName}</td>
                                        <td className="cell-muted">{a.appointmentDate}</td>
                                        <td className="cell-muted">{a.appointmentTime}</td>
                                        <td>{statusBadge(a.status)}</td>
                                        <td>
                                          <button
                                            className="btn-cancel"
                                            onClick={() => handleDeleteAppointment(a.id, c.id)}
                                          >
                                            Delete
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
