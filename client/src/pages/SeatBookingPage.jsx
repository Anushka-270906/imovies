import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Film,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { showsAPI, bookingsAPI, paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import SeatGrid from '../components/SeatGrid';
import LoadingSpinner from '../components/LoadingSpinner';

const SeatBookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const socket = useSocket();
  const toast = useToast();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]); // array of seatId strings: ["B-A1"]
  const [selectedSeatObjects, setSelectedSeatObjects] = useState([]); // array of { seatId, price, category }

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Demo Card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState('DEMO MODE');

  // Load show details
  const fetchShow = async () => {
    try {
      setLoading(true);
      const res = await showsAPI.getById(showId);
      if (res.data.success) {
        setShow(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load showtime details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShow();

    // Check payment gateway mode
    paymentsAPI.getConfig().then((res) => {
      if (res.data.success) {
        setPaymentNotice(res.data.notice || 'DEMO PAYMENT SIMULATOR ENABLED');
      }
    }).catch(() => {});
  }, [showId]);

  // Real-time seat updates via Socket.IO
  useEffect(() => {
    if (!socket || !showId) return;

    socket.emit('join-show', showId);

    socket.on(`seat-update-${showId}`, (data) => {
      setShow((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          bookedSeats: data.bookedSeats || prev.bookedSeats,
          lockedSeats: data.lockedSeats ? data.lockedSeats.map((s) => ({ seatId: s })) : prev.lockedSeats,
        };
      });

      // If any of the user's currently selected seats were booked by someone else, remove them
      if (data.bookedSeats) {
        setSelectedSeats((prev) => {
          const valid = prev.filter((s) => !data.bookedSeats.includes(s));
          if (valid.length < prev.length) {
            toast.error('One of your selected seats was just taken by another user.');
          }
          return valid;
        });
      }
    });

    return () => {
      socket.emit('leave-show', showId);
      socket.off(`seat-update-${showId}`);
    };
  }, [socket, showId]);

  const handleSeatToggle = (seatId, price, category) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to select seats and book tickets.');
      navigate('/login', { state: { from: `/booking/${showId}` } });
      return;
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
      setSelectedSeatObjects((prev) => prev.filter((s) => s.seatId !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        toast.error('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeats((prev) => [...prev, seatId]);
      setSelectedSeatObjects((prev) => [...prev, { seatId, price, category }]);

      // Attempt temporary seat lock on backend
      showsAPI.lockSeats(showId, [...selectedSeats, seatId]).catch((err) => {
        console.warn('Seat lock notice:', err.response?.data?.message);
      });
    }
  };

  // Calculations
  const subtotal = selectedSeatObjects.reduce((acc, curr) => acc + curr.price, 0);
  const taxAndFees = Math.round(subtotal * 0.05 * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAndFees) * 100) / 100;

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat to continue.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setIsProcessingPayment(true);

      const bookingPayload = {
        showId: show._id,
        seats: selectedSeatObjects,
        paymentMethod: `Demo Payment (${paymentMethod})`,
      };

      const res = await bookingsAPI.create(bookingPayload);

      if (res.data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success('Booking Confirmed Successfully!');
        setShowPaymentModal(false);
        navigate(`/booking-success/${res.data.data._id}`);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Booking failed. Seats might no longer be available.';
      toast.error(errMsg);
      // Refresh seat layout
      fetchShow();
      setShowPaymentModal(false);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading auditorium seat layout..." />;
  if (!show) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center text-slate-400 space-y-4">
        <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-white">Show Not Found</h2>
        <Link to="/movies" className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold">
          Browse Movies
        </Link>
      </div>
    );
  }

  const { movie, theater } = show;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Movie Header */}
      <div className="bg-[#161F30] p-6 rounded-2xl border border-[#222F46] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <Link
            to={`/movies/${movie?._id}`}
            className="p-2 rounded-lg bg-[#0F172A] border border-[#222F46] text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <img
            src={movie?.posterUrl}
            alt={movie?.title}
            className="w-14 h-20 object-cover rounded-lg shadow-md border border-[#222F46] hidden sm:block"
          />

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white">{movie?.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                {theater?.name}
              </span>
              <span>•</span>
              <span className="text-slate-300">{show.screenName || theater?.screenName}</span>
            </div>
          </div>
        </div>

        {/* Date and Time Badge */}
        <div className="flex items-center gap-3 bg-[#0F172A] px-4 py-2.5 rounded-xl border border-[#222F46] text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-4 h-4 text-red-400" />
            <span className="font-semibold text-white">{show.showDate}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="font-bold text-red-400 text-sm">{show.showTime}</span>
          </div>
        </div>
      </div>

      {/* Main Seat Selection & Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Seat Grid */}
        <div className="lg:col-span-2 bg-[#161F30]/60 p-6 sm:p-8 rounded-3xl border border-[#222F46] shadow-xl flex flex-col items-center">
          <SeatGrid
            theater={theater}
            bookedSeats={show.bookedSeats || []}
            lockedSeats={(show.lockedSeats || []).map((l) => l.seatId)}
            selectedSeats={selectedSeats}
            onSeatToggle={handleSeatToggle}
            pricing={{
              balcony: show.balconyPrice,
              middle: show.middlePrice,
              regular: show.regularPrice,
            }}
          />
        </div>

        {/* Right Column: Dynamic Booking Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[#161F30] p-6 rounded-3xl border border-[#222F46] shadow-2xl space-y-6">
            <div className="border-b border-[#222F46] pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-red-500" />
                Booking Summary
              </h3>
              <p className="text-xs text-slate-400 mt-1">Review selected seats before checkout.</p>
            </div>

            {/* Selected Seats Badges */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">Selected Seats:</span>
              {selectedSeats.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 rounded-lg bg-[#0F172A] border border-[#222F46]/60">
                  No seats selected yet. Click on available seats in the theater layout to choose.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSeatObjects.map((s) => (
                    <div
                      key={s.seatId}
                      className="px-3 py-1.5 rounded-lg bg-[#0F172A] border border-red-500/40 text-xs font-bold text-white flex items-center gap-2 shadow-sm"
                    >
                      <span className="text-red-400">{s.seatId}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({s.category})</span>
                      <span className="text-emerald-400 font-semibold">${s.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 pt-4 border-t border-[#222F46] text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Tickets ({selectedSeats.length})</span>
                <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Convenience Tax & Tech Fee (5%)</span>
                <span>${taxAndFees.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#222F46] text-sm font-bold text-white">
                <span>Total Amount:</span>
                <span className="text-xl font-black text-emerald-400">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={handleProceedToPayment}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
                selectedSeats.length > 0
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/40 hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Proceed to Checkout
            </button>

            {/* Demo Notice Banner */}
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-[11px] text-blue-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                ACADEMIC DEMO MODE
              </div>
              <p className="text-blue-300/80 leading-relaxed">
                {paymentNotice}. Test card or simulated payment methods are available with instant confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Simulator Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#161F30] rounded-3xl border border-[#222F46] shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Payment Checkout</h3>
              <p className="text-xs text-slate-400">
                Complete your ticket reservation for <strong className="text-white">{movie?.title}</strong>
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Demo Payment Method:
              </label>
              <div className="space-y-2">
                {[
                  { id: 'Demo Card', name: 'Demo Credit / Debit Card (Visa/Mastercard)', desc: 'Instant 1-click test card authorization' },
                  { id: 'UPI Simulator', name: 'UPI / QR Simulator', desc: 'Simulated Google Pay / PhonePe instant checkout' },
                  { id: 'Net Banking Demo', name: 'Net Banking Simulator', desc: 'Direct university / academic simulation bank' },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? 'bg-red-600/10 border-red-500 text-white'
                        : 'bg-[#0F172A] border-[#222F46] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="mt-1 accent-red-600"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 block">{pm.name}</span>
                      <span className="text-[11px] text-slate-400 block">{pm.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payable Amount Highlight */}
            <div className="p-4 rounded-xl bg-[#0F172A] border border-[#222F46] flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Payable:</span>
                <span className="text-xs text-slate-500">Includes all taxes & fees</span>
              </div>
              <span className="text-2xl font-black text-emerald-400">${totalAmount.toFixed(2)}</span>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmBooking}
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/40 hover:shadow-red-600/60 transition-all flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <span>Processing Demo Payment...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Pay ${totalAmount.toFixed(2)} & Confirm
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel and return to seat selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatBookingPage;
