import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, PlusCircle, Trash2, MapPin, Film, Clock, AlertTriangle } from 'lucide-react';
import { showsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const fetchShows = async () => {
    try {
      setLoading(true);
      const res = await showsAPI.getAll();
      if (res.data.success) {
        setShows(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load scheduled shows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await showsAPI.delete(deleteTarget._id);
      if (res.data.success) {
        toast.success('Showtime removed successfully.');
        setDeleteTarget(null);
        fetchShows();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete show.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-red-500" />
            Show Schedule Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Link movies to auditoriums, schedule showtimes, and monitor booking loads.
          </p>
        </div>

        <Link
          to="/admin/shows/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Schedule New Show
        </Link>
      </div>

      <div className="bg-[#161F30] rounded-2xl border border-[#222F46] overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Retrieving scheduled showtimes..." />
        ) : shows.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No shows currently scheduled.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F172A] text-slate-400 font-semibold border-b border-[#222F46]">
                <tr>
                  <th className="px-6 py-3.5">Movie</th>
                  <th className="px-6 py-3.5">Theater & Screen</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Booked Seats</th>
                  <th className="px-6 py-3.5">Pricing (Balcony / Mid / Reg)</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222F46]/70 text-slate-300">
                {shows.map((s) => (
                  <tr key={s._id} className="hover:bg-[#1E293B]/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={s.movie?.posterUrl}
                        alt={s.movie?.title}
                        className="w-9 h-12 object-cover rounded shadow border border-[#222F46]"
                      />
                      <div>
                        <p className="font-bold text-white text-sm">{s.movie?.title}</p>
                        <p className="text-[10px] text-slate-400">{s.movie?.language} &bull; {s.movie?.certification}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{s.theater?.name}</p>
                      <p className="text-[10px] text-slate-400">{s.screenName || s.theater?.screenName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{s.showDate}</p>
                      <p className="text-red-400 font-bold">{s.showTime}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#0F172A] border border-[#222F46] text-white">
                        {s.bookedSeats?.length || 0} seats booked
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      <span className="text-red-400 font-bold">${s.balconyPrice}</span> /{' '}
                      <span className="text-amber-400 font-bold">${s.middlePrice}</span> /{' '}
                      <span className="text-emerald-400 font-bold">${s.regularPrice}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/booking/${s._id}`}
                          className="p-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#222F46]"
                          title="Open Seat Layout"
                        >
                          <Film className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-colors"
                          title="Delete Show"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#161F30] rounded-2xl border border-red-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Scheduled Show</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel the show for <strong className="text-white">{deleteTarget.movie?.title}</strong> on{' '}
              <strong className="text-white">{deleteTarget.showDate}</strong> at <strong className="text-white">{deleteTarget.showTime}</strong>?
            </p>
            <p className="text-xs text-slate-400">
              Shows with confirmed customer bookings cannot be deleted without first handling cancellations.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222F46]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-[#222F46]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md shadow-red-600/30"
              >
                {deleting ? 'Removing...' : 'Delete Show'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowsPage;
