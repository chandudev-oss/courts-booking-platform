import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { courtsAPI } from '../services/api';
import BookingModal from '../components/BookingModal';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      const response = await courtsAPI.getAll();
      setCourts(response.data);
    } catch (error) {
      console.error('Error loading courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      slots.push({
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`,
        value: hour
      });
    }
    return slots;
  };

  const handleSlotClick = (court, slot) => {
    if (!isAuthenticated) {
      alert('Please login to book a court');
      return;
    }

    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    const startTime = new Date(`${selectedDate}T${slot.start}:00`);
    const endTime = new Date(`${selectedDate}T${slot.end}:00`);

    setSelectedCourt(court);
    setSelectedSlot({ startTime, endTime });
    setShowModal(true);
  };

  const handleBookingSuccess = () => {
    setShowModal(false);
    setSelectedCourt(null);
    setSelectedSlot(null);
    alert('Booking successful!');
  };

  const getFilteredCourts = () => {
    return courts.filter((court) => {
      const typeMatch = filterType === '' || court.type === filterType;
      return typeMatch;
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading courts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Courts</h1>

      <div className="mb-8 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            min={today}
            max={maxDate}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-full"
          />
        </div>

        <div className="flex-1 flex justify-end">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
            <button
              onClick={() => setFilterType('')}
              aria-pressed={filterType === ''}
              className={`min-w-[96px] text-sm px-4 py-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                filterType === ''
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
              }`}
            >
              All
            </button>

            <button
              onClick={() => setFilterType('indoor')}
              aria-pressed={filterType === 'indoor'}
              className={`min-w-[96px] text-sm px-4 py-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                filterType === 'indoor'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
              }`}
            >
              Indoor
            </button>

            <button
              onClick={() => setFilterType('outdoor')}
              aria-pressed={filterType === 'outdoor'}
              className={`min-w-[96px] text-sm px-4 py-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                filterType === 'outdoor'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
              }`}
            >
              Outdoor
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredCourts().map((court) => (
          <div key={court._id} className="bg-white rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            {/* Court Image */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              <img
                src={court.imageURL}
                alt={court.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-white/75 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1 shadow-md border border-white/40">
                <span className="inline-block text-blue-800 text-xs font-semibold px-2 py-0.5 rounded capitalize opacity-95">
                  {court.type}
                </span>
              </div>
            </div>

            {/* Court Details */}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{court.name}</h2>
              <div className="flex items-center gap-3 mb-2 text-sm text-gray-700">
                <span className="text-yellow-400">★</span>
                <span className="font-semibold">{court.rating}</span>
                <span className="text-gray-500 text-xs">({court.ratingCount})</span>
              </div>
              <p className="text-green-600 font-bold mb-4">₹{court.basePrice}/hour</p>

              {selectedDate ? (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Available Slots</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {generateTimeSlots().map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSlotClick(court, slot)}
                        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded text-blue-800"
                      >
                        {slot.start}
                      </button>
                    ))}
                  </div>
               </div>
              ) : (
                <div className="mt-4 text-center text-gray-500 text-sm">Select a date to see available slots</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedCourt && selectedSlot && (
        <BookingModal
          court={selectedCourt}
          startTime={selectedSlot.startTime}
          endTime={selectedSlot.endTime}
          onClose={() => setShowModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default Home;

