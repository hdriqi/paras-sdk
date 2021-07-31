require('dotenv').config()
const ParasSDK = require('../index')
const { parseNearAmount } = require('near-api-js/lib/utils/format')

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

	try {
		// possible query
		// const query = {
		// 	ownerId: string,
		// 	tokenId: string,
		// 	creatorId: string,
		// 	collection: string,
		// 	name: string,
		// 	search: string,
		// 	collectionSearch: string,
		// 	nameSearch: string,
		// 	excludeTotalBurn: boolean,
		// 	minPrice: string,
		// 	maxPrice: string,
		// }
		const query = {
			ownerId: 'johncena.testnet',
			minPrice: parseNearAmount('0.1'),
		}
		const res = await parasSDK.getTokens(query, 0, 10)
		console.log(res)
	} catch (err) {
		console.log(err)
	}
}

main()
