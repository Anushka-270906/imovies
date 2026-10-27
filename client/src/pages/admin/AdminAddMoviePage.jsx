import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Film, ArrowLeft, Save, Plus } from 'lucide-react';
import { moviesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminAddMoviePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Action, Sci-Fi',
    releaseDate: new Date().toISOString().split('T')[0],
    duration: 120,
    certification: 'PG-13',
    language: 'English',
    rating: 8.5,
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    director: '',
    cast: '',
    isFeatured: false,
    isTrending: false,
    status: 'Now Showing',
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

    if (!formData.title.trim() || !formData.description.trim() || !formData.posterUrl.trim()) {
      toast.error('Title, description, and poster image URL are required.');
      return;
    }

    try {
      setLoading(true);

      // Format trailer URL into embed link if standard watch link
      let trailerFormatted = formData.trailerUrl.trim();
      if (trailerFormatted.includes('watch?v=')) {
        trailerFormatted = trailerFormatted.replace('watch?v=', 'embed/');
      }

      const payload = {
        ...formData,
        trailerUrl: trailerFormatted,
      };

      const res = await moviesAPI.create(payload);
      if (res.data.success) {
        toast.success(`Movie "${formData.title}" added to catalog!`);
        navigate('/admin/movies');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create movie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/movies"
            className="p-2 rounded-xl bg-[#161F30] border border-[#222F46] text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-black text-white">Add New Movie</h2>
            <p className="text-xs text-slate-400">Fill in cinematic details and poster artwork.</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#161F30] rounded-3xl border border-[#222F46] p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Movie Title *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Deadpool & Wolverine"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white placeholder-slate-500 text-xs outline-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Synopsis / Description *</label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Detailed plot synopsis..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white placeholder-slate-500 text-xs outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Genre (comma-separated)</label>
            <input
              type="text"
              name="genre"
              required
              placeholder="Action, Sci-Fi, Adventure"
              value={formData.genre}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Language</label>
            <input
              type="text"
              name="language"
              required
              placeholder="English"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Duration (Minutes)</label>
            <input
              type="number"
              name="duration"
              min="1"
              required
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Certification</label>
            <select
              name="certification"
              value={formData.certification}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
            >
              <option value="PG">PG</option>
              <option value="PG-13">PG-13</option>
              <option value="R">R</option>
              <option value="NC-17">NC-17</option>
              <option value="U/A">U/A</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Rating (0 - 10)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Release Date</label>
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
            />
          </div>
        </div>

        {/* Media URLs */}
        <div className="space-y-4 pt-4 border-t border-[#222F46]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Media Assets & Artwork</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Poster Image URL *</label>
            <input
              type="url"
              name="posterUrl"
              required
              placeholder="https://images.unsplash.com/..."
              value={formData.posterUrl}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white placeholder-slate-500 text-xs outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Backdrop / Banner Image URL</label>
            <input
              type="url"
              name="backdropUrl"
              placeholder="https://images.unsplash.com/..."
              value={formData.backdropUrl}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white placeholder-slate-500 text-xs outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">YouTube Trailer Embed or Watch URL</label>
            <input
              type="text"
              name="trailerUrl"
              placeholder="https://www.youtube.com/embed/..."
              value={formData.trailerUrl}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white placeholder-slate-500 text-xs outline-none"
            />
          </div>
        </div>

        {/* Status & Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#222F46]">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Theatrical Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] text-white text-xs outline-none"
            >
              <option value="Now Showing">Now Showing</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ended">Ended</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="rounded accent-red-600"
              />
              <span>Featured on Homepage Hero</span>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isTrending"
                checked={formData.isTrending}
                onChange={handleChange}
                className="rounded accent-red-600"
              />
              <span>Trending in Theaters</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#222F46]">
          <Link
            to="/admin/movies"
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
            {loading ? 'Saving Movie...' : 'Save & Publish Movie'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddMoviePage;
