import React, { useState } from 'react';
import ROSCAStats from './ROSCAStats';
import ROSCAFooter from './ROSCAFooter';
import { Users, Plus, UserPlus, Shield, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '../ErrorBoundary';

interface ROSCADashboardProps {
  userName: string;
  userInfo: any;
  totalStats: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  myGroups: any[];
  availableGroups: any[];
  children: React.ReactNode;
}

const ROSCADashboard: React.FC<ROSCADashboardProps> = ({ 
  userName, 
  userInfo, 
  totalStats, 
  activeTab,
  setActiveTab,
  myGroups,
  availableGroups,
  children 
}) => {
  const navigationItems = [
    { id: 'my-groups', label: 'My Groups', icon: Users },
    { id: 'create-group', label: 'Create Group', icon: Plus },
    { id: 'join-group', label: 'Join Group', icon: UserPlus },
    { id: 'group-contributions', label: 'Contributions', icon: DollarSign },
    { id: 'payouts', label: 'Payouts', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
      <div className="flex min-h-screen">
        {/* Sidebar Navigation - Zero spacing from top and left */}
        <aside className="w-64 bg-card border-r border-border/50 p-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">Navigation</h2>
          </div>
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-black'
                  }`}
                  title={
                    item.id === 'my-groups' ? 'View and manage your active ROSCA groups, track contributions, and see payout schedules' :
                    item.id === 'group-contributions' ? 'Select a group to pay contributions' :
                    item.id === 'payouts' ? 'View payout status, cashout earnings, and track payout history' :
                    item.id === 'create-group' ? 'Start a new ROSCA group, set contribution amounts, and invite members to join' :
                    item.id === 'join-group' ? 'Find and join existing ROSCA groups using invite codes from friends or community members' :
                    item.label
                  }
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-8">
          {activeTab === 'my-groups' && (
            <ErrorBoundary>
              <ROSCAStats userInfo={userInfo} />
            </ErrorBoundary>
          )}

          {/* User Registration Prompt */}
          {!userInfo && (
            <Card className="rosca-card bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="text-center py-12">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to BondFi ROSCA!</h3>
                <p className="text-muted-foreground mb-4">
                  You need to register on the blockchain to start using ROSCA features.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  This will create your profile and allow you to create and join savings groups.
                </p>
                <Button className="rosca-hero">
                  <Shield className="h-4 w-4 mr-2" />
                  Register on Blockchain
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Dynamic Content Area */}
          <div className="space-y-6 rosca-animate-in">
            {/* Only show heading for non-stats tabs */}
            {activeTab !== 'my-groups' && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground capitalize">
                  {navigationItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {activeTab === 'group-contributions' && 'Select a group to pay contributions'}
                  {activeTab === 'payouts' && 'View payout status, cashout earnings, and track payout history'}
                  {activeTab === 'create-group' && 'Start a new savings group with smart contracts'}
                  {activeTab === 'join-group' && 'Join an existing group with an invite code'}
                </p>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ROSCADashboard;
