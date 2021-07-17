require('dotenv').config()
const ParasSDK = require('../index')
const fs = require('fs')
const path = require('path')

class MintApp {
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

	async mintOnly(
		fileName, 
		supply, 
		name, 
		description, 
		collection, 
		royalty
	) {
		try {
			const newToken = await this.parasSDK.mint(
				{
					file: fs.createReadStream(path.join(__dirname, fileName)),
					ownerId: this.accountId,
					supply: supply,
					quantity: 0,
					amount: 0,
					name: name,
					description: description,
					collection: collection,
					royalty: royalty
				},
				this.authToken
			)
			console.log(newToken)
			return newToken
		} catch (err) {
			console.log(err)
		}

	}

	async mintAndSell(
		fileName, 
		supply, 
		name, 
		description, 
		collection, 
		royalty,
		quantity,
		amount
	) {
		try {
			const newToken = await this.parasSDK.mint(
				{
					file: fs.createReadStream(path.join(__dirname, fileName)),
					ownerId: this.accountId,
					supply: supply,
					quantity: quantity,
					amount: amount,
					name: name,
					description: description,
					collection: collection,
					royalty: royalty
				},
				this.authToken
			)
			console.log(newToken)
			return newToken
		} catch (err) {
			console.log(err)
		}

	}




}

const main = async() => {
	const mintApp = new MintApp()

	await mintApp.init()

	//mintApp.mintOnly('test.jpg', 10, 'Royalty X', 'Key Description', 'Key', 10)
	mintApp.mintAndSell('test.jpg', 10, 'Royalty XI Sell', 'Key Sell', 'Key', 11, 10, '1000000000000000000000000')

}

main()
