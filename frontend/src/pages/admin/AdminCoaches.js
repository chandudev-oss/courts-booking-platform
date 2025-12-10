import React, { useState, useEffect } from 'react';
import { coachesAPI } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    expertise: '',
    hourlyRate: '',
    availability: [],
    isActive: true,
  });
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: 0,
    startHour: 9,
    endHour: 17,
  });

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      const response = await coachesAPI.getAll();
      setCoaches(response.data);
    } catch (error) {
      console.error('Error loading coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoach) {
        await coachesAPI.update(editingCoach._id, formData);
        alert('Coach updated successfully');
      } else {
        await coachesAPI.create(formData);
        alert('Coach created successfully');
      }
      loadCoaches();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save coach');
    }
  };

  const handleEdit = (coach) => {
    setEditingCoach(coach);
    setFormData({
      name: coach.name,
      expertise: coach.expertise || '',
      hourlyRate: coach.hourlyRate,
      availability: coach.availability || [],
      isActive: coach.isActive,
    });
    setShowForm(true);
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      const formElement = document.getElementById('coach-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const addAvailability = () => {
    setFormData({
      ...formData,
      availability: [...formData.availability, { ...newAvailability }],
    });
  };

  const removeAvailability = (index) => {
    setFormData({
      ...formData,
      availability: formData.availability.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      expertise: '',
      hourlyRate: '',
      availability: [],
      isActive: true,
    });
    setEditingCoach(null);
    setShowForm(false);
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <AdminLayout title="Manage Coaches">
        <div className="text-center">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage Coaches">
      <div className="flex justify-end items-center mb-4 md:mb-6">
        <button
          onClick={() => {
            if (showForm && !editingCoach) {
              resetForm();
            } else if (!showForm) {
              setShowForm(true);
            } else {
              resetForm();
            }
          }}
          className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          {showForm && !editingCoach ? 'Cancel' : showForm && editingCoach ? 'Cancel Edit' : '+ Add Coach'}
        </button>
      </div>

      {showForm && (
        <div id="coach-form" className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              {editingCoach ? 'Edit Coach' : 'Add New Coach'}
            </h2>
            {editingCoach && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Editing: {editingCoach.name}
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
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
                  Expertise
                </label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    setFormData({ ...formData, hourlyRate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                <select
                  value={newAvailability.dayOfWeek}
                  onChange={(e) =>
                    setNewAvailability({
                      ...newAvailability,
                      dayOfWeek: parseInt(e.target.value),
                    })
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 md:flex-none"
                >
                  {dayNames.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={newAvailability.startHour}
                  onChange={(e) =>
                    setNewAvailability({
                      ...newAvailability,
                      startHour: parseInt(e.target.value),
                    })
                  }
                  className="w-20 md:w-24 border border-gray-300 rounded-md px-2 md:px-3 py-2 text-sm"
                  placeholder="Start"
                />
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={newAvailability.endHour}
                  onChange={(e) =>
                    setNewAvailability({
                      ...newAvailability,
                      endHour: parseInt(e.target.value),
                    })
                  }
                  className="w-20 md:w-24 border border-gray-300 rounded-md px-2 md:px-3 py-2 text-sm"
                  placeholder="End"
                />
                <button
                  type="button"
                  onClick={addAvailability}
                  className="bg-gray-600 text-white px-3 md:px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  Add
                </button>
              </div>
              {formData.availability.map((avail, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1">
                  <span className="text-sm">
                    {dayNames[avail.dayOfWeek]} {avail.startHour}:00 - {avail.endHour}:00
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAvailability(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full md:w-auto"
              >
                {editingCoach ? 'Update' : 'Create'}
              </button>
              {editingCoach && (
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
        {coaches.map((coach) => (
          <div key={coach._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{coach.name}</h3>
                {coach.expertise && (
                  <p className="text-sm text-gray-500">{coach.expertise}</p>
                )}
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  coach.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {coach.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 mb-3">
              <div>
                <span className="text-xs font-medium text-gray-500">Hourly Rate:</span>
                <p className="text-sm font-semibold text-gray-900">₹{coach.hourlyRate}/hour</p>
              </div>
              {coach.availability && coach.availability.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Availability:</span>
                  <div className="mt-1 space-y-1">
                    {coach.availability.slice(0, 2).map((avail, idx) => (
                      <div key={idx} className="text-xs text-gray-600">
                        {dayNames[avail.dayOfWeek]} {avail.startHour}:00-{avail.endHour}:00
                      </div>
                    ))}
                    {coach.availability.length > 2 && (
                      <div className="text-xs text-gray-400">
                        +{coach.availability.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <button
                onClick={() => handleEdit(coach)}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Edit Coach
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
                  Expertise
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hourly Rate
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Availability
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
              {coaches.map((coach) => (
                <tr key={coach._id} className="hover:bg-gray-50">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {coach.name}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coach.expertise || '-'}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₹{coach.hourlyRate}/hour
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">
                    {coach.availability && coach.availability.length > 0 ? (
                      <div className="space-y-1">
                        {coach.availability.slice(0, 2).map((avail, idx) => (
                          <div key={idx} className="text-xs">
                            {dayNames[avail.dayOfWeek]} {avail.startHour}:00-{avail.endHour}:00
                          </div>
                        ))}
                        {coach.availability.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{coach.availability.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No availability set</span>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        coach.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {coach.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(coach)}
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

export default AdminCoaches;

