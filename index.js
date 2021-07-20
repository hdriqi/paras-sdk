const nearAPI = require('near-api-js')
const FormData = require('form-data')
const { Base64 } = require('js-base64')
const JSBI = require('jsbi')
const axios = require('axios')
const querystring = require('querystring')

class ParasSDK {
	constructor() {
		this.contract = {}
		this.currentUser = null
		this.config = {}
		this.wallet = {}
		this.signer = {}
		this.opts = {}
		this.keyStore = null
		this.CONTRACT_DEV = `dev-1603765848601-7127578`
		this.CONTRACT_TESTNET = `contract-beta-dev.paras.testnet`
		this.CONTRACT_MAINNET = `contract.paras.near`
		this.API_DEV = `https://dev-api.paras.id`
		this.API_TESTNET = `https://testnet-api.paras.id`
		this.API_MAINNET = `https://mainnet-api.paras.id`
	}

	async authToken() {
		try {
			const accountId = this.account.accountId
			const arr = new Array(accountId)
			for (var i = 0; i < accountId.length; i++) {
				arr[i] = accountId.charCodeAt(i)
			}
			const msgBuf = new Uint8Array(arr)
			const signedMsg = await this.signer.signMessage(
				msgBuf,
				accountId,
				this.config.networkId
			)
			const pubKey = Buffer.from(signedMsg.publicKey.data).toString('hex')
			const signature = Buffer.from(signedMsg.signature).toString('hex')
			const payload = [accountId, pubKey, signature]
			return Base64.encode(payload.join('&'))
		} catch (err) {
			return null
		}
	}

	async _initContract() {
		const contract = await new nearAPI.Contract(
			this.account,
			this.config.contractName,
			{
				changeMethods: [
					'buy',
					'updateMarketData',
					'deleteMarketData',
					'transferFrom',
					'burn'
				],
			}
		)
		return contract
	}

	async init(config = {}, opts = {}) {
		if (!config.networkId) {
			throw new Error('ParasSDK: config.networkId not found')
		}
		if (!config.nodeUrl) {
			throw new Error('ParasSDK: config.nodeUrl not found')
		}
		if (!config.contractName) {
			throw new Error('ParasSDK: config.contractName not found')
		}
		if (!config.walletUrl) {
			throw new Error('ParasSDK: config.walletUrl not found')
		}
		if (!config.apiUrl) {
			throw new Error('ParasSDK: config.apiUrl not found')
		}
		if (!config.appName) {
			throw new Error('ParasSDK: appName not found')
		}

		this.opts = opts

		try {
			// Initializing nearAPI
			this.keyStore = this.opts.isServer
				? new nearAPI.keyStores.InMemoryKeyStore()
				: new nearAPI.keyStores.BrowserLocalStorageKeyStore()

			const connection = await nearAPI.connect({
				deps: {
					keyStore: this.keyStore,
				},
				...config,
			})

			this.config = config
			this.nearAPI = nearAPI
			this.connection = connection
			this.signer = new nearAPI.InMemorySigner(this.keyStore)

			// if in browser, check user auth status
			if (!this.opts.isServer) {
				this.wallet = new nearAPI.WalletConnection(connection)

				// setup account 1st
				this.account = await this.connection.account(this.wallet.getAccountId())
				// setup contract 2nd
				this.contract = await this._initContract(this.wallet.getAccountId())
			}
		} catch (err) {
			throw err
		}
	}

	async login(account) {
		if (this.opts.isServer) {
			const accountkeyPair = nearAPI.KeyPair.fromString(
				account.secret_key || account.private_key
			)
			await this.keyStore.setKey(
				this.config.networkId,
				account.account_id,
				accountkeyPair
			)
			this.account = await this.connection.account(account.account_id)
			this.contract = await this._initContract(account.account_id)
		} else {
			this.wallet.requestSignIn(this.config.contractName, this.config.appName)
		}
	}

	async updateMarketData(params) {
		if (!this.contract) {
			throw new Error('ParasSDK: Contract has not been initialized')
		}
		try {
			const formattedParams = {
				ownerId: params.ownerId,
				tokenId: params.tokenId,
				quantity: params.quantity.toString(),
				amount: params.amount.toString(),
			}
			await this.contract.updateMarketData(formattedParams)
			return formattedParams
		} catch (err) {
			throw new Error(err)
		}
	}

	async deleteMarketData(params) {
		if (!this.contract) {
			throw new Error('ParasSDK: Contract has not been initialized')
		}
		try {
			const formattedParams = {
				ownerId: params.ownerId,
				tokenId: params.tokenId,
				quantity: '0',
				amount: '0',
			}
			await this.contract.updateMarketData(formattedParams)
			return formattedParams
		} catch (err) {
			throw new Error(err)
		}
	}

	async buy(params) {
		if (!this.contract) {
			throw new Error('ParasSDK: Contract has not been initialized')
		}
		try {
			const formattedParams = {
				ownerId: params.ownerId,
				tokenId: params.tokenId,
				quantity: params.quantity.toString(),
			}
			const deposit = params.payment.toString()

			const userBalance = await this.account.getAccountBalance()

			if (
				JSBI.lessThan(JSBI.BigInt(userBalance.available), JSBI.BigInt(deposit))
			) {
				throw 'ParasSDK: Insufficient fund'
			}
			await this.contract.buy(formattedParams, '30000000000000', deposit)
			return formattedParams
		} catch (err) {
			throw new Error(err)
		}
	}

	async transferFrom(params) {
		if (!this.contract) {
			throw new Error('ParasSDK: Contract has not been initialized')
		}
		try {
			const formattedParams = {
				ownerId: params.ownerId,
				newOwnerId: params.newOwnerId,
				tokenId: params.tokenId,
				quantity: params.quantity.toString(),
			}

			await this.contract.transferFrom(formattedParams)
			return formattedParams
		} catch (err) {
			throw new Error(err)
		}
	}

	async mint(params, authToken) {
		const formData = new FormData()

		formData.append('file', params.file)
		formData.append('ownerId', params.ownerId)
		formData.append('supply', params.supply.toString())
		formData.append('quantity', params.quantity.toString())
		formData.append('amount', params.amount.toString())
		formData.append('name', params.name)
		formData.append('description', params.description)
		formData.append('collection', params.collection)
		params.royalty ? formData.append('royalty', params.royalty) : null
		params.categoryId ? formData.append('categoryId', params.categoryId) : null

		try {
			const resp = await axios.post(`${this.config.apiUrl}/tokens`, formData, {
				headers: {
					'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
					authorization: authToken,
				},
			})
			return resp.data
		} catch (err) {
			console.log(err.response)
			throw new Error(err)
		}
	}

	async burn(params) {
		if (!this.contract) {
			throw new Error('ParasSDK: Contract has not been initialized')
		}
		try {
			const formattedParams = {
				accountId: params.accountId,
				tokenId: params.tokenId,
				quantity: params.quantity.toString(),
			}

			await this.contract.burn(formattedParams)
			return formattedParams
		} catch (err) {
			throw new Error(err)
		}
	}

	async getTokens(query, skip = 0, limit = 10, sort = 'updatedAt_-1') {
		// const query = {
		// 	ownerId: ownerId,
		// 	tokenId: tokenId,
		// 	creatorId: creatorId,
		// 	collection: collection,
		// 	name: name,
		// 	search: search,
		// 	collectionSearch: collectionSearch,
		// 	nameSearch: nameSearch,
		// 	excludeTotalBurn: excludeTotalBurn,
		// 	minPrice: minPrice,
		// 	maxPrice: maxPrice,
		// }
		// const skip = parseInt(__skip) || 0
		// const limit = Math.min(parseInt(__limit), 10) || 10
		// const sort = __sort

		const qs = querystring.stringify({
			...query,
			...{ __skip: skip },
			...{ __limit: limit },
			...{ __sort: sort },
		})

		try {
			const resp = await axios.get(`${this.config.apiUrl}/tokens?${qs}`)
			return resp.data.data
		} catch (err) {
			console.log(err.response)
			throw new Error(err)
		}
	}
}

module.exports = ParasSDK
