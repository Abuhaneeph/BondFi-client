import React from 'react';
import { Plus, Users2, UserPlus, DollarSign, TrendingUp } from 'lucide-react';

interface ROSCATabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  myGroups: any[];
  availableGroups: any[];
}

const ROSCATabs: React.FC<ROSCATabsProps> = ({ 
  activeTab, 
  setActiveTab, 
  myGroups, 
  availableGroups 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-100 mb-8">
      <div className="flex p-2 bg-stone-50 rounded-2xl m-2">
        <button
          onClick={() => setActiveTab('my-groups')}
          className={`flex-1 py-4 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
            activeTab === 'my-groups'
              ? 'bg-white text-terracotta shadow-lg'
              : 'text-stone-600 hover:text-stone-800 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Users2 className="w-5 h-5" />
            <span>My Groups ({myGroups.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('group-contributions')}
          className={`flex-1 py-4 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
            activeTab === 'group-contributions'
              ? 'bg-white text-terracotta shadow-lg'
              : 'text-stone-600 hover:text-stone-800 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Group Contributions</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex-1 py-4 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
            activeTab === 'payouts'
              ? 'bg-white text-terracotta shadow-lg'
              : 'text-stone-600 hover:text-stone-800 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Payouts</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('create-group')}
          className={`flex-1 py-4 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
            activeTab === 'create-group'
              ? 'bg-white text-terracotta shadow-lg'
              : 'text-stone-600 hover:text-stone-800 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Group</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('join-group')}
          className={`flex-1 py-4 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
            activeTab === 'join-group'
              ? 'bg-white text-terracotta shadow-lg'
              : 'text-stone-600 hover:text-stone-800 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Join Group ({availableGroups.length})</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ROSCATabs;
