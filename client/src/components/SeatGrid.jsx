import React from 'react';
import { Check, Lock, Monitor } from 'lucide-react';

const SeatGrid = ({
  theater,
  bookedSeats = [],
  lockedSeats = [],
  selectedSeats = [],
  onSeatToggle,
  pricing = { balcony: 20, middle: 15, regular: 10 },
}) => {
  // Generate rows for each tier
  // Balcony: Rows A, B (2 rows x 10 cols)
  // Middle: Rows C, D, E (3 rows x 10 cols)
  // Regular: Rows F, G, H (3 rows x 10 cols)

  const tiers = [
    {
      name: 'Balcony Tier (Premium)',
      code: 'B',
      price: pricing.balcony,
      rows: ['A', 'B'],
      cols: 10,
    },
    {
      name: 'Middle Tier (Executive)',
      code: 'M',
      price: pricing.middle,
      rows: ['C', 'D', 'E'],
      cols: 10,
    },
    {
      name: 'Regular / Front Tier (Standard)',
      code: 'R',
      price: pricing.regular,
      rows: ['F', 'G', 'H'],
      cols: 10,
    },
  ];

  const getSeatStatus = (seatId) => {
    if (bookedSeats.includes(seatId)) return 'booked';
    if (lockedSeats.includes(seatId) && !selectedSeats.includes(seatId)) return 'locked';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Curved Screen Indicator */}
      <div className="w-full max-w-2xl mb-12 flex flex-col items-center">
        <div className="w-full h-3 bg-gradient-to-r from-red-600/20 via-red-500 to-red-600/20 rounded-t-full shadow-[0_-8px_25px_rgba(229,9,20,0.5)] screen-curve" />
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mt-3">
          <Monitor className="w-4 h-4 text-red-500" />
          SCREEN THIS WAY
        </div>
      </div>

      {/* Seat Sections */}
      <div className="w-full max-w-3xl space-y-8">
        {tiers.map((tier) => (
          <div key={tier.name} className="bg-[#111827]/70 p-5 rounded-2xl border border-[#222F46]">
            {/* Tier Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#222F46]/70">
              <span className="text-sm font-semibold text-white tracking-wide">
                {tier.name}
              </span>
              <span className="text-sm font-bold text-red-400">
                ${tier.price.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ seat</span>
              </span>
            </div>

            {/* Rows Grid */}
            <div className="space-y-2.5">
              {tier.rows.map((rowLetter) => (
                <div key={rowLetter} className="flex items-center justify-center gap-2 sm:gap-3">
                  {/* Row Letter label left */}
                  <span className="w-5 text-xs font-bold text-slate-400 text-center select-none">
                    {rowLetter}
                  </span>

                  {/* Seat columns with a central aisle gap */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {Array.from({ length: tier.cols }, (_, i) => {
                      const colNumber = i + 1;
                      const seatId = `${tier.code}-${rowLetter}${colNumber}`;
                      const status = getSeatStatus(seatId);
                      const isAisleGap = colNumber === 5; // Aisle gap after seat 5

                      return (
                        <React.Fragment key={seatId}>
                          <button
                            type="button"
                            disabled={status === 'booked' || status === 'locked'}
                            onClick={() => onSeatToggle(seatId, tier.price, tier.name.split(' ')[0])}
                            title={`Seat ${rowLetter}${colNumber} (${tier.name.split(' ')[0]}) - $${tier.price}`}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center transition-all duration-200 select-none ${
                              status === 'selected'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/50 scale-105 border border-red-400 ring-2 ring-red-500/50'
                                : status === 'booked'
                                ? 'bg-[#0B0F19] text-slate-600 border border-slate-800 cursor-not-allowed opacity-40'
                                : status === 'locked'
                                ? 'bg-amber-950/40 text-amber-500 border border-amber-500/40 cursor-not-allowed'
                                : 'bg-[#182032] text-slate-300 border border-[#2B3852] hover:border-red-500 hover:text-white hover:scale-105'
                            }`}
                          >
                            {status === 'selected' ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : status === 'booked' ? (
                              <Lock className="w-3 h-3 text-slate-600" />
                            ) : (
                              colNumber
                            )}
                          </button>
                          {isAisleGap && <div className="w-4 sm:w-8" />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Row Letter label right */}
                  <span className="w-5 text-xs font-bold text-slate-400 text-center select-none">
                    {rowLetter}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 py-3 px-6 rounded-xl bg-[#161F30] border border-[#222F46] text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#182032] border border-[#2B3852]" />
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-red-600 border border-red-400 flex items-center justify-center text-white">
            <Check className="w-3 h-3" />
          </div>
          <span className="text-slate-300">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#0B0F19] border border-slate-800 opacity-40 flex items-center justify-center">
            <Lock className="w-3 h-3 text-slate-500" />
          </div>
          <span className="text-slate-500">Booked / Sold</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
