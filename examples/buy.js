require('dotenv').config()
const ParasSDK = require('../index')

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
		const res = await parasSDK.buy(
			{
				ownerId: cred.account_id,
				tokenId: "bafybeihyvmlz4yanombe2eb7aepcq77zr4dvbilzlagx66jotmdz34ngoe",
				quantity: 1,
				payment: 1,
			}
		)
		console.log(res)
		return res
	} catch (err) {
		console.log(err)
	}
}

main()