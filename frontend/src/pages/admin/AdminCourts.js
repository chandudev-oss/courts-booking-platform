import React, { useState, useEffect } from 'react';
import { courtsAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const AdminCourts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'indoor',
    basePrice: '',
    imageURL: '',
    rating: 4.5,
    ratingCount: 0,
    isActive: true,
  });

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      // Get all courts including inactive ones for admin view
      const allCourtsResponse = await courtsAPI.getAllAdmin();
      setCourts(allCourtsResponse.data || []);
    } catch (error) {
      console.error('Error loading courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourt) {
        await courtsAPI.update(editingCourt._id, formData);
        alert('Court updated successfully');
      } else {
        await courtsAPI.create(formData);
        alert('Court created successfully');
      }
      loadCourts();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save court');
    }
  };

  const handleEdit = (court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      type: court.type || 'indoor',
      basePrice: court.basePrice,
      imageURL: court.imageURL || '',
      rating: court.rating || 4.5,
      ratingCount: court.ratingCount || 0,
      isActive: court.isActive,
    });
    setShowForm(true);
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      const formElement = document.getElementById('court-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this court?')) {
      return;
    }
    try {
      await courtsAPI.delete(id);
      loadCourts();
      alert('Court deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete court');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'indoor',
      basePrice: '',
      imageURL: '',
      rating: 4.5,
      ratingCount: 0,
      isActive: true,
    });
    setEditingCourt(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Manage Courts">
        <div className="text-center">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage Courts">
      <div className="flex justify-end items-center mb-4 md:mb-6">
        <button
          onClick={() => {
            if (showForm && !editingCourt) {
              resetForm();
            } else if (!showForm) {
              setShowForm(true);
            } else {
              resetForm();
            }
          }}
          className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          {showForm && !editingCourt ? 'Cancel' : showForm && editingCourt ? 'Cancel Edit' : '+ Add Court'}
        </button>
      </div>

      {showForm && (
        <div id="court-form" className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              {editingCourt ? 'Edit Court' : 'Add New Court'}
            </h2>
            {editingCourt && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Editing: {editingCourt.name}
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Court Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (₹/hour)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageURL}
                  onChange={(e) =>
                    setFormData({ ...formData, imageURL: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: parseFloat(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.ratingCount}
                  onChange={(e) =>
                    setFormData({ ...formData, ratingCount: parseInt(e.target.value) || 0 })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.value === 'true' })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full md:w-auto"
              >
                {editingCourt ? 'Update' : 'Create'}
              </button>
              {editingCourt && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors w-full md:w-auto"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {courts.map((court) => (
          <div key={court._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center flex-1">
                {court.imageURL && (
                  <img
                    src={court.imageURL}
                    alt={court.name}
                    className="w-16 h-16 rounded-lg object-cover mr-3 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/64?text=${encodeURIComponent(court.name.charAt(0))}`;
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">{court.name}</h3>
                  {court.ratingCount > 0 && (
                    <p className="text-xs text-gray-500">
                      {court.ratingCount} {court.ratingCount === 1 ? 'review' : 'reviews'}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                  court.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {court.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-xs font-medium text-gray-500">Type</span>
                <div className="mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      court.type === 'indoor'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {court.type ? court.type.charAt(0).toUpperCase() + court.type.slice(1) : 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Rating</span>
                <div className="flex items-center mt-1">
                  <svg
                    className="w-4 h-4 text-yellow-400 fill-current mr-1"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    {court.rating?.toFixed(1) || '4.5'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div>
                <span className="text-xs font-medium text-gray-500">Price</span>
                <p className="text-lg font-bold text-gray-900">₹{court.basePrice}/hour</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(court)}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(court._id)}
                  className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Court
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Base Price
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rating
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courts.map((court) => (
                <tr key={court._id} className="hover:bg-gray-50">
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center">
                      {court.imageURL && (
                        <img
                          src={court.imageURL}
                          alt={court.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/48?text=${encodeURIComponent(court.name.charAt(0))}`;
                          }}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{court.name}</div>
                        {court.ratingCount > 0 && (
                          <div className="text-xs text-gray-500">
                            {court.ratingCount} {court.ratingCount === 1 ? 'review' : 'reviews'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        court.type === 'indoor'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {court.type ? court.type.charAt(0).toUpperCase() + court.type.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">₹{court.basePrice}</div>
                    <div className="text-xs text-gray-500">/hour</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-yellow-400 fill-current mr-1"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">
                        {court.rating?.toFixed(1) || '4.5'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        court.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {court.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(court)}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(court._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCourts;

