import React, { useState, useEffect } from 'react';
import { pricingRulesAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const AdminPricingRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'fixed',
    condition: {
      dayOfWeek: [],
      startHour: '',
      endHour: '',
      date: '',
    },
    value: '',
    isActive: true,
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const response = await pricingRulesAPI.getAll();
      setRules(response.data);
    } catch (error) {
      console.error('Error loading pricing rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        condition: {
          ...formData.condition,
          dayOfWeek: formData.condition.dayOfWeek.map(Number),
          startHour: formData.condition.startHour ? Number(formData.condition.startHour) : undefined,
          endHour: formData.condition.endHour ? Number(formData.condition.endHour) : undefined,
          date: formData.condition.date || undefined,
        },
        value: Number(formData.value),
      };

      if (editingRule) {
        await pricingRulesAPI.update(editingRule._id, submitData);
        alert('Pricing rule updated successfully');
      } else {
        await pricingRulesAPI.create(submitData);
        alert('Pricing rule created successfully');
      }
      loadRules();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save pricing rule');
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type,
      condition: {
        dayOfWeek: rule.condition.dayOfWeek || [],
        startHour: rule.condition.startHour || '',
        endHour: rule.condition.endHour || '',
        date: rule.condition.date || '',
        type: rule.condition.type || [], // Add type if exists
      },
      value: rule.value,
      isActive: rule.isActive,
    });
    setShowForm(true);
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      const formElement = document.getElementById('pricing-rule-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pricing rule?')) {
      return;
    }
    try {
      await pricingRulesAPI.delete(id);
      loadRules();
      alert('Pricing rule deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete pricing rule');
    }
  };

  const toggleDayOfWeek = (day) => {
    const days = formData.condition.dayOfWeek;
    if (days.includes(day)) {
      setFormData({
        ...formData,
        condition: {
          ...formData.condition,
          dayOfWeek: days.filter((d) => d !== day),
        },
      });
    } else {
      setFormData({
        ...formData,
        condition: {
          ...formData.condition,
          dayOfWeek: [...days, day],
        },
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'fixed',
      condition: {
        dayOfWeek: [],
        startHour: '',
        endHour: '',
        date: '',
        type: [],
      },
      value: '',
      isActive: true,
    });
    setEditingRule(null);
    setShowForm(false);
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <AdminLayout title="Manage Pricing Rules">
        <div className="text-center">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage Pricing Rules">
      <div className="flex justify-end items-center mb-4 md:mb-6">
        <button
          onClick={() => {
            if (showForm && !editingRule) {
              resetForm();
            } else if (!showForm) {
              setShowForm(true);
            } else {
              resetForm();
            }
          }}
          className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          {showForm && !editingRule ? 'Cancel' : showForm && editingRule ? 'Cancel Edit' : '+ Add Rule'}
        </button>
      </div>

      {showForm && (
        <div id="pricing-rule-form" className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              {editingRule ? 'Edit Pricing Rule' : 'Add New Pricing Rule'}
            </h2>
            {editingRule && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Editing: {editingRule.name}
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Name
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
                  <option value="fixed">Fixed Amount</option>
                  <option value="multiplier">Multiplier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder={formData.type === 'multiplier' ? 'e.g., 1.5' : 'e.g., 50'}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week (Select applicable days)
              </label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDayOfWeek(idx)}
                    className={`px-3 py-1 rounded ${
                      formData.condition.dayOfWeek.includes(idx)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Hour (0-23, optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={formData.condition.startHour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition: { ...formData.condition, startHour: e.target.value },
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Hour (0-23, optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={formData.condition.endHour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition: { ...formData.condition, endHour: e.target.value },
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Date (YYYY-MM-DD, optional)
                </label>
                <input
                  type="date"
                  value={formData.condition.date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition: { ...formData.condition, date: e.target.value },
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full md:w-auto"
              >
                {editingRule ? 'Update' : 'Create'}
              </button>
              {editingRule && (
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
        {rules.map((rule) => (
          <div key={rule._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
                    {rule.type}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                    {rule.value}
                  </span>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  rule.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {rule.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 mb-3">
              {(rule.condition.date || rule.condition.dayOfWeek?.length > 0 || 
                (rule.condition.startHour !== undefined && rule.condition.endHour !== undefined)) && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Condition:</span>
                  <div className="mt-1 text-sm text-gray-700 space-y-1">
                    {rule.condition.date && (
                      <div>Holiday: {rule.condition.date}</div>
                    )}
                    {rule.condition.dayOfWeek?.length > 0 && (
                      <div>
                        Days: {rule.condition.dayOfWeek.map((d) => dayNames[d]).join(', ')}
                      </div>
                    )}
                    {rule.condition.startHour !== undefined &&
                      rule.condition.endHour !== undefined && (
                        <div>
                          Hours: {rule.condition.startHour}:00 - {rule.condition.endHour}:00
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-3 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => handleEdit(rule)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(rule._id)}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
              >
                Delete
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
                  Type
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Value
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Condition
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
              {rules.map((rule) => (
                <tr key={rule._id} className="hover:bg-gray-50">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.name}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{rule.type}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{rule.value}</td>
                  <td className="px-4 lg:px-6 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      {rule.condition.date && (
                        <div className="text-xs">Holiday: {rule.condition.date}</div>
                      )}
                      {rule.condition.dayOfWeek?.length > 0 && (
                        <div className="text-xs">
                          Days: {rule.condition.dayOfWeek.map((d) => dayNames[d]).join(', ')}
                        </div>
                      )}
                      {rule.condition.startHour !== undefined &&
                        rule.condition.endHour !== undefined && (
                          <div className="text-xs">
                            Hours: {rule.condition.startHour}:00 - {rule.condition.endHour}:00
                          </div>
                        )}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rule._id)}
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

export default AdminPricingRules;

