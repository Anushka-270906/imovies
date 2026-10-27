import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, PlusCircle, Trash2, Edit3, Star, Clock, AlertTriangle, Search } from 'lucide-react';
import { moviesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteMovieTarget, setDeleteMovieTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await moviesAPI.getAll({ search: search.trim() || undefined, limit: 100 });
      if (res.data.success) {
        setMovies(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load movies list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteMovieTarget) return;

    try {
      setDeleting(true);
      const res = await moviesAPI.delete(deleteMovieTarget._id);
      if (res.data.success) {
        toast.success(`Movie "${deleteMovieTarget.title}" deleted successfully.`);
        setDeleteMovieTarget(null);
        fetchMovies();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete movie.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" />
            Movie Catalog Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add new releases, update metadata, and configure featured movies.
          </p>
        </div>

        <Link
          to="/admin/movies/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Movie
        </Link>
      </div>

      {/* Movies Table */}
      <div className="bg-[#161F30] rounded-2xl border border-[#222F46] overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Loading movie catalog..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F172A] text-slate-400 font-semibold border-b border-[#222F46]">
                <tr>
                  <th className="px-6 py-3.5">Movie</th>
                  <th className="px-6 py-3.5">Genre</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Rating</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Release Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222F46]/70 text-slate-300">
                {movies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                      No movies in catalog.
                    </td>
                  </tr>
                ) : (
                  movies.map((m) => (
                    <tr key={m._id} className="hover:bg-[#1E293B]/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded shadow border border-[#222F46]"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{m.title}</p>
                          <p className="text-[10px] text-slate-400">{m.language} &bull; {m.certification}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(Array.isArray(m.genre) ? m.genre : [m.genre]).join(', ')}
                      </td>
                      <td className="px-6 py-4 font-mono">{m.duration}m</td>
                      <td className="px-6 py-4 font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {m.rating}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            m.status === 'Now Showing'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(m.releaseDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/movies/${m._id}`}
                            className="p-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#222F46]"
                            title="Preview Public Page"
                          >
                            <Film className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteMovieTarget(m)}
                            className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-colors"
                            title="Delete Movie"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteMovieTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#161F30] rounded-2xl border border-red-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Movie</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-white">"{deleteMovieTarget.title}"</strong> from the catalog?
            </p>
            <p className="text-xs text-slate-400">
              Note: If this movie has active confirmed customer bookings, the system will prevent deletion to preserve booking integrity.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222F46]">
              <button
                type="button"
                onClick={() => setDeleteMovieTarget(null)}
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
                {deleting ? 'Deleting...' : 'Delete Movie'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMoviesPage;
