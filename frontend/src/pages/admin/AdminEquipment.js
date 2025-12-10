import React, { useState, useEffect } from 'react';
import { equipmentAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const AdminEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    totalStock: '',
    perUnitFee: '',
    isActive: true,
  });

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll();
      setEquipment(response.data);
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEquipment) {
        await equipmentAPI.update(editingEquipment._id, formData);
        alert('Equipment updated successfully');
      } else {
        await equipmentAPI.create(formData);
        alert('Equipment created successfully');
      }
      loadEquipment();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save equipment');
    }
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name,
      totalStock: item.totalStock,
      perUnitFee: item.perUnitFee,
      isActive: item.isActive,
    });
    setShowForm(true);
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      const formElement = document.getElementById('equipment-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      totalStock: '',
      perUnitFee: '',
      isActive: true,
    });
    setEditingEquipment(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Manage Equipment">
        <div className="text-center">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage Equipment">
      <div className="flex justify-end items-center mb-4 md:mb-6">
        <button
          onClick={() => {
            if (showForm && !editingEquipment) {
              resetForm();
            } else if (!showForm) {
              setShowForm(true);
            } else {
              resetForm();
            }
          }}
          className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          {showForm && !editingEquipment ? 'Cancel' : showForm && editingEquipment ? 'Cancel Edit' : '+ Add Equipment'}
        </button>
      </div>

      {showForm && (
        <div id="equipment-form" className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h2>
            {editingEquipment && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Editing: {editingEquipment.name}
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Name
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
                  Total Stock
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.totalStock}
                  onChange={(e) =>
                    setFormData({ ...formData, totalStock: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Per Unit Fee (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.perUnitFee}
                  onChange={(e) =>
                    setFormData({ ...formData, perUnitFee: e.target.value })
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
                {editingEquipment ? 'Update' : 'Create'}
              </button>
              {editingEquipment && (
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
        {equipment.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-xs font-medium text-gray-500">Stock</span>
                <p className="text-sm font-semibold text-gray-900">{item.totalStock} units</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Unit Fee</span>
                <p className="text-sm font-semibold text-gray-900">₹{item.perUnitFee}</p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <button
                onClick={() => handleEdit(item)}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Edit Equipment
              </button>
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
                  Name
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Stock
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Per Unit Fee
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
              {equipment.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalStock}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{item.perUnitFee}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
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

export default AdminEquipment;

