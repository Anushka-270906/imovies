import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarDays, ArrowLeft, Save } from 'lucide-react';
import { showsAPI, moviesAPI, theatersAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminAddShowPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    movie: '',
    theater: '',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '06:30 PM',
    screenName: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [moviesRes, theatersRes] = await Promise.all([
          moviesAPI.getAll({ limit: 100 }),
          theatersAPI.getAll(),
        ]);

        if (moviesRes.data.success) {
          setMovies(moviesRes.data.data);
          if (moviesRes.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, movie: moviesRes.data.data[0]._id }));
          }
        }

        if (theatersRes.data.success) {
          setTheaters(theatersRes.data.data);
          if (theatersRes.data.data.length > 0) {
            const firstTheater = theatersRes.data.data[0];
            setFormData((prev) => ({
              ...prev,
              theater: firstTheater._id,
              screenName: firstTheater.screenName || 'Screen 1',
            }));
          }
        }
      } catch (err) {
        toast.error('Failed to load movies or theaters for scheduling.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTheaterChange = (theaterId) => {
    const selected = theaters.find((t) => t._id === theaterId);
    setFormData((prev) => ({
      ...prev,
      theater: theaterId,
      screenName: selected?.screenName || 'Screen 1',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.movie || !formData.theater || !formData.showDate || !formData.showTime) {
      toast.error('Movie, Theater, Date, and Show Time are all required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await showsAPI.create(formData);
      if (res.data.success) {
        toast.success('Showtime scheduled successfully!');
        navigate('/admin/shows');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule show.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading movies and theaters..." />;

  const commonTimes = ['10:30 AM', '01:15 PM', '04:00 PM', '06:30 PM', '09:45 PM', '11:15 PM'];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/shows"
          className="p-2 rounded-xl bg-[#161F30] border border-[#222F46] text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-white">Schedule New Show</h2>
          <p className="text-xs text-slate-400">Assign a theatrical film to an auditorium time slot.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#161F30] rounded-3xl border border-[#222F46] p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Select Movie */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Select Movie *</label>
          <select
            value={formData.movie}
            onChange={(e) => setFormData({ ...formData, movie: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
          >
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title} ({m.certification} • {m.duration}m)
              </option>
            ))}
          </select>
        </div>

        {/* Select Theater */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Select Theater / Venue *</label>
          <select
            value={formData.theater}
            onChange={(e) => handleTheaterChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
          >
            {theaters.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.location})
              </option>
            ))}
          </select>
        </div>

        {/* Screen */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Screen / Auditorium Name</label>
          <input
            type="text"
            value={formData.screenName}
            onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
          />
        </div>

        {/* Show Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Show Date *</label>
          <input
            type="date"
            required
            value={formData.showDate}
            onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
          />
        </div>

        {/* Show Time */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Show Time Slot *</label>
          <div className="grid grid-cols-3 gap-2">
            {commonTimes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, showTime: t })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  formData.showTime === t
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                    : 'bg-[#0F172A] border-[#222F46] text-slate-300 hover:border-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <span className="text-[11px] text-slate-400 block mb-1">Or custom time string:</span>
            <input
              type="text"
              placeholder="e.g. 07:15 PM"
              value={formData.showTime}
              onChange={(e) => setFormData({ ...formData, showTime: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-[#0F172A] border border-[#222F46] focus:border-red-500 text-white text-xs outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222F46]">
          <Link
            to="/admin/shows"
            className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white rounded-xl border border-[#222F46]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Scheduling...' : 'Save & Publish Show'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddShowPage;
