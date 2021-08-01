require('dotenv').config()
const ParasSDK = require('../index')
const { parseNearAmount } = require('near-api-js/lib/utils/format')
const fs = require('fs')
const path = require('path')


const main = async () => {
	const parasSDK = new ParasSDK()

	await parasSDK.init(
		{
			networkId: 'default',
			nodeUrl: 'https://rpc.testnet.near.org',
			walletUrl: 'https://wallet.testnet.near.org',
			appName: 'Paras Testnet',
			contractName: parasSDK.CONTRACT_DEV,
			apiUrl: parasSDK.API_DEV,
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

	await parasSDK.login(cred)

	try {
		const sellDetails = await parasSDK.deleteMarketData({
			ownerId: cred.account_id,
			tokenId: "bafybeic3ss4247so7suqnh2fqz3pcbm6hi22d5b3ghyr2u3qk5ftq3iehe",
			}
		)
		console.log(sellDetails)
	} catch (err) {
		console.log(err)
	}
}

main()

