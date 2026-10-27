import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Film, RefreshCw } from 'lucide-react';
import { moviesAPI, favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [movies, setMovies] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        language: selectedLanguage !== 'All' ? selectedLanguage : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        sort: sortBy,
      };

      const res = await moviesAPI.getAll(params);
      if (res.data.success) {
        setMovies(res.data.data);
        if (res.data.availableGenres) setAvailableGenres(res.data.availableGenres.flat());
        if (res.data.availableLanguages) setAvailableLanguages(res.data.availableLanguages);
      }

      if (isAuthenticated) {
        try {
          const favRes = await favoritesAPI.getAll();
          if (favRes.data.success) {
            setFavoriteIds(new Set(favRes.data.data.map((m) => m._id)));
          }
        } catch (e) {
          console.warn('Could not load user favorites:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, selectedLanguage, selectedStatus, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedStatus('All');
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222F46] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Film className="w-8 h-8 text-red-500" />
            Explore Movies & Showtimes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover latest releases, filter by your favorite genres, and book seats seamlessly.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search movie title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161F30] border border-[#222F46] focus:border-red-500 text-white placeholder-slate-400 text-sm outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </form>
      </div>

      {/* Filter and Sorting Controls */}
      <div className="bg-[#111827] p-4 sm:p-5 rounded-2xl border border-[#222F46] space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Now Showing', 'Upcoming'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedStatus === status
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-[#182032] text-slate-300 hover:text-white border border-[#222F46]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {/* Genre select */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#182032] border border-[#222F46] text-white focus:border-red-500 outline-none"
            >
              <option value="All">All Genres</option>
              {Array.from(new Set(availableGenres)).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Language select */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#182032] border border-[#222F46] text-white focus:border-red-500 outline-none"
            >
              <option value="All">All Languages</option>
              {Array.from(new Set(availableLanguages)).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#182032] border border-[#222F46] text-white focus:border-red-500 outline-none"
            >
              <option value="popular">Recommended / Featured</option>
              <option value="rating">Highest Rated</option>
              <option value="releaseDate">Latest Release</option>
              <option value="title">Movie Title (A-Z)</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-[#182032] hover:bg-[#1E293B] border border-[#222F46] text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Movie Results Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching movies..." />
      ) : movies.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#111827] border border-[#222F46] text-center space-y-4">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            We couldn't find any movies matching your current search or filter criteria. Try clearing some filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              isFavorite={favoriteIds.has(movie._id)}
              onFavoriteToggle={(id, isFav) => {
                setFavoriteIds((prev) => {
                  const updated = new Set(prev);
                  if (isFav) updated.add(id);
                  else updated.delete(id);
                  return updated;
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
