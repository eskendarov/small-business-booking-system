import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';

const statusBadge = (status) => {
  const cls = {
    PENDING: 'badge badge-pending',
    CONFIRMED: 'badge badge-confirmed',
    CANCELLED: 'badge badge-cancelled',
    COMPLETED: 'badge badge-completed',
  }[status] || 'badge';
  return <span className={cls}>{status}</span>;
};

export default function SuperAdminPage() {
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userServices, setUserServices] = useState({});
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([adminApi.getUsers(), adminApi.getCustomers()])
      .then(([usersRes, customersRes]) => {
        setUsers(usersRes.data);
        setCustomers(customersRes.data);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  // Business owners
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
    if (!window.confirm('Delete this service? All its appointments will also be deleted.')) return;
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

  // Customers
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

  const handleLogout = () => { logout(); navigate('/login'); };

  const totalAppointments = customers.reduce((sum, c) => sum + (c.appointments?.length || 0), 0);

  return (
    <div className="layout">
      <nav className="navbar">
        <span className="navbar-brand">BookingApp</span>
        <div className="navbar-user">
          <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
            Super Admin
          </span>
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
            <div className="page-header">
              <h1>Super Admin Dashboard</h1>
              <p>Full system overview — manage all business owners and customers</p>
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

            {/* Panel 1 — Business Owners */}
            <div className="table-card" style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Business Owners</h2>
              {users.length === 0 ? (
                <div className="empty-state">No business owners registered.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Owner Name</th>
                      <th>Email</th>
                      <th>Business</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <React.Fragment key={u.id}>
                        <tr style={{ cursor: 'pointer' }} onClick={() => handleToggleUserServices(u.id)}>
                          <td style={{ color: '#9ca3af', fontSize: 12 }}>{u.id}</td>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span style={{ color: '#6366f1', fontWeight: 600 }}>
                              {u.businessName}{' '}
                              {expandedUser === u.id ? '▲' : '▼'}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: '#6b7280' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button className="btn-cancel" onClick={() => handleDeleteUser(u.id)}>
                              Delete Owner
                            </button>
                          </td>
                        </tr>
                        {expandedUser === u.id && (
                          <tr>
                            <td colSpan={6} style={{ padding: '0 16px 12px', background: '#f9fafb' }}>
                              {!userServices[u.id] ? (
                                <div style={{ padding: '8px 0', color: '#9ca3af', fontSize: 13 }}>Loading services...</div>
                              ) : userServices[u.id].length === 0 ? (
                                <div style={{ padding: '8px 0', color: '#9ca3af', fontSize: 13 }}>No services.</div>
                              ) : (
                                <table style={{ width: '100%', fontSize: 13 }}>
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
                                        <td>{s.name}{s.description && <span style={{ color: '#9ca3af', marginLeft: 6 }}>— {s.description}</span>}</td>
                                        <td>{s.durationMinutes} min</td>
                                        <td>${s.price}</td>
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
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Panel 2 — Customers + Appointments */}
            <div className="table-card">
              <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>
                Customers &amp; Their Appointments
              </h2>
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
                          <td style={{ color: '#9ca3af', fontSize: 12 }}>{c.id}</td>
                          <td>{c.name}</td>
                          <td>{c.email}</td>
                          <td>{c.phone || '—'}</td>
                          <td>
                            {c.appointments?.length > 0 ? (
                              <span style={{ color: '#6366f1', fontWeight: 600 }}>
                                {c.appointments.length} appointment{c.appointments.length !== 1 ? 's' : ''}{' '}
                                {expandedCustomer === c.id ? '▲' : '▼'}
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>None</span>
                            )}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button className="btn-cancel" onClick={() => handleDeleteCustomer(c.id)}>
                              Delete All
                            </button>
                          </td>
                        </tr>
                        {expandedCustomer === c.id && c.appointments?.length > 0 && (
                          <tr>
                            <td colSpan={6} style={{ padding: '0 16px 12px', background: '#f9fafb' }}>
                              <table style={{ width: '100%', fontSize: 13 }}>
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
                                      <td>{a.appointmentDate}</td>
                                      <td>{a.appointmentTime}</td>
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
