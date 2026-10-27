import React from 'react';
import { X, Printer, CheckCircle, Ticket, MapPin, Calendar, Clock, Film } from 'lucide-react';

const TicketModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#161F30] border border-[#222F46] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222F46] bg-[#0E1522]">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white">Digital E-Ticket</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Body */}
        <div id="printable-ticket" className="p-6 space-y-6 bg-gradient-to-b from-[#161F30] to-[#0F172A]">
          {/* Top Movie Info */}
          <div className="flex gap-4">
            <img
              src={booking.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800'}
              alt={booking.movie?.title}
              className="w-20 h-28 object-cover rounded-lg shadow-md border border-[#222F46]"
            />
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                Booking Reference: #{booking.bookingReference}
              </span>
              <h2 className="text-xl font-black text-white mt-1">{booking.movie?.title}</h2>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold border border-slate-700">
                  {booking.movie?.certification || 'PG-13'}
                </span>
                <span>{booking.movie?.language || 'English'}</span>
                <span>•</span>
                <span>{booking.movie?.duration || 120} min</span>
              </div>
            </div>
          </div>

          {/* Dotted Divider with Cinema Notches */}
          <div className="relative flex items-center justify-between">
            <div className="w-4 h-8 bg-black/80 rounded-r-full -ml-6" />
            <div className="flex-grow border-b-2 border-dashed border-[#222F46] mx-2" />
            <div className="w-4 h-8 bg-black/80 rounded-l-full -mr-6" />
          </div>

          {/* Theater & Showtime Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> Theater & Screen
              </span>
              <p className="font-semibold text-white">{booking.theater?.name}</p>
              <p className="text-slate-400">{booking.theater?.location}</p>
              <p className="text-slate-400">{booking.show?.screenName || 'Screen 1'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-red-400" /> Date & Showtime
              </span>
              <p className="font-semibold text-white">{booking.showDate}</p>
              <p className="text-red-400 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> {booking.showTime}
              </p>
            </div>
          </div>

          {/* Seats & Payment */}
          <div className="p-3.5 rounded-xl bg-[#0D131F] border border-[#222F46]/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Selected Seats:</span>
              <span className="font-bold text-white text-sm">
                {booking.seats?.map((s) => s.seatId).join(', ')}
              </span>
              <span className="text-slate-400 block text-[10px] mt-0.5">
                ({booking.seats?.length} Tickets &bull; {booking.seats?.[0]?.category || 'Standard'})
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Total Paid:</span>
              <span className="font-black text-emerald-400 text-base">
                ${booking.totalAmount?.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-500 flex items-center justify-end gap-1 mt-0.5 font-medium">
                <CheckCircle className="w-3 h-3" /> {booking.paymentStatus}
              </span>
            </div>
          </div>

          {/* Barcode / QR Simulation */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="h-10 flex items-center gap-1">
              {Array.from({ length: 42 }, (_, i) => (
                <div
                  key={i}
                  className={`h-full ${
                    i % 3 === 0 ? 'w-1 bg-white' : i % 5 === 0 ? 'w-0.5 bg-white' : 'w-1.5 bg-white'
                  } opacity-90`}
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-2 uppercase">
              *{booking.bookingReference}*
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#222F46] bg-[#0E1522]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-[#222F46] hover:bg-[#1E293B]"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md shadow-red-600/30"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
