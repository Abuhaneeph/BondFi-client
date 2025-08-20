import React, { useState } from 'react';
import { CreditCard, DollarSign, Calendar, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Installments = () => {
  const [activeTab, setActiveTab] = useState('active');

  const installmentPlans = [
    {
      id: 1,
      customerName: 'John Doe',
      productName: 'iPhone 15 Pro',
      totalAmount: 450000,
      paidAmount: 150000,
      remainingAmount: 300000,
      installments: 12,
      completedInstallments: 4,
      nextPaymentDate: '2024-12-15',
      nextPaymentAmount: 25000,
      status: 'active',
      startDate: '2024-09-01'
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      productName: 'MacBook Air M2',
      totalAmount: 850000,
      paidAmount: 283333,
      remainingAmount: 566667,
      installments: 12,
      completedInstallments: 4,
      nextPaymentDate: '2024-12-20',
      nextPaymentAmount: 47222,
      status: 'active',
      startDate: '2024-09-01'
    },
    {
      id: 3,
      customerName: 'Mike Johnson',
      productName: 'Nike Air Max',
      totalAmount: 45000,
      paidAmount: 45000,
      remainingAmount: 0,
      installments: 6,
      completedInstallments: 6,
      nextPaymentDate: 'Completed',
      nextPaymentAmount: 0,
      status: 'completed',
      startDate: '2024-08-01'
    }
  ];

  const activePlans = installmentPlans.filter(plan => plan.status === 'active');
  const completedPlans = installmentPlans.filter(plan => plan.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return (completed / total) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Installment Plans</h1>
        <p className="text-muted-foreground">Manage and track your customer installment payments</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold text-foreground">{activePlans.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">
                  ₦{installmentPlans.reduce((sum, plan) => sum + plan.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  ₦{activePlans.reduce((sum, plan) => sum + plan.remainingAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{completedPlans.length}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Plans ({activePlans.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Completed ({completedPlans.length})
        </button>
      </div>

      {/* Installment Plans List */}
      <div className="space-y-4">
        {(activeTab === 'active' ? activePlans : completedPlans).map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Plan Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{plan.productName}</h3>
                      <p className="text-muted-foreground">Customer: {plan.customerName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Progress: {plan.completedInstallments}/{plan.installments} installments</span>
                      <span>{Math.round(getProgressPercentage(plan.completedInstallments, plan.installments))}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(plan.completedInstallments, plan.installments)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-semibold text-foreground">₦{plan.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="font-semibold text-green-600">₦{plan.paidAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="font-semibold text-orange-600">₦{plan.remainingAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Payment</p>
                      <p className="font-semibold text-foreground">
                        {plan.nextPaymentDate === 'Completed' ? 'N/A' : `₦${plan.nextPaymentAmount.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 lg:w-48">
                  {plan.status === 'active' && (
                    <>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Record Payment
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Payment
                      </Button>
                    </>
                  )}
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Started: {plan.startDate}</span>
                  {plan.status === 'active' && (
                    <span>Next Payment: {plan.nextPaymentDate}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {(activeTab === 'active' ? activePlans : completedPlans).length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No {activeTab} installment plans
            </h3>
            <p className="text-muted-foreground">
              {activeTab === 'active' 
                ? 'You don\'t have any active installment plans at the moment'
                : 'No completed installment plans yet'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Installments;
