import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, PlusCircle, Trash2, MapPin, Monitor, AlertTriangle } from 'lucide-react';
import { theatersAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminTheatersPage = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const res = await theatersAPI.getAll();
      if (res.data.success) {
        setTheaters(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load theaters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await theatersAPI.delete(deleteTarget._id);
      if (res.data.success) {
        toast.success(`Theater "${deleteTarget.name}" deleted.`);
        setDeleteTarget(null);
        fetchTheaters();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete theater.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-500" />
            Theater & Auditorium Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure theater locations, seating capacities, and tier pricing.
          </p>
        </div>

        <Link
          to="/admin/theaters/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Theater
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading theater venues..." />
      ) : theaters.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#161F30] border border-[#222F46] text-center text-slate-400 text-xs">
          No theaters registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {theaters.map((t) => (
            <div
              key={t._id}
              className="bg-[#161F30] rounded-2xl border border-[#222F46] p-6 shadow-xl space-y-4 hover:border-[#2F3F5E] transition-all"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#222F46]/70 pb-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-red-500" />
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {t.location}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      t.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-colors"
                    title="Delete Theater"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Monitor className="w-4 h-4 text-slate-400" />
                <span>Screen: <strong className="text-white">{t.screenName || 'Standard Screen'}</strong></span>
              </div>

              {/* Tiers summary */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-semibold">Balcony Tier</span>
                  <span className="font-bold text-red-400">${t.balconyPrice}</span>
                  <span className="text-[10px] text-slate-500 block">{t.balconySeats} Seats</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-semibold">Middle Tier</span>
                  <span className="font-bold text-amber-400">${t.middlePrice}</span>
                  <span className="text-[10px] text-slate-500 block">{t.middleSeats} Seats</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-semibold">Regular Tier</span>
                  <span className="font-bold text-emerald-400">${t.regularPrice}</span>
                  <span className="text-[10px] text-slate-500 block">{t.regularSeats} Seats</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#161F30] rounded-2xl border border-red-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Theater</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deleteTarget.name}"</strong>?
            </p>
            <p className="text-xs text-slate-400">
              If any active bookings exist for this theater's scheduled shows, the deletion will be rejected to protect customer tickets.
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
                {deleting ? 'Deleting...' : 'Delete Theater'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheatersPage;
