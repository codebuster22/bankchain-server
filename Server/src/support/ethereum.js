require('dotenv').config({path: '../.env'});
const mountEthereum =  (Web3, provider, AssetManagerContract, AssetInterfaceContract, AuctionManagerContract) => async () => {
    try{
        const web3 = await new Web3(provider);
        const accounts = []; accounts.push(web3.eth.accounts.privateKeyToAccount('0x'+process.env.PRIVATE_KEY).address);
        const networkId = await web3.eth.net.getId();

        const assetManager = new web3.eth.Contract(       //create instance of assetManager
            AssetManagerContract.abi,
            AssetManagerContract.networks[networkId] && AssetManagerContract.networks[networkId].address,
        );
        const assetInterface = new web3.eth.Contract(
            AssetInterfaceContract.abi,
            AssetInterfaceContract.networks[networkId] && AssetInterfaceContract.networks[networkId].address,
        );
        const auctionManager = new web3.eth.Contract(
            AuctionManagerContract.abi,
            AuctionManagerContract.networks[networkId] && AuctionManagerContract.networks[networkId].address,
        );

        console.log('Asset Manager Contract Address:-',AssetManagerContract.networks[networkId].address);

        return{
            isMounted: true,
            web3:web3,
            accounts: accounts,
            networkId: networkId,
            assetManagerInstance: assetManager,
            assetInterfaceInstance: assetInterface,
            auctionManagerInstance: auctionManager,
            assetManagerAddress: AssetManagerContract.networks[networkId].address,
            auctionManagerAddress: AuctionManagerContract.networks[networkId].address,
        }

    }catch (e) {
        console.error(e);
    }
};

module.exports = mountEthereum;