import React from 'react';
import { Crown, CheckCircle, AlertCircle } from 'lucide-react';

interface ROSCAModalsProps {
  showAgentRegistration: boolean;
  setShowAgentRegistration: (show: boolean) => void;
  showInviteModal: boolean;
  setShowInviteModal: (show: boolean) => void;
  agentContactInfo: string;
  setAgentContactInfo: (info: string) => void;
  maxUses: number;
  setMaxUses: (uses: number) => void;
  validityDays: number;
  setValidityDays: (days: number) => void;
  selectedGroupId: any;
  isProcessing: boolean;
  handleRegisterUserAsAgent: () => void;
  handleGenerateInviteCode: () => void;
  successMessage: string;
  setSuccessMessage: (message: string) => void;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
}

const ROSCAModals: React.FC<ROSCAModalsProps> = ({
  showAgentRegistration,
  setShowAgentRegistration,
  showInviteModal,
  setShowInviteModal,
  agentContactInfo,
  setAgentContactInfo,
  maxUses,
  setMaxUses,
  validityDays,
  setValidityDays,
  selectedGroupId,
  isProcessing,
  handleRegisterUserAsAgent,
  handleGenerateInviteCode,
  successMessage,
  setSuccessMessage,
  errorMessage,
  setErrorMessage
}) => {
  return (
    <>
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3 mb-6 shadow-sm">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-green-800 font-medium">{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="ml-auto text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors">
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3 mb-6 shadow-sm">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-red-800 font-medium">{errorMessage}</p>
          <button onClick={() => setErrorMessage('')} className="ml-auto text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors">
            ×
          </button>
        </div>
      )}

      {/* Agent Registration Modal */}
      {showAgentRegistration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-stone-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-sage to-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-2">Become an Agent</h3>
              <p className="text-stone-600">
                Create and manage groups as a trusted community leader
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Contact Information
                </label>
                <textarea
                  value={agentContactInfo}
                  onChange={(e) => setAgentContactInfo(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all"
                  placeholder="Phone, email, or other contact details"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowAgentRegistration(false)}
                  className="flex-1 bg-stone-100 text-stone-700 py-3 rounded-xl font-semibold hover:bg-stone-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterUserAsAgent}
                  disabled={!agentContactInfo.trim() || isProcessing}
                  className="flex-1 bg-gradient-to-r from-sage to-gold text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Registering...' : 'Register as Agent'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Code Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-md shadow-2xl border border-stone-100">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Generate Invite Code</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-stone-700 text-sm font-medium mb-2">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta"
                  placeholder="10"
                />
                <p className="text-xs text-stone-500 mt-1">How many people can use this code</p>
              </div>

              <div>
                <label className="block text-stone-700 text-sm font-medium mb-2">
                  Validity (Days)
                </label>
                <input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value) || 1)}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta"
                  placeholder="30"
                />
                <p className="text-xs text-stone-500 mt-1">How many days the code will be valid</p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerateInviteCode()}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ROSCAModals;
