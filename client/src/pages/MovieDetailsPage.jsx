import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Film,
  Star,
  Clock,
  Calendar,
  Heart,
  Play,
  MapPin,
  Ticket,
  Users,
  Video,
  ArrowLeft,
} from 'lucide-react';
import { moviesAPI, favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const res = await moviesAPI.getById(id);
        if (res.data.success) {
          setMovie(res.data.data);
          setShows(res.data.shows || []);

          // Pick the first available date by default
          if (res.data.shows && res.data.shows.length > 0) {
            setSelectedDate(res.data.shows[0].showDate);
          }
        }

        if (isAuthenticated) {
          try {
            const favRes = await favoritesAPI.getAll();
            if (favRes.data.success) {
              const hasFav = favRes.data.data.some((m) => m._id === id);
              setIsFavorite(hasFav);
            }
          } catch (e) {
            console.warn('Error checking favorite:', e);
          }
        }
      } catch (err) {
        toast.error('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id, isAuthenticated]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to save movies to favorites');
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.remove(id);
        setIsFavorite(false);
        toast.info('Removed from favorites');
      } else {
        await favoritesAPI.add(id);
        setIsFavorite(true);
        toast.success('Added to favorites!');
      }
    } catch (e) {
      toast.error('Could not update favorites');
    }
  };

  if (loading) return <LoadingSpinner text="Loading movie information..." />;
  if (!movie) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-slate-400 space-y-4">
        <Film className="w-16 h-16 mx-auto text-slate-600" />
        <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
        <Link to="/movies" className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold">
          Back to Movies
        </Link>
      </div>
    );
  }

  // Filter unique dates from shows
  const uniqueDates = Array.from(new Set(shows.map((s) => s.showDate))).sort();

  // Filter shows by selected date
  const filteredShows = shows.filter((s) => s.showDate === selectedDate);

  // Group shows by theater
  const showsByTheater = filteredShows.reduce((acc, show) => {
    const theaterId = show.theater?._id || 'unknown';
    if (!acc[theaterId]) {
      acc[theaterId] = {
        theater: show.theater,
        shows: [],
      };
    }
    acc[theaterId].shows.push(show);
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      {/* Backdrop Banner */}
      <div className="relative w-full h-[45vh] lg:h-[55vh] overflow-hidden">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover filter brightness-40 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17] via-[#0A0E17]/80 to-transparent" />

        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/movies"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-xs font-semibold text-slate-300 hover:text-white border border-[#222F46] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </Link>
        </div>
      </div>

      {/* Main Details Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 relative z-20 space-y-12 pb-20">
        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row gap-8 bg-[#161F30]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#222F46] shadow-2xl">
          {/* Poster */}
          <div className="w-48 sm:w-64 shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border border-[#222F46] relative aspect-[2/3]">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* Info Details */}
          <div className="flex flex-col justify-between flex-grow gap-4">
            <div className="space-y-4">
              {/* Title & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-600 text-white shadow">
                    {movie.certification || 'PG-13'}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#111827] text-slate-300 border border-[#222F46]">
                    {movie.language}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#111827] text-slate-300 border border-[#222F46]">
                    {movie.status}
                  </span>
                </div>

                <button
                  onClick={handleFavoriteToggle}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    isFavorite
                      ? 'bg-red-600/20 border-red-500 text-red-400'
                      : 'bg-[#111827] border-[#222F46] text-slate-300 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-400 text-red-400' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </button>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{movie.title}</h1>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(movie.genre) ? movie.genre : [movie.genre]).map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-[#1F293D] text-slate-300 border border-[#2B3954]"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Metadata Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white text-base">{movie.rating?.toFixed(1) || '8.0'}</span>
                  <span className="text-xs text-slate-400">/ 10</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{movie.duration} mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Synopsis */}
              <p className="text-slate-300 text-sm leading-relaxed pt-2">{movie.description}</p>

              {/* Director & Cast */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-[#222F46]/70">
                {movie.director && (
                  <p>
                    <span className="text-slate-500 font-semibold">Director:</span>{' '}
                    <span className="text-slate-200">{movie.director}</span>
                  </p>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <p>
                    <span className="text-slate-500 font-semibold">Starring:</span>{' '}
                    <span className="text-slate-200">{movie.cast.join(', ')}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Trailer Action */}
            {movie.trailerUrl && (
              <div className="pt-2">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-all shadow-md"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch Official Trailer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Showtime & Theaters Section */}
        <section id="booking" className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#222F46] pb-4">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Ticket className="w-6 h-6 text-red-500" />
                Available Theaters & Showtimes
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your preferred date and showtime to pick seats.
              </p>
            </div>
          </div>

          {/* Date Selector Pills */}
          {uniqueDates.length > 0 ? (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {uniqueDates.map((dateStr) => {
                const dateObj = new Date(dateStr);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex flex-col items-center px-5 py-3 rounded-2xl border transition-all text-xs font-bold min-w-[90px] ${
                      isSelected
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/40 scale-105'
                        : 'bg-[#161F30] border-[#222F46] text-slate-300 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">{dayName}</span>
                    <span className="text-sm font-black mt-0.5">{dayNum}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-[#161F30] border border-[#222F46] text-center text-slate-400 text-sm">
              No shows are currently scheduled for this movie. Check back soon or contact theater support.
            </div>
          )}

          {/* Theater Cards */}
          <div className="space-y-4">
            {Object.keys(showsByTheater).length === 0 && uniqueDates.length > 0 ? (
              <p className="text-slate-400 text-sm">No shows scheduled for the selected date.</p>
            ) : (
              Object.values(showsByTheater).map(({ theater, shows: theaterShows }) => (
                <div
                  key={theater?._id}
                  className="p-6 rounded-2xl bg-[#161F30] border border-[#222F46] hover:border-[#2F3F5E] transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222F46]/70 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {theater?.name}
                      </h3>
                      <p className="text-xs text-slate-400 ml-6">{theater?.location}</p>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-4">
                      <span>Screen: <strong className="text-white">{theater?.screenName}</strong></span>
                      <span>Starts from <strong className="text-emerald-400">${theater?.regularPrice}</strong></span>
                    </div>
                  </div>

                  {/* Showtimes Grid */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {theaterShows.map((show) => (
                      <Link
                        key={show._id}
                        to={`/booking/${show._id}`}
                        className="group flex flex-col items-center px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#222F46] hover:border-red-500 hover:bg-red-600/10 transition-all text-xs"
                      >
                        <span className="font-bold text-white group-hover:text-red-400 text-sm">
                          {show.showTime}
                        </span>
                        <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                          {show.screenName || 'Screen 1'}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-[#161F30] rounded-2xl border border-[#222F46] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222F46]">
              <h3 className="text-sm font-bold text-white">{movie.title} – Official Trailer</h3>
              <button
                onClick={() => setShowTrailer(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-[#0F172A] border border-[#222F46]"
              >
                Close (ESC)
              </button>
            </div>
            <div className="relative aspect-video w-full">
              <iframe
                src={`${movie.trailerUrl}?autoplay=1`}
                title={`${movie.title} Trailer`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailsPage;
