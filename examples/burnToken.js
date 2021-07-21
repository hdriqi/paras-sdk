require('dotenv').config()
const ParasSDK = require('../index')
const fs = require('fs')
const path = require('path')

class BurnApp {
	constructor() {
		this.parasSDK = new ParasSDK();
		this.authToken = null;
		this.accountId = null;
	}

	async init() {
		await this.parasSDK.init(
			{
				networkId: 'default',
				nodeUrl: 'https://rpc.testnet.near.org',
				walletUrl: 'https://wallet.testnet.near.org',
				appName: 'Paras Testnet',
				contractName: this.parasSDK.CONTRACT_DEV,
				apiUrl: this.parasSDK.API_DEV,
			},
			{
				isServer: true,
			}
		)
		const cred = {
			account_id: process.env.ROOT_ACCOUNT_ID,
			public_key: process.env.ROOT_PUBLIC_KEY,
			private_key: process.env.ROOT_PRIVATE_KEY,
		}

		await this.parasSDK.login(cred)
		this.authToken = await this.parasSDK.authToken()
		this.accountId = cred.account_id
	}

	async burnToken(
		tokenId,
		quantity
	) {
		try {
			const burnToken = await this.parasSDK.burn(
				{
					accountId: this.accountId,
					tokenId: tokenId,
					quantity: quantity
				}
			)
			console.log(burnToken)
			return burnToken
		} catch (err) {
			console.log(err)
		}

	}
}

const main = async() => {
	const burnApp = new BurnApp()

	await burnApp.init()
	burnApp.burnToken("bafybeid3rcuaew3e2vq4kwbkhhrw7nvx24a7mhzps3am3hc7q3b2et2swu", 5)
}

main()