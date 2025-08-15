export const Merchant_Registry_ABI= [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_ajoContract",
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
				"name": "merchant",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "MerchantDeactivated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "merchant",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "businessName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "category",
				"type": "string"
			}
		],
		"name": "MerchantRegistered",
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
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "allMerchants",
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
				"name": "_merchant",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_reason",
				"type": "string"
			}
		],
		"name": "deactivateMerchant",
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
		"name": "isActiveMerchant",
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
				"name": "_merchant",
				"type": "address"
			}
		],
		"name": "isRegisteredMerchant",
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
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "merchantSupportedTokens",
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
				"name": "_merchant",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"name": "merchantSupportsToken",
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
				"name": "",
				"type": "address"
			}
		],
		"name": "merchants",
		"outputs": [
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "registeredMerchants",
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
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_merchant",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_saleAmount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_completed",
				"type": "bool"
			}
		],
		"name": "updateMerchantStats",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]