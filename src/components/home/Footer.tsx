import React from 'react';
import { 
  Globe, 
  Twitter, 
  Github, 
  MessageCircle, 
  Mail, 
  ArrowUp,
  ExternalLink,
  Shield,
  BookOpen
} from 'lucide-react';

interface FooterProps {
  onPageChange: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onPageChange }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    platform: [
      { name: 'Dashboard', page: 'dashboard' },
      { name: 'Savings Groups', page: 'savings' },
      { name: 'Merchant Network', page: 'merchant' },
      { name: 'Send Money', page: 'send' },
      { name: 'Buy/Sell', page: 'buy-sell' }
    ],
    resources: [
      { name: 'How it Works', href: '#', external: false },
      { name: 'Smart Contracts', href: '#', external: false },
      { name: 'Security', href: '#', external: false },
      { name: 'Fees & Pricing', href: '#', external: false },
      { name: 'Documentation', href: '#', external: false }
    ],
    company: [
      { name: 'About Us', href: '#', external: false },
      { name: 'Success Stories', href: '#', external: false },
      { name: 'Cultural Impact', href: '#', external: false },
      { name: 'Partners', href: '#', external: false },
      { name: 'Contact', href: 'mailto:hello@bondfi.com', external: true }
    ],
    legal: [
      { name: 'Terms of Service', href: '#', external: false },
      { name: 'Privacy Policy', href: '#', external: false },
      { name: 'Help Center', href: '#', external: false },
      { name: 'Bug Reports', href: '#', external: false },
      { name: 'Community Forum', href: '#', external: false }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/BondFi', label: 'Twitter', external: true },
    { icon: Github, href: 'https://github.com/BondFi', label: 'GitHub', external: true },
    { icon: Globe, href: 'https://bondfi.com', label: 'Website', external: true },
    { icon: Mail, href: 'mailto:hello@bondfi.com', label: 'Email', external: true }
  ];

  const supportedTokens = [
    'cNGN', 'cKES', 'cZAR', 'cGHS', 'AFX', 'USDT', 'WETH', 'AFR'
  ];

  const handleLinkClick = (link: { page?: string; href?: string; external?: boolean }) => {
    if (link.page) {
      onPageChange(link.page);
    } else if (link.href && link.external) {
      window.open(link.href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-50"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                              <img 
                src="https://res.cloudinary.com/ecosheane/image/upload/v1749952368/logo_virjcs.jpg"
                alt="BondFi Logo"
                className="w-12 h-12 rounded-xl object-cover transition-all duration-300 group-hover:scale-105"
              />
            </div>
            
              </div>
             
              
              {/* Supported Tokens */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Supported Tokens</h4>
                <div className="flex flex-wrap gap-2">
                  {supportedTokens.map((token, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium border border-gray-700"
                    >
                      {token}
                    </span>
                  ))}
                </div>
              </div>

             
            </div>

            {/* Platform Links */}
         

            {/* Resources Links */}
           
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <p className="text-gray-400 text-sm">
                  © 2024 BondFi. All rights reserved.
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>Built on</span>
                  <span className="text-blue-400 font-medium">Mantle</span>
                  <span>•</span>
                  <span>Secured by</span>
                  <span className="text-green-400 font-medium">Smart Contracts</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Mantle Secured</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span>Open Source</span>
                </div>
              </div>
              
              <button
                onClick={scrollToTop}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 group"
              >
                <span className="text-sm">Back to top</span>
                <div className="w-8 h-8 bg-gray-800 hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-600 rounded-lg flex items-center justify-center transition-all duration-300">
                  <ArrowUp className="w-4 h-4 group-hover:text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;