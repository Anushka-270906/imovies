import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building2,
  CalendarDays,
  Ticket,
  Users,
  PlusCircle,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

const AdminLayout = () => {
  const adminNav = [
    { name: 'Dashboard', path: '/admin', end: true, icon: LayoutDashboard },
    { name: 'Movies', path: '/admin/movies', icon: Film },
    { name: 'Theaters', path: '/admin/theaters', icon: Building2 },
    { name: 'Shows', path: '/admin/shows', icon: CalendarDays },
    { name: 'All Bookings', path: '/admin/bookings', icon: Ticket },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161F30] p-6 rounded-2xl border border-[#222F46] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">iMovies Administrator Control Panel</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                MASTER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage cinema catalog, auditoriums, showtimes, customer reservations, and revenue.
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-[#222F46] text-xs font-semibold text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Public Storefront
        </Link>
      </div>

      {/* Admin Navigation Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#222F46]">
        {adminNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-102'
                    : 'bg-[#161F30] text-slate-300 hover:text-white hover:bg-[#1E293B] border border-[#222F46]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Child Route Content */}
      <main className="pt-2">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
