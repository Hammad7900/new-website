// src/pages/admin/AdminCollections.jsx
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { fetchCollections, saveCollection, deleteCollection, fetchAdminStoreProducts } from '../../services/api';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const AdminCollections = () => {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cols, prods] = await Promise.all([
        fetchCollections().catch(() => []),
        fetchAdminStoreProducts().catch(() => []),
      ]);
      setCollections(cols || []);
      setProducts(prods || []);
    } catch (err) {
      console.error('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNameChange = (val) => {
    setName(val);
    if (!editingId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setShowModal(true);
  };

  const handleOpenEdit = (col) => {
    setEditingId(col.id);
    setName(col.name);
    setSlug(col.slug);
    setDescription(col.description || '');
    setImage(col.image || '');
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 700;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX_SIZE) {
          h = (h * MAX_SIZE) / w;
          w = MAX_SIZE;
        } else if (h > MAX_SIZE) {
          w = (w * MAX_SIZE) / h;
          h = MAX_SIZE;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        setImage(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setFeedback({ type: 'error', text: 'Collection Name and URL slug are required.' });
      return;
    }

    setSaving(true);
    try {
      const res = await saveCollection({
        id: editingId || undefined,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        image: image.trim(),
      });
      setCollections(res.collections || []);
      setFeedback({
        type: 'success',
        text: editingId ? 'Collection updated successfully.' : 'New collection created.',
      });
      setShowModal(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save collection.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (col) => {
    if (!window.confirm(`Delete the "${col.name}" collection? Products in it will become uncategorized.`)) {
      return;
    }

    try {
      const res = await deleteCollection(col.id, col.slug);
      setCollections(res.collections || []);
      setFeedback({ type: 'success', text: `Collection "${col.name}" deleted.` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Could not delete collection.' });
    }
  };

  const countProductsInCollection = (colSlug) => {
    return products.filter(
      (p) => (p.collectionSlug || '').toLowerCase() === colSlug.toLowerCase()
    ).length;
  };

  return (
    <AdminLayout title="Collections & Department Management">
      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
          <div>
            <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-stone-900" />
              <span>Storefront Departments</span>
            </div>
            <h2 className="font-serif text-2xl text-stone-900">Curated Collections</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Organize your catalog into luxury departments displayed on the storefront navigation and filters.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Collection</span>
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center space-x-3 text-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Collections Table / Grid */}
        <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-stone-400">Loading collections...</div>
          ) : collections.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="font-serif text-lg text-stone-900">No collections created yet</p>
              <p className="text-xs text-stone-500 mt-1 mb-4">
                Create collections to segment and showcase your products cleanly.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                Create your first collection
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 border-b border-stone-200/80 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="py-4 px-6">Collection Name</th>
                    <th className="py-4 px-6">URL Slug</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Assigned Products</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {collections.map((col) => {
                    const prodCount = countProductsInCollection(col.slug);
                    return (
                      <tr key={col.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-4 px-6 font-semibold text-stone-900">
                          <div className="flex items-center space-x-3">
                            {col.image ? (
                              <img src={col.image} alt={col.name} className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0" />
                            ) : (
                              <span className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                                <Layers className="w-4 h-4" />
                              </span>
                            )}
                            <span className="text-sm">{col.name}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono text-stone-500">
                          <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                            /{col.slug}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-stone-500 max-w-xs truncate">
                          {col.description || '—'}
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              prodCount > 0
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>{prodCount} item{prodCount === 1 ? '' : 's'}</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(col)}
                            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors mr-1"
                            title="Edit collection"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(col)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete collection"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for Create / Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200">
              <h3 className="font-serif text-2xl text-stone-900 mb-1">
                {editingId ? 'Edit Collection' : 'Create New Collection'}
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Define the department name, customer-facing URL slug, and summary.
              </p>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Fine Jewelry, Designer Bags, Horology"
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                    placeholder="e.g. fine-jewelry"
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Used in navigation links and API queries. Lowercase letters, numbers, and hyphens only.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Collection Photo (URL or Upload)
                  </label>
                  <div className="flex items-center gap-3">
                    {image && (
                      <img src={image} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0" />
                    )}
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://... image link or upload below"
                      className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <label className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold rounded-lg transition-colors">
                      <span>Upload Photo from Device</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {image && (
                      <button type="button" onClick={() => setImage('')} className="text-[11px] text-rose-600 hover:underline">
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Curated high-grade pieces handcrafted with bespoke finishing..."
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Collection' : 'Create Collection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCollections;
