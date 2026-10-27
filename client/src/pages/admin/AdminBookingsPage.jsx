import React, { useEffect, useState } from 'react';
import { Ticket, Search, Printer, XCircle, AlertTriangle } from 'lucide-react';
import { adminAPI, bookingsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import TicketModal from '../../components/TicketModal';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ticketModalBooking, setTicketModalBooking] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const toast = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getBookings({
        search: search.trim() || undefined,
        status: statusFilter,
        limit: 100,
      });
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load customer bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleAdminCancel = async () => {
    if (!cancelTarget) return;

    try {
      setCancelling(true);
      const res = await bookingsAPI.cancel(cancelTarget._id);
      if (res.data.success) {
        toast.success(`Booking ${cancelTarget.bookingReference} cancelled by admin.`);
        setCancelTarget(null);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-red-500" />
            Customer Reservations & Bookings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit reservations, issue ticket refunds, and print admission passes.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64">
            <input
              type="text"
              placeholder="Search reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#161F30] border border-[#222F46] focus:border-red-500 text-white placeholder-slate-500 text-xs outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#161F30] border border-[#222F46] text-white text-xs outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#161F30] rounded-2xl border border-[#222F46] overflow-hidden shadow-xl">
        {loading ? (
          <LoadingSpinner text="Retrieving booking records..." />
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No bookings found matching filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F172A] text-slate-400 font-semibold border-b border-[#222F46]">
                <tr>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Movie</th>
                  <th className="px-6 py-3.5">Theater & Date</th>
                  <th className="px-6 py-3.5">Seats</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222F46]/70 text-slate-300">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-[#1E293B]/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-red-400">
                      {b.bookingReference}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{b.user?.name}</p>
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
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          b.bookingStatus === 'Confirmed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setTicketModalBooking(b)}
                          className="p-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#222F46]"
                          title="Print Ticket Pass"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {b.bookingStatus === 'Confirmed' && (
                          <button
                            onClick={() => setCancelTarget(b)}
                            className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-colors"
                            title="Admin Cancel & Refund"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {ticketModalBooking && (
        <TicketModal
          booking={ticketModalBooking}
          onClose={() => setTicketModalBooking(null)}
        />
      )}

      {/* Cancel Target Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#161F30] rounded-2xl border border-red-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Admin Booking Cancellation</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cancel booking reference <strong className="text-white">#{cancelTarget.bookingReference}</strong> for{' '}
              <strong className="text-white">{cancelTarget.user?.name}</strong>?
            </p>
            <p className="text-xs text-slate-400">
              This will release the seats immediately and flag payment as refunded.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222F46]">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-[#222F46]"
              >
                Keep Active
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleAdminCancel}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md shadow-red-600/30"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
