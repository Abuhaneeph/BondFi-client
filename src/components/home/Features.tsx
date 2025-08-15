import React from 'react';
import { ArrowRight, Shield, Users, CreditCard, Store, Smartphone, TrendingUp, Calendar, HandHeart, Lock } from 'lucide-react';

interface FeaturesProps {
  onPageChange?: (page: string) => void;
}

const Features: React.FC<FeaturesProps> = ({ onPageChange }) => {
  const handleJoinCircle = () => {
    if (onPageChange) {
      onPageChange('dashboard');
    }
  };

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-sm font-medium text-emerald-700 mb-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Revolutionizing Community
            <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent"> Finance & Commerce</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience automated ROSCAs, build credit through community trust, and make secure payments to local merchants
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Users,
              title: 'Automated ROSCAs',
              description: 'Join rotating savings circles with smart contract automation, transparent payouts, and community accountability',
              gradient: 'from-emerald-500 to-green-600',
              highlight: true
            },
            {
              icon: Store,
              title: 'Merchant Network',
              description: 'Shop at 500+ verified local merchants with secure on-chain installment payment options',
              gradient: 'from-blue-500 to-indigo-600'
            },
            {
              icon: CreditCard,
              title: 'Flexible Payments',
              description: 'Use your ROSCA payouts for instant purchases or structured payment plans with zero traditional credit checks',
              gradient: 'from-purple-500 to-pink-600'
            },
            {
              icon: TrendingUp,
              title: 'Credit Building',
              description: 'Build your on-chain credit score through consistent savings contributions and payment history',
              gradient: 'from-orange-500 to-red-500'
            },
            {
              icon: Shield,
              title: 'Community Trust',
              description: 'Blockchain-secured trust system with peer verification and transparent reputation scoring',
              gradient: 'from-teal-500 to-cyan-600'
            },
            {
              icon: Smartphone,
              title: 'Mobile-First Design',
              description: 'Seamless mobile experience optimized for African users with offline-capable features',
              gradient: 'from-yellow-500 to-amber-500'
            },
            {
              icon: Calendar,
              title: 'Flexible Schedules',
              description: 'Choose weekly, monthly, or custom contribution schedules that fit your income pattern',
              gradient: 'from-rose-500 to-pink-500'
            },
            {
              icon: HandHeart,
              title: 'Social Impact',
              description: 'Empower your community while building personal wealth through collaborative financial growth',
              gradient: 'from-green-500 to-emerald-500'
            },
            {
              icon: Lock,
              title: 'Secure & Private',
              description: 'End-to-end encryption with privacy-focused design and regulatory compliance',
              gradient: 'from-gray-700 to-gray-900'
            }
          ].map((feature, index) => (
            <div key={index} className="group">
              <div className={`bg-white/90 backdrop-blur-sm border ${feature.highlight ? 'border-emerald-200 ring-2 ring-emerald-100' : 'border-slate-200'} rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${feature.highlight ? 'hover:ring-4 hover:ring-emerald-200' : ''}`}>
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Join a Circle',
                description: 'Browse available savings circles or create your own with friends and family',
                icon: Users
              },
              {
                step: '02', 
                title: 'Save Together',
                description: 'Make regular contributions automatically through smart contracts',
                icon: Calendar
              },
              {
                step: '03',
                title: 'Spend Smart',
                description: 'Use your payouts for purchases or installment payments at partner merchants',
                icon: Store
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 border-4 border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {step.step}
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h4>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-900 rounded-3xl p-12 text-center relative">
            {/* Enhanced background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-3xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.2),transparent_50%)] rounded-3xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(34,197,94,0.15),transparent_50%)] rounded-3xl"></div>
            
            {/* Floating elements */}
            <div className="absolute top-8 left-8 w-4 h-4 bg-emerald-400 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute bottom-8 right-8 w-6 h-6 bg-green-400 rounded-full animate-pulse opacity-40"></div>
            <div className="absolute top-1/2 left-12 w-2 h-2 bg-teal-400 rounded-full animate-ping opacity-50"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/90 mb-6">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                Join 10,000+ Community Members
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Start Your Savings Journey
                <span className="block text-3xl md:text-4xl mt-2 text-emerald-300">Build Wealth Together</span>
              </h3>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join a trusted community of savers and unlock access to credit-free shopping with local merchants
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={handleJoinCircle}
                  className="group bg-white text-emerald-900 px-10 py-5 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
                >
                  <span className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    Join a Savings Circle
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
                <button className="group border-2 border-white/30 text-white px-10 py-5 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300">
                  <span className="flex items-center gap-3">
                    Learn More
                    <div className="w-2 h-2 bg-emerald-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;