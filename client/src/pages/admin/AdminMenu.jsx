import { useEffect, useState } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../../api/menu';
import EmojiPicker from '../../components/EmojiPicker';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ emoji: '🍕', name: '', price: '', category: 'General' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchItems = async () => {
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setError('Name and price are required.');
      return;
    }
    await createMenuItem(form);
    setForm({ emoji: '🍕', name: '', price: '', category: 'General' });
    fetchItems();
  };

  const handleEdit = async (id) => {
    await updateMenuItem(id, editForm);
    setEditId(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this item from menu?')) return;
    await deleteMenuItem(id);
    fetchItems();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <h1>Menu Management</h1>
      {error && <p className="error-msg">{error}</p>}

      <form className="card inline-form" onSubmit={handleAdd}>
        <h3>Add Item</h3>
        <EmojiPicker value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e })} />
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input type="number" min="0" step="0.01" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Add Item</button>
      </form>

      <div className="menu-grid">
        {items.filter((i) => i.isAvailable !== false).map((item) => (
          <div key={item._id} className="card menu-card">
            {editId === item._id ? (
              <>
                <EmojiPicker value={editForm.emoji} onChange={(e) => setEditForm({ ...editForm, emoji: e })} />
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                <input type="number" value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => handleEdit(item._id)}>Save</button>
                  <button className="btn" onClick={() => setEditId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <span className="menu-emoji">{item.emoji}</span>
                <h3>{item.name}</h3>
                <p>{formatCurrency(item.price)}</p>
                <p className="text-muted">{item.category}</p>
                <div className="btn-group">
                  <button className="btn" onClick={() => { setEditId(item._id); setEditForm(item); }}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
