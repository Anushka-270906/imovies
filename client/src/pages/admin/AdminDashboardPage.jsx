import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Film,
  Building2,
  CalendarDays,
  Ticket,
  CheckCircle2,
  XCircle,
  DollarSign,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getDashboard();
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentBookings(res.data.recentBookings || []);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling administrative analytics..." />;

  const metricCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    { title: 'Active Movies', value: stats?.totalMovies || 0, icon: Film, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    { title: 'Theaters / Venues', value: stats?.totalTheaters || 0, icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
    { title: 'Scheduled Shows', value: stats?.totalShows || 0, icon: CalendarDays, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: Ticket, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    { title: 'Confirmed Bookings', value: stats?.confirmedBookings || 0, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { title: 'Cancelled Bookings', value: stats?.cancelledBookings || 0, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    { title: 'Total Gross Revenue', value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-600/20 border-emerald-500/40' },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`p-5 rounded-2xl border ${card.bg} bg-[#161F30] flex items-center justify-between shadow-lg transition-transform hover:scale-[1.02]`}
            >
              <div>
                <span className="text-xs text-slate-400 font-semibold block">{card.title}</span>
                <span className="text-2xl font-black text-white mt-1 block">{card.value}</span>
              </div>
              <div className={`p-3 rounded-xl bg-[#0F172A] border border-[#222F46] ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Admin Actions */}
      <div className="bg-[#161F30] p-6 rounded-2xl border border-[#222F46] space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Management Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/movies/add"
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-[#222F46] hover:border-red-500 text-slate-200 hover:text-white text-xs font-bold transition-all"
          >
            <PlusCircle className="w-4 h-4 text-red-500" />
            Add New Movie
          </Link>
          <Link
            to="/admin/theaters/add"
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-[#222F46] hover:border-red-500 text-slate-200 hover:text-white text-xs font-bold transition-all"
          >
            <PlusCircle className="w-4 h-4 text-red-500" />
            Add New Theater
          </Link>
          <Link
            to="/admin/shows/add"
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-[#222F46] hover:border-red-500 text-slate-200 hover:text-white text-xs font-bold transition-all"
          >
            <PlusCircle className="w-4 h-4 text-red-500" />
            Schedule Show
          </Link>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-[#161F30] rounded-2xl border border-[#222F46] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#222F46] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Customer Reservations</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live booking activity synced directly from database.</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            View All Bookings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F172A] text-slate-400 font-semibold border-b border-[#222F46]">
              <tr>
                <th className="px-6 py-3.5">Reference</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Movie</th>
                <th className="px-6 py-3.5">Theater & Date</th>
                <th className="px-6 py-3.5">Seats</th>
                <th className="px-6 py-3.5">Total Paid</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222F46]/70 text-slate-300">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No bookings placed yet.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-[#1E293B]/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-red-400">
                      {b.bookingReference}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{b.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400">{b.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {b.movie?.title}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{b.theater?.name}</p>
                      <p className="text-[10px] text-slate-400">{b.showDate} at {b.showTime}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {b.seats?.map((s) => s.seatId).join(', ')}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">
                      ${b.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.bookingStatus === 'Confirmed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
