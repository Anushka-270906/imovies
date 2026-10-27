import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Film, ArrowRight } from 'lucide-react';
import { favoritesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoritesAPI.getAll();
      if (res.data.success) {
        setFavorites(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (movieId, isFav) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((m) => m._id !== movieId));
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#222F46] pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          My Watchlist & Favorites
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Keep track of movies you're excited to see and book showtimes instantly.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving your favorite movies..." />
      ) : favorites.length === 0 ? (
        <div className="bg-[#111827] rounded-3xl border border-[#222F46] p-16 text-center space-y-4 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Favorites Saved</h3>
          <p className="text-sm text-slate-400">
            You haven't bookmarked any movies to your watchlist yet. Click the heart icon on any movie card to add it here.
          </p>
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
          >
            Explore Movies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              isFavorite={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
