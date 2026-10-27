import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Play, Sparkles, ArrowRight, ShieldCheck, Zap, Headphones, Search } from 'lucide-react';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

const LandingPage = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        const [allRes] = await Promise.all([moviesAPI.getAll({ limit: 20 })]);

        if (allRes.data.success) {
          const movies = allRes.data.data;
          setFeaturedMovies(movies.filter((m) => m.isFeatured));
          setTrendingMovies(movies.filter((m) => m.isTrending && m.status === 'Now Showing'));
          setUpcomingMovies(movies.filter((m) => m.status === 'Upcoming' || m.isUpcoming));
        }
      } catch (err) {
        console.error('Error fetching landing movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const activeHeroMovie = featuredMovies[heroIndex] || {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genre: ['Sci-Fi', 'Adventure'],
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    rating: 8.8,
    _id: 'default',
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Cinematic Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Backdrop Image with Multi-layer Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeHeroMovie.backdropUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600'}
            alt="Hero Backdrop"
            className="w-full h-full object-cover object-center filter brightness-50 contrast-125 transform scale-105 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17] via-[#0A0E17]/70 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PREMIERE CINEMA EXPERIENCE</span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">iMovies</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-light leading-relaxed">
              Your ultimate destination for the latest blockbusters and timeless classics.
            </p>

            {/* Search Bar Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-lg mt-4">
              <input
                type="text"
                placeholder="Search movies by title, genre, or director..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-28 py-3.5 rounded-xl bg-[#161F30]/90 backdrop-blur-md border border-[#222F46] focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white placeholder-slate-400 text-sm shadow-xl outline-none transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-red-600/30"
              >
                Search
              </button>
            </form>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/movies"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xl shadow-red-600/40 hover:shadow-red-600/60 transition-all hover:scale-105"
              >
                <span>Browse All Movies</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {activeHeroMovie._id !== 'default' && (
                <Link
                  to={`/movies/${activeHeroMovie._id}`}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#161F30]/80 hover:bg-[#161F30] text-slate-200 hover:text-white font-bold text-sm border border-[#222F46] hover:border-slate-500 backdrop-blur-md transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch Trailer</span>
                </Link>
              )}
            </div>

            {/* Featured movie thumbnail switcher */}
            {featuredMovies.length > 1 && (
              <div className="pt-6">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Featured Highlights</p>
                <div className="flex items-center gap-3">
                  {featuredMovies.slice(0, 4).map((m, idx) => (
                    <button
                      key={m._id}
                      onClick={() => setHeroIndex(idx)}
                      className={`relative w-20 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        heroIndex === idx ? 'border-red-500 scale-105 shadow-md shadow-red-500/50' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={m.backdropUrl || m.posterUrl} alt={m.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="bg-[#0D131F] border-y border-[#222F46]/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#161F30]/60 border border-[#222F46]/60">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Dolby Atmos & Laser IMAX</h4>
                <p className="text-xs text-slate-400 mt-0.5">Crystal clear acoustics and multi-dimensional surround sound.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#161F30]/60 border border-[#222F46]/60">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Live Real-Time Seat Locking</h4>
                <p className="text-xs text-slate-400 mt-0.5">Zero double bookings guaranteed with atomic reservation synchronization.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#161F30]/60 border border-[#222F46]/60">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Instant E-Ticket Delivery</h4>
                <p className="text-xs text-slate-400 mt-0.5">Contactless QR admission right from your phone or printable ticket.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 flex-grow">
        {loading ? (
          <LoadingSpinner text="Loading cinematic blockbusters..." />
        ) : (
          <>
            {/* Trending Now */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-7 rounded-full bg-red-600 inline-block" />
                    Now Showing in Theaters
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Book your seats now for today's hottest theatrical releases.
                  </p>
                </div>
                <Link
                  to="/movies"
                  className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(trendingMovies.length > 0 ? trendingMovies : featuredMovies).slice(0, 8).map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </section>

            {/* Upcoming Movies */}
            {upcomingMovies.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-7 rounded-full bg-amber-500 inline-block" />
                      Upcoming Anticipated Blockbusters
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Check out movies coming soon to an iMovies screen near you.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {upcomingMovies.map((movie) => (
                    <MovieCard key={movie._id} movie={movie} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default LandingPage;
