import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { Plus, Edit2, Trash2, Tag, Clock, Shield } from 'lucide-react';
import { COMPLAINT_PRIORITY } from '../../utils/constants';

export const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: 'Roads & Infrastructure',
    defaultPriority: 'Medium',
    slaHours: 24,
    color: '#3b82f6'
  });
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories(true);
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormData({
      name: '',
      description: '',
      department: 'Roads & Infrastructure',
      defaultPriority: 'Medium',
      slaHours: 24,
      color: '#3b82f6'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      department: cat.department || 'Roads & Infrastructure',
      defaultPriority: cat.defaultPriority || 'Medium',
      slaHours: cat.slaHours || 24,
      color: cat.color || '#3b82f6'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        const res = await categoryService.updateCategory(editingCat._id, formData);
        if (res.success) {
          toast.success('Category updated successfully');
          setModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await categoryService.createCategory(formData);
        if (res.success) {
          toast.success('Category created successfully');
          setModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this category?')) return;
    try {
      const res = await categoryService.deleteCategory(id);
      if (res.success) {
        toast.success(res.message || 'Category deleted');
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Category & SLA Management</h1>
          <p className="page-subtitle">
            Configure municipal issue domains, resolution turnaround SLAs, and priority baselines.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add New Category
        </Button>
      </div>

      {loading ? (
        <Loader message="Loading categories..." />
      ) : (
        <div className="grid-3">
          {categories.map((cat) => (
            <Card
              key={cat._id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderLeft: `4px solid ${cat.color || 'var(--primary-600)'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase' }}>
                    {cat.department || 'Public Works'}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {cat.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Button variant="secondary" size="sm" icon={Edit2} onClick={() => handleOpenEdit(cat)} />
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(cat._id)} />
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
                {cat.description || 'Standard municipal category domain.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--gray-50)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ color: 'var(--gray-400)' }}>Target SLA</div>
                  <div style={{ fontWeight: 700, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={13} /> {cat.slaHours} Hours
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--gray-400)' }}>Default Priority</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-700)' }}>
                    {cat.defaultPriority}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCat ? 'Edit Category' : 'Create New Category'}
          maxWidth="520px"
        >
          <form onSubmit={handleSubmit}>
            <Input
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Traffic Signal Faults"
              required
            />

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Scope and description of problems falling in this domain..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Responsible Department</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Power & Grid Utilities">Power & Grid Utilities</option>
                  <option value="Sanitation & Environment">Sanitation & Environment</option>
                  <option value="Water Supply & Sewerage">Water Supply & Sewerage</option>
                  <option value="Traffic Police & Safety">Traffic Police & Safety</option>
                  <option value="Civic Maintenance">Civic Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Default Baseline Priority</label>
                <select
                  className="form-select"
                  value={formData.defaultPriority}
                  onChange={(e) => setFormData({ ...formData, defaultPriority: e.target.value })}
                >
                  {Object.values(COMPLAINT_PRIORITY).map((pr) => (
                    <option key={pr} value={pr}>{pr}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <Input
                label="Resolution SLA (Hours)"
                type="number"
                min="1"
                max="360"
                value={formData.slaHours}
                onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) })}
                required
              />
              <Input
                label="Tag Badge Hex Color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">
                {editingCat ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CategoryManagementPage;
