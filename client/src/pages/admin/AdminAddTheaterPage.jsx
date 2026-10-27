import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowLeft, Save } from 'lucide-react';
import { theatersAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminAddTheaterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    screenName: 'Screen 1 (Dolby 7.1 Atmos)',
    balconyPrice: 20,
    balconySeats: 20,
    middlePrice: 15,
    middleSeats: 30,
    regularPrice: 10,
    regularSeats: 30,
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.location.trim()) {
      toast.error('Theater name and location are required.');
      return;
    }

    if (
      Number(formData.balconySeats) <= 0 ||
      Number(formData.middleSeats) <= 0 ||
      Number(formData.regularSeats) <= 0
    ) {
      toast.error('All tier seat counts must be greater than zero.');
      return;
    }

    try {
      setLoading(true);
      const res = await theatersAPI.create(formData);
      if (res.data.success) {
        toast.success(`Theater "${formData.name}" registered successfully!`);
        navigate('/admin/theaters');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create theater.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/theaters"
          className="p-2 rounded-xl bg-[#161F30] border border-[#222F46] text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-white">Add New Theater</h2>
          <p className="text-xs text-slate-400">Configure auditorium setup and tier capacities.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#161F30] rounded-3xl border border-[#222F46] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Theater Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. iMovies IMAX - City Center"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white placeholder-slate-500 text-xs outline-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Location Address / City *</label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. 500 Broadway Avenue, Downtown"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white placeholder-slate-500 text-xs outline-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Auditorium / Screen Name</label>
            <input
              type="text"
              name="screenName"
              placeholder="e.g. Screen 1 (Dolby 7.1 Atmos)"
              value={formData.screenName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
            />
          </div>
        </div>

        {/* Tier Seats & Pricing */}
        <div className="space-y-4 pt-4 border-t border-[#222F46]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Seating Tiers & Pricing Configuration</h3>

          {/* Balcony */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#0F172A] border border-[#222F46]">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-red-400">Balcony Seat Price ($) *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="balconyPrice"
                required
                value={formData.balconyPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-[#161F30] border border-[#222F46] text-white text-xs outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Balcony Seat Capacity *</label>
              <input
                type="number"
                min="1"
                name="balconySeats"
                required
                value={formData.balconySeats}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-[#161F30] border border-[#222F46] text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Middle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#0F172A] border border-[#222F46]">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-amber-400">Middle Seat Price ($) *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="middlePrice"
                required
                value={formData.middlePrice}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-[#161F30] border border-[#222F46] text-white text-xs outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Middle Seat Capacity *</label>
              <input
                type="number"
                min="1"
                name="middleSeats"
                required
                value={formData.middleSeats}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-[#161F30] border border-[#222F46] text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Regular */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#0F172A] border border-[#222F46]">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-emerald-400">Regular Seat Price ($) *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="regularPrice"
                required
                value={formData.regularPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-[#161F30] border border-[#222F46] text-white text-xs outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Regular Seat Capacity *</label>
              <input
                type="number"
                min="1"
                name="regularSeats"
                required
                value={formData.regularSeats}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-[#161F30] border border-[#222F46] text-white text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222F46]">
          <Link
            to="/admin/theaters"
            className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white rounded-xl border border-[#222F46]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating Theater...' : 'Save & Register Theater'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddTheaterPage;
