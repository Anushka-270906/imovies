import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, Shield, HelpCircle, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#070A10] border-t border-[#222F46] text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">
                i<span className="text-red-500">Movies</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your ultimate destination for the latest blockbusters and timeless classics. Experience cinematic excellence with instant ticket reservations.
            </p>
            <div className="text-xs text-slate-500">
              Academic Full-Stack Project &bull; College Submission Edition
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition-colors">Home Landing</Link></li>
              <li><Link to="/movies" className="hover:text-white transition-colors">Browse Movies</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
              <li><Link to="/favorites" className="hover:text-white transition-colors">Watchlist & Favorites</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Support & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 hover:text-white cursor-pointer"><Shield className="w-3.5 h-3.5 text-slate-500" /> Privacy Policy</li>
              <li className="flex items-center gap-1.5 hover:text-white cursor-pointer"><HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Terms of Service</li>
              <li className="flex items-center gap-1.5 hover:text-white cursor-pointer"><HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Cancellation Policy</li>
              <li className="flex items-center gap-1.5 hover:text-white cursor-pointer"><HelpCircle className="w-3.5 h-3.5 text-slate-500" /> FAQs & Help</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Contact & Support</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-red-400" /> support@imovies.local</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-red-400" /> +1 (800) 555-IMOVIES</li>
              <li className="pt-2 text-xs text-slate-500">Live Demonstrations: Mon-Sun 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#222F46]/60 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} iMovies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Movie Enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
