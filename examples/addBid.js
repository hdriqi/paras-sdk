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

    const cred = {
        account_id: process.env.ROOT_ACCOUNT_ID,
        public_key: process.env.ROOT_PUBLIC_KEY,
        private_key: process.env.ROOT_PRIVATE_KEY,
    }

    await parasSDK.login(cred)

	try {
        const res = await parasSDK.addBid(
            {
                accountId: cred.account_id,
                tokenId: "bafybeihivm3psgagxewyyj4osez5zygkyswojo22dbtzh3kplpvc6oscke",
                quantity: 1,
                amount: parseNearAmount('1')
            }
        )
        console.log(res)
        return res
    } catch (err) {
        console.log(err)
    }
}

main()
