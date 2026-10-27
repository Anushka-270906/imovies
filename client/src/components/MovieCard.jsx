import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, Heart, Ticket, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { favoritesAPI } from '../services/api';

const MovieCard = ({ movie, isFavorite: initialFavorite = false, onFavoriteToggle }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [favLoading, setFavLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDuration = (mins) => {
    if (!mins) return '2h 00m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in to add movies to your favorites.');
      navigate('/login');
      return;
    }

    try {
      setFavLoading(true);
      if (isFavorite) {
        await favoritesAPI.remove(movie._id);
        setIsFavorite(false);
        toast.info(`Removed "${movie.title}" from favorites`);
      } else {
        await favoritesAPI.add(movie._id);
        setIsFavorite(true);
        toast.success(`Added "${movie.title}" to favorites!`);
      }
      if (onFavoriteToggle) {
        onFavoriteToggle(movie._id, !isFavorite);
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    } finally {
      setFavLoading(false);
    }
  };

  const fallbackPoster = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="group relative bg-[#161F30] rounded-2xl overflow-hidden border border-[#222F46] hover:border-red-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/30 flex flex-col h-full">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={imageError ? fallbackPoster : movie.posterUrl || fallbackPoster}
          alt={movie.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161F30] via-transparent to-black/50 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {movie.rating ? movie.rating.toFixed(1) : '8.0'}
          </span>

          <button
            onClick={handleFavoriteClick}
            disabled={favLoading}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${
              isFavorite
                ? 'bg-red-600/80 border-red-500 text-white shadow-lg shadow-red-600/40'
                : 'bg-black/50 border-white/20 text-slate-300 hover:text-white hover:bg-black/80'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Certification & Language Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-600/80 text-white">
            {movie.certification || 'PG-13'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
            {movie.language || 'English'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          <Link to={`/movies/${movie._id}`}>
            <h3 className="font-bold text-lg text-white group-hover:text-red-400 transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>

          {/* Genre Pills */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {(Array.isArray(movie.genre) ? movie.genre : [movie.genre || 'Action']).slice(0, 3).map((g, idx) => (
              <span key={idx} className="text-[11px] text-slate-400">
                {g}{idx < Math.min(movie.genre.length, 3) - 1 ? ' •' : ''}
              </span>
            ))}
          </div>

          {/* Meta (Duration & Release Year) */}
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatDuration(movie.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {new Date(movie.releaseDate).getFullYear() || 2024}
            </span>
          </div>

          {/* Description preview */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
            {movie.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#222F46]/80 mt-auto">
          <Link
            to={`/movies/${movie._id}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#222F46] text-xs font-semibold transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            Details
          </Link>
          <Link
            to={`/movies/${movie._id}#booking`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/30 hover:shadow-red-600/50 transition-all"
          >
            <Ticket className="w-3.5 h-3.5" />
            Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
