import React, { useEffect, useState } from 'react';
import { ArrowRight, Users, Shield, Coins, Store, CreditCard, TrendingUp, Star, Zap, HandHeart } from 'lucide-react';

interface HeroSectionProps {
  onPageChange?: (page: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onPageChange }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleStartSaving = () => {
    if (onPageChange) {
      onPageChange('dashboard');
    }
    setIsMenuOpen(false);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Community Savings Visual Elements */}
      <div className="absolute inset-0 select-none">
        {/* ROSCA Group Circle */}
        <div className="absolute top-32 left-24 w-20 h-20 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-30 hover:opacity-80 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-1">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Local Store */}
        <div className="absolute top-1/3 right-32 w-20 h-20 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-30 hover:opacity-80 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-2">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Payment Card */}
        <div className="absolute bottom-32 left-1/4 w-20 h-20 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-30 hover:opacity-80 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-3">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Savings Pool */}
        <div className="absolute bottom-20 right-24 w-20 h-20 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-30 hover:opacity-80 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Coins className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Community Trust */}
        <div className="absolute top-1/4 right-1/4 w-20 h-20 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-30 hover:opacity-80 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-5">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <HandHeart className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Blockchain Security */}
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 flex items-center justify-center transition-all duration-500 cursor-pointer opacity-30 hover:opacity-80 hover:scale-110 hover:shadow-lg pointer-events-auto animate-float-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Connecting Lines Animation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#059669" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
          <path
            d="M 150 200 Q 300 150 450 250 T 750 300"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            className="animate-dash"
          />
          <path
            d="M 200 400 Q 400 350 600 450 T 900 400"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8,8"
            className="animate-dash"
          />
        </svg>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <div className="text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-200/30 text-emerald-700 rounded-full text-sm font-semibold mb-12 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            <Star className="w-4 h-4 text-emerald-500 mr-3 animate-spin-slow relative z-10" />
            <span className="relative z-10">🌍 Empowering African Communities Through DeFi</span>
            <Zap className="w-4 h-4 text-green-500 ml-3 animate-pulse relative z-10" />
          </div>

          {/* Hero Title with 3D Effect */}
          <div className="relative mb-12">
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-8 leading-none tracking-tight">
              <span className="block transform hover:scale-105 transition-transform duration-300">
                Smart Community
              </span>
              <span className="block bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent relative">
                <span>Savings & Spending</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-teal-500/20 blur-3xl animate-pulse"></div>
              </span>
            </h1>
          </div>

          {/* Enhanced Subheading */}
          <p className="text-2xl md:text-3xl text-gray-600 mb-16 max-w-6xl mx-auto leading-relaxed font-light">
            Join automated rotating savings groups (ROSCAs), build credit through community trust, and use your
            <span className="text-emerald-600 font-semibold"> on-chain payouts </span>
            for secure installment payments at local merchants.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button 
              onClick={handleStartSaving}  
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-10 py-5 rounded-full font-semibold text-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl hover:shadow-emerald-200/50 hover:scale-105"
            >
              <Users className="w-6 h-6" />
              <span>Join a Savings Circle</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <a
              href="#"
              className="inline-block border-2 border-gray-300 text-gray-700 px-10 py-5 rounded-full font-semibold text-lg hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 hover:scale-105"
            >
              Learn How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="group text-center">
              <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 hover:bg-white hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">150+</div>
                <div className="text-gray-600 text-base font-medium">Active Circles</div>
              </div>
            </div>
            
            <div className="group text-center">
              <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-3xl p-8 hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">
                  <Store className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">500+</div>
                <div className="text-gray-600 text-base font-medium">Partner Merchants</div>
              </div>
            </div>
            
            <div className="group text-center">
              <div className="bg-white/90 backdrop-blur-sm border border-purple-100 rounded-3xl p-8 hover:bg-white hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-300 hover:-translate-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">$5M+</div>
                <div className="text-gray-600 text-base font-medium">Savings Pooled</div>
              </div>
            </div>
            
            <div className="group text-center">
              <div className="bg-white/90 backdrop-blur-sm border border-green-100 rounded-3xl p-8 hover:bg-white hover:border-green-200 hover:shadow-2xl hover:shadow-green-100/50 transition-all duration-300 hover:-translate-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">99.9%</div>
                <div className="text-gray-600 text-base font-medium">Payout Success</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-20px) translateX(15px) rotate(5deg); }
          50% { transform: translateY(-10px) translateX(-10px) rotate(-3deg); }
          75% { transform: translateY(-30px) translateX(8px) rotate(8deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          30% { transform: translateY(-25px) translateX(-12px) rotate(-5deg); }
          60% { transform: translateY(-15px) translateX(18px) rotate(3deg); }
          90% { transform: translateY(-35px) translateX(-8px) rotate(-8deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          20% { transform: translateY(-35px) translateX(8px) rotate(7deg); }
          40% { transform: translateY(-5px) translateX(-20px) rotate(-4deg); }
          80% { transform: translateY(-40px) translateX(15px) rotate(6deg); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          35% { transform: translateY(-20px) translateX(15px) rotate(-6deg); }
          70% { transform: translateY(-25px) translateX(-10px) rotate(4deg); }
          100% { transform: translateY(-30px) translateX(12px) rotate(-7deg); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          15% { transform: translateY(-30px) translateX(-5px) rotate(5deg); }
          45% { transform: translateY(-10px) translateX(25px) rotate(-3deg); }
          75% { transform: translateY(-45px) translateX(-15px) rotate(8deg); }
        }
        @keyframes float-6 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-28px) translateX(12px) rotate(-4deg); }
          50% { transform: translateY(-18px) translateX(-18px) rotate(6deg); }
          75% { transform: translateY(-38px) translateX(10px) rotate(-5deg); }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 10s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 12s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 9s ease-in-out infinite; }
        .animate-float-5 { animation: float-5 11s ease-in-out infinite; }
        .animate-float-6 { animation: float-6 7s ease-in-out infinite; }
        .animate-dash { animation: dash 3s linear infinite; }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;