import React from 'react';
import { Store, Package, Plus, CreditCard, Settings, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '../ErrorBoundary';

interface MerchantDashboardProps {
  userName: string;
  userInfo: any;
  totalStats: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ 
  userName, 
  userInfo, 
  totalStats, 
  activeTab,
  setActiveTab,
  children 
}) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Store },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'create', label: 'Create Product', icon: Plus },
    { id: 'installments', label: 'Installments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-card border-r border-border/50 p-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">Merchant Portal</h2>
            <p className="text-sm text-muted-foreground">Manage your business</p>
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
                    item.id === 'dashboard' ? 'Overview of your merchant business, sales, and key metrics' :
                    item.id === 'products' ? 'View and manage all your listed products' :
                    item.id === 'create' ? 'Create new products with images, pricing, and installment options' :
                    item.id === 'installments' ? 'Manage installment plans and track payments' :
                    item.id === 'analytics' ? 'View sales analytics, customer insights, and business performance' :
                    item.id === 'settings' ? 'Configure business settings, accepted tokens, and preferences' :
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
          {/* User Registration Prompt */}
          {!userInfo && (
            <Card className="merchant-card bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="text-center py-12">
                <Store className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to BondFi Merchant Portal!</h3>
                <p className="text-muted-foreground mb-4">
                  You need to register as a merchant to start selling products.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  This will create your merchant profile and allow you to list products and manage sales.
                </p>
                <Button className="merchant-hero">
                  <Store className="h-4 w-4 mr-2" />
                  Register as Merchant
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tab Content */}
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default MerchantDashboard;
