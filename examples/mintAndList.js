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
		const authToken = await parasSDK.authToken()
		const newToken = await parasSDK.mint(
				{
					file: fs.createReadStream(path.join(__dirname, 'test.jpg')),
					ownerId: cred.account_id,
					supply: 10,
					quantity: 10,
					amount: '1000000000000000000000000',
					name: 'Royalty XII Sell',
					description: 'Key description',
					collection: 'Key',
					royalty: 12
				},
				authToken
			)
		console.log(newToken)

        const query = {
            tokenId: newToken["data"]["tokenId"]
        }
        const res = await parasSDK.getTokens(query, 0, 1)
        console.log(res)
	} catch (err) {
		console.log(err)
	}
}

main()