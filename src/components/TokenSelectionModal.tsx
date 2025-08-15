import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import tokens from '@/lib/Tokens/tokens';

export const TokenSelectionModal = ({ isOpen, onClose, selectedTokens, onTokenSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTokenClick = (token) => {
    onTokenSelect(token);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Select Tokens</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border border-stone-300 rounded-lg mb-4"
        />
        <div className="max-h-60 overflow-y-auto">
          {filteredTokens.map((token) => (
            <div
              key={token.address}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-b-0 ${
                selectedTokens.includes(token.address) ? 'bg-stone-100' : ''
              }`}
              onClick={() => handleTokenClick(token)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-100">
                <img 
                  src={token.img} 
                  alt={token.symbol}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-stone-800">{token.symbol}</div>
                <div className="text-sm text-stone-500">{token.name}</div>
              </div>
              {selectedTokens.includes(token.address) && (
                <Check className="w-4 h-4 text-terracotta" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};