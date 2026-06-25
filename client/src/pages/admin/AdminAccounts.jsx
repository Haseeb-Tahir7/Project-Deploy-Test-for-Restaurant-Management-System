import { useEffect, useState } from 'react';
import { getUsers, createUser, deleteUser } from '../../api/users';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime } from '../../utils/helpers';

export default function AdminAccounts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    try {
      await createUser(form);
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this salesperson account?')) return;
    await deleteUser(id);
    fetchUsers();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="section-header">
        <h1>Sales Accounts</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          Add Account
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}

      {showForm && (
        <form className="card inline-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Create Account</button>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Created</th><th>Action</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id || u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{formatDateTime(u.createdAt)}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id || u.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
