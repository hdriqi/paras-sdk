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
		const transferDetails = await parasSDK.transferFrom({
			ownerId: cred.account_id,
			newOwnerId: "orang.testnet",
			tokenId: "bafybeic3ss4247so7suqnh2fqz3pcbm6hi22d5b3ghyr2u3qk5ftq3iehe",
			quantity: 1
			}
		)
		console.log(transferDetails)
	} catch (err) {
		console.log(err)
	}
}

main()

