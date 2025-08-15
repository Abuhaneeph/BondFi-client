export const Installment_ABI=[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_ajoContract",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_merchantRegistry",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "planId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "customer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "daysPastDue",
				"type": "uint256"
			}
		],
		"name": "DefaultDetected",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "planId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "customer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "installmentNumber",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "penalty",
				"type": "uint256"
			}
		],
		"name": "InstallmentPaymentMade",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "planId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "customer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "merchant",
				"type": "address"
			}
		],
		"name": "InstallmentPlanCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "planId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "customer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "merchant",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "productId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "installments",
				"type": "uint256"
			}
		],
		"name": "InstallmentPlanCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "MAX_INSTALLMENTS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_DOWN_PAYMENT_RATE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_INSTALLMENT_FREQUENCY",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_TRUST_SCORE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ajoContract",
		"outputs": [
			{
				"internalType": "contract IAjoEsusuSavings",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "authorizedContracts",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_customer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "checkCustomerEligibility",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "isEligible",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "maxInstallmentAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "trustScore",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "reason",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "recommendedDownPayment",
						"type": "uint256"
					}
				],
				"internalType": "struct IInstallmentManager.CustomerEligibility",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_customer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_merchant",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_productDescription",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_paymentToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_totalAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_downPayment",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_numberOfInstallments",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_installmentFrequency",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_latePenaltyRate",
				"type": "uint256"
			}
		],
		"name": "createInstallmentPlan",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "customerPlans",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_customer",
				"type": "address"
			}
		],
		"name": "getCustomerPlans",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_planId",
				"type": "uint256"
			}
		],
		"name": "getInstallmentPlanSummary",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "planId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "customer",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "customerName",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "merchant",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "merchantName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "productDescription",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "paymentToken",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "tokenName",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "totalAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "downPayment",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "installmentAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "numberOfInstallments",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "currentInstallment",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "nextPaymentDue",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isCompleted",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "hasDefaulted",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "totalPaid",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "remainingAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "daysPastDue",
						"type": "uint256"
					}
				],
				"internalType": "struct IInstallmentManager.InstallmentSummary",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_merchant",
				"type": "address"
			}
		],
		"name": "getMerchantPlans",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "installmentPaid",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "installmentPaidAt",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "installmentPlans",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "planId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "customer",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "customerName",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "merchant",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "merchantName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "productDescription",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "paymentToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "downPayment",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "installmentAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "numberOfInstallments",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "installmentFrequency",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "currentInstallment",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "nextPaymentDue",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "createdAt",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "isCompleted",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "hasDefaulted",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "latePenaltyRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalPaid",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_planId",
				"type": "uint256"
			}
		],
		"name": "makePayment",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_planId",
				"type": "uint256"
			}
		],
		"name": "markAsDefaulted",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "merchantPlans",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "merchantRegistry",
		"outputs": [
			{
				"internalType": "contract IMerchantRegistry",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextPlanId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "penaltiesAccrued",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_contract",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "_authorized",
				"type": "bool"
			}
		],
		"name": "setAuthorizedContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]