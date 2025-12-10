import React, { useState, useEffect, useCallback } from 'react';
import { bookingsAPI, coachesAPI, equipmentAPI, pricingAPI } from '../services/api';

const BookingModal = ({ court, startTime, endTime, onClose, onSuccess }) => {
  const [coaches, setCoaches] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState('');
  const [equipmentQuantities, setEquipmentQuantities] = useState({});
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCoaches();
    loadEquipment();
  }, []);

  const calculatePrice = useCallback(async () => {
    if (!court || !startTime || !endTime) {
      return;
    }
    
    setCalculating(true);
    setError(null);
    try {
      const equipmentArray = Object.entries(equipmentQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([equipmentId, quantity]) => ({ equipmentId, quantity }));

      const response = await pricingAPI.estimate({
        courtId: court._id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        equipment: equipmentArray,
        coachId: selectedCoach || null,
      });

      setPricing(response.data);
    } catch (error) {
      console.error('Error calculating price:', error);
      if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_EMPTY_RESPONSE')) {
        setError('Unable to calculate price. Please ensure the backend server is running.');
      } else {
        setError('Failed to calculate price. Please try again.');
      }
    } finally {
      setCalculating(false);
    }
  }, [court, startTime, endTime, equipmentQuantities, selectedCoach]);

  useEffect(() => {
    if (court && startTime && endTime) {
      calculatePrice();
    }
  }, [calculatePrice, court, startTime, endTime]);

  const loadCoaches = async () => {
    try {
      const response = await coachesAPI.getAll();
      setCoaches(response.data);
    } catch (error) {
      console.error('Error loading coaches:', error);
    }
  };

  const loadEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll();
      setEquipment(response.data);
      const initialQuantities = {};
      response.data.forEach((item) => {
        initialQuantities[item._id] = 0;
      });
      setEquipmentQuantities(initialQuantities);
    } catch (error) {
      console.error('Error loading equipment:', error);
    }
  };


  const handleEquipmentChange = (equipmentId, quantity) => {
    setEquipmentQuantities({
      ...equipmentQuantities,
      [equipmentId]: parseInt(quantity) || 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const equipmentArray = Object.entries(equipmentQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([equipmentId, quantity]) => ({ equipmentId, quantity }));

      await bookingsAPI.create({
        courtId: court._id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        equipment: equipmentArray,
        coachId: selectedCoach || null,
      });

      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_EMPTY_RESPONSE')
                            ? 'Unable to connect to the server. Please ensure the backend is running.'
                            : 'Booking failed. Please try again.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Book {court.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            <strong>Time:</strong> {startTime.toLocaleString()} - {endTime.toLocaleString()}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {coaches.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Coach (Optional)
              </label>
              <select
                value={selectedCoach}
                onChange={(e) => setSelectedCoach(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">No Coach</option>
                {coaches.map((coach) => (
                  <option key={coach._id} value={coach._id}>
                    {coach.name} - ₹{coach.hourlyRate}/hour
                  </option>
                ))}
              </select>
            </div>
          )}

          {equipment.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment (Optional)
              </label>
              {equipment.map((item) => (
                <div key={item._id} className="flex items-center justify-between mb-2">
                  <span>{item.name} - ₹{item.perUnitFee}/unit</span>
                  <input
                    type="number"
                    min="0"
                    max={item.totalStock}
                    value={equipmentQuantities[item._id] || 0}
                    onChange={(e) => handleEquipmentChange(item._id, e.target.value)}
                    className="w-20 border border-gray-300 rounded-md px-2 py-1"
                  />
                </div>
              ))}
            </div>
          )}

          {calculating ? (
            <div className="mb-4 text-gray-600">Calculating price...</div>
          ) : pricing && (
            <div className="mb-4 bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Pricing Breakdown</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₹{pricing.basePrice.toFixed(2)}</span>
                </div>
                {pricing.peakFee > 0 && (
                  <div className="flex justify-between">
                    <span>Peak Fee:</span>
                    <span>₹{pricing.peakFee.toFixed(2)}</span>
                  </div>
                )}
                {pricing.weekendFee > 0 && (
                  <div className="flex justify-between">
                    <span>Weekend Fee:</span>
                    <span>₹{pricing.weekendFee.toFixed(2)}</span>
                  </div>
                )}
                {pricing.equipmentFee > 0 && (
                  <div className="flex justify-between">
                    <span>Equipment Fee:</span>
                    <span>₹{pricing.equipmentFee.toFixed(2)}</span>
                  </div>
                )}
                {pricing.coachFee > 0 && (
                  <div className="flex justify-between">
                    <span>Coach Fee:</span>
                    <span>₹{pricing.coachFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>₹{pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || calculating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

