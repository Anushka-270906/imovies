import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  MapPin,
  Calendar,
  Clock,
  Printer,
  XCircle,
  AlertTriangle,
  Film,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { bookingsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import TicketModal from '../components/TicketModal';
import LoadingSpinner from '../components/LoadingSpinner';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState(null);
  const [cancelingBookingId, setCancelingBookingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const toast = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingsAPI.getMyBookings();
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load your booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelModalBooking) return;

    try {
      setCancelingBookingId(cancelModalBooking._id);
      const res = await bookingsAPI.cancel(cancelModalBooking._id);
      if (res.data.success) {
        toast.success('Booking cancelled successfully and refund initiated.');
        setCancelModalBooking(null);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelingBookingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'All') return true;
    return b.bookingStatus === filterStatus;
  });

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222F46] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-red-500" />
            My Bookings & Orders
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View your active tickets, download admission passes, or manage cancellations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {['All', 'Confirmed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-[#161F30] text-slate-300 hover:text-white border border-[#222F46]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <LoadingSpinner text="Retrieving booking records..." />
      ) : filteredBookings.length === 0 ? (
        <div className="bg-[#111827] rounded-3xl border border-[#222F46] p-16 text-center space-y-4 max-w-xl mx-auto">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Bookings Found</h3>
          <p className="text-sm text-slate-400">
            {filterStatus === 'All'
              ? "You haven't booked any movie tickets yet. Check out the latest movies now showing!"
              : `You don't have any bookings with status "${filterStatus}".`}
          </p>
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
          >
            Browse Movies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((b) => {
            const isConfirmed = b.bookingStatus === 'Confirmed';

            return (
              <div
                key={b._id}
                className="bg-[#161F30] rounded-2xl border border-[#222F46] hover:border-[#2F3F5E] p-6 shadow-xl transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
              >
                {/* Left: Poster + Info */}
                <div className="flex gap-4 sm:gap-6 items-start">
                  <img
                    src={b.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800'}
                    alt={b.movie?.title}
                    className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-xl shadow-md border border-[#222F46] shrink-0"
                  />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-red-400">
                        REF: #{b.bookingReference}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isConfirmed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white">{b.movie?.title}</h2>

                    <div className="space-y-1 text-xs text-slate-300">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="font-semibold">{b.theater?.name}</span>
                        <span className="text-slate-400 hidden sm:inline">({b.theater?.location})</span>
                      </p>
                      <p className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {b.showDate}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-red-400">
                          <Clock className="w-3.5 h-3.5" />
                          {b.showTime}
                        </span>
                      </p>
                    </div>

                    <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400">Seats:</span>
                      <span className="font-bold text-white">
                        {b.seats?.map((s) => s.seatId).join(', ')}
                      </span>
                      <span className="text-slate-500">
                        ({b.seats?.length} tickets &bull; {b.seats?.[0]?.category || 'Standard'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-[#222F46]">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block">Total Amount</span>
                    <span className="text-2xl font-black text-emerald-400">
                      ${b.totalAmount?.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Paid via {b.paymentMethod || 'Demo Card'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* View E-Ticket button */}
                    <button
                      onClick={() => setSelectedBookingForTicket(b)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-[#222F46] text-slate-200 text-xs font-semibold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      View Ticket
                    </button>

                    {/* Cancel Booking button */}
                    {isConfirmed && (
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs font-semibold transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedBookingForTicket && (
        <TicketModal
          booking={selectedBookingForTicket}
          onClose={() => setSelectedBookingForTicket(null)}
        />
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#161F30] rounded-2xl border border-red-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Confirm Ticket Cancellation</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel your booking for{' '}
              <strong className="text-white">{cancelModalBooking.movie?.title}</strong> on{' '}
              <strong className="text-white">{cancelModalBooking.showDate}</strong> at{' '}
              <strong className="text-white">{cancelModalBooking.showTime}</strong>?
            </p>
            <p className="text-xs text-slate-400">
              The reserved seats ({cancelModalBooking.seats?.map((s) => s.seatId).join(', ')}) will be released
              immediately for other moviegoers, and your demo payment of{' '}
              <strong className="text-emerald-400">${cancelModalBooking.totalAmount?.toFixed(2)}</strong> will be refunded.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222F46]">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-[#222F46]"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelingBookingId !== null}
                onClick={handleCancelConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md shadow-red-600/30"
              >
                {cancelingBookingId ? 'Cancelling...' : 'Yes, Cancel Tickets'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
