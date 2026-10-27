import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Ticket, Printer, ArrowRight, Film, MapPin, Calendar, Clock } from 'lucide-react';
import { bookingsAPI } from '../services/api';
import TicketModal from '../components/TicketModal';
import LoadingSpinner from '../components/LoadingSpinner';

const BookingSuccessPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await bookingsAPI.getById(bookingId);
        if (res.data.success) {
          setBooking(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching confirmed booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) return <LoadingSpinner text="Retrieving booking receipt..." />;
  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-slate-400 space-y-4">
        <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
        <Link to="/movies" className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold">
          Browse Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Booking Confirmed!</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Your movie tickets have been reserved and your booking reference is ready.
        </p>
      </div>

      {/* Ticket Details Card */}
      <div className="bg-[#161F30] rounded-3xl border border-[#222F46] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#222F46]">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Booking Reference</span>
            <p className="text-2xl font-black text-red-500 tracking-wide font-mono mt-0.5">
              {booking.bookingReference}
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {booking.bookingStatus} &bull; {booking.paymentStatus}
          </span>
        </div>

        {/* Movie and Theater Info */}
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <img
            src={booking.movie?.posterUrl}
            alt={booking.movie?.title}
            className="w-28 h-40 object-cover rounded-xl shadow-lg border border-[#222F46] shrink-0"
          />

          <div className="space-y-3 flex-grow text-center sm:text-left">
            <h2 className="text-2xl font-black text-white">{booking.movie?.title}</h2>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="font-semibold">{booking.theater?.name}</span> ({booking.theater?.location})
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-1.5">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>Show Date: <strong className="text-white">{booking.showDate}</strong></span>
              </p>
              <p className="flex items-center justify-center sm:justify-start gap-1.5">
                <Clock className="w-4 h-4 text-red-500" />
                <span>Show Time: <strong className="text-white">{booking.showTime}</strong></span>
              </p>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400">Reserved Seats: </span>
              <span className="text-sm font-bold text-white">
                {booking.seats?.map((s) => s.seatId).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#222F46] flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block">Total Amount Paid</span>
            <span className="text-[11px] text-slate-500">Method: {booking.paymentMethod}</span>
          </div>
          <span className="text-2xl font-black text-emerald-400">${booking.totalAmount?.toFixed(2)}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setShowTicketModal(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            View & Print E-Ticket
          </button>

          <Link
            to="/my-bookings"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] border border-[#222F46] text-slate-200 font-bold text-xs transition-colors"
          >
            <Ticket className="w-4 h-4" />
            View In My Bookings
          </Link>
        </div>
      </div>

      {/* Ticket Modal popup */}
      {showTicketModal && (
        <TicketModal booking={booking} onClose={() => setShowTicketModal(false)} />
      )}
    </div>
  );
};

export default BookingSuccessPage;
