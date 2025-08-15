export const MERCHANT_CORE_ABI=[
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
			},
			{
				"internalType": "address",
				"name": "_productCatalog",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_installmentManager",
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
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "PlatformFeesWithdrawn",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "productId",
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
				"name": "planId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isInstallment",
				"type": "bool"
			}
		],
		"name": "ProductPurchased",
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
				"name": "_token",
				"type": "address"
			}
		],
		"name": "emergencyWithdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllMerchants",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllProducts",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "productId",
						"type": "uint256"
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
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "category",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "imageUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address[]",
						"name": "acceptedTokens",
						"type": "address[]"
					},
					{
						"internalType": "string[]",
						"name": "tokenNames",
						"type": "string[]"
					},
					{
						"internalType": "bool",
						"name": "isAvailable",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "allowInstallments",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "minDownPaymentRate",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "maxInstallments",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "stock",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "merchantReputation",
						"type": "uint256"
					}
				],
				"internalType": "struct IProductCatalog.ProductSummary[]",
				"name": "",
				"type": "tuple[]"
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
		"name": "getMerchantInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "merchantAddress",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "businessName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "contactInfo",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "businessCategory",
						"type": "string"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "registrationDate",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalSales",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "completedOrders",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "disputedOrders",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "reputationScore",
						"type": "uint256"
					},
					{
						"internalType": "address[]",
						"name": "acceptedTokens",
						"type": "address[]"
					}
				],
				"internalType": "struct IMerchantRegistry.Merchant",
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
				"internalType": "address",
				"name": "_merchant",
				"type": "address"
			}
		],
		"name": "getMerchantProducts",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "productId",
						"type": "uint256"
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
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "category",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "imageUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address[]",
						"name": "acceptedTokens",
						"type": "address[]"
					},
					{
						"internalType": "string[]",
						"name": "tokenNames",
						"type": "string[]"
					},
					{
						"internalType": "bool",
						"name": "isAvailable",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "allowInstallments",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "minDownPaymentRate",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "maxInstallments",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "stock",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "merchantReputation",
						"type": "uint256"
					}
				],
				"internalType": "struct IProductCatalog.ProductSummary[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_productId",
				"type": "uint256"
			}
		],
		"name": "getProduct",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "productId",
						"type": "uint256"
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
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "category",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "imageUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address[]",
						"name": "acceptedTokens",
						"type": "address[]"
					},
					{
						"internalType": "string[]",
						"name": "tokenNames",
						"type": "string[]"
					},
					{
						"internalType": "bool",
						"name": "isAvailable",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "allowInstallments",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "minDownPaymentRate",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "maxInstallments",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "stock",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "merchantReputation",
						"type": "uint256"
					}
				],
				"internalType": "struct IProductCatalog.ProductSummary",
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
				"internalType": "string",
				"name": "_category",
				"type": "string"
			}
		],
		"name": "getProductsByCategory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "productId",
						"type": "uint256"
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
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "category",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "imageUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address[]",
						"name": "acceptedTokens",
						"type": "address[]"
					},
					{
						"internalType": "string[]",
						"name": "tokenNames",
						"type": "string[]"
					},
					{
						"internalType": "bool",
						"name": "isAvailable",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "allowInstallments",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "minDownPaymentRate",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "maxInstallments",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "stock",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "merchantReputation",
						"type": "uint256"
					}
				],
				"internalType": "struct IProductCatalog.ProductSummary[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "installmentManager",
		"outputs": [
			{
				"internalType": "contract IInstallmentManager",
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
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_category",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_imageUrl",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			},
			{
				"internalType": "address[]",
				"name": "_acceptedTokens",
				"type": "address[]"
			},
			{
				"internalType": "bool",
				"name": "_allowInstallments",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "_minDownPaymentRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_maxInstallments",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_installmentFrequency",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_initialStock",
				"type": "uint256"
			}
		],
		"name": "listProduct",
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
				"internalType": "uint256",
				"name": "_planId",
				"type": "uint256"
			}
		],
		"name": "makeInstallmentPayment",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"inputs": [],
		"name": "platformFeePercentage",
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
				"name": "",
				"type": "address"
			}
		],
		"name": "platformFees",
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
		"name": "productCatalog",
		"outputs": [
			{
				"internalType": "contract IProductCatalog",
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
				"internalType": "uint256",
				"name": "_productId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_paymentToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_quantity",
				"type": "uint256"
			}
		],
		"name": "purchaseProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_productId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_paymentToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_quantity",
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
			}
		],
		"name": "purchaseProductWithInstallments",
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
				"internalType": "string",
				"name": "_businessName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_contactInfo",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_businessCategory",
				"type": "string"
			},
			{
				"internalType": "address[]",
				"name": "_acceptedTokens",
				"type": "address[]"
			}
		],
		"name": "registerMerchant",
		"outputs": [],
		"stateMutability": "nonpayable",
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
				"internalType": "string",
				"name": "_searchTerm",
				"type": "string"
			}
		],
		"name": "searchProducts",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "productId",
						"type": "uint256"
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
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "category",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "imageUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address[]",
						"name": "acceptedTokens",
						"type": "address[]"
					},
					{
						"internalType": "string[]",
						"name": "tokenNames",
						"type": "string[]"
					},
					{
						"internalType": "bool",
						"name": "isAvailable",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "allowInstallments",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "minDownPaymentRate",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "maxInstallments",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "stock",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "merchantReputation",
						"type": "uint256"
					}
				],
				"internalType": "struct IProductCatalog.ProductSummary[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_feePercentage",
				"type": "uint256"
			}
		],
		"name": "setPlatformFee",
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
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"name": "withdrawPlatformFees",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]