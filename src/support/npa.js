const Tx = require('ethereumjs-tx').Transaction;
require('dotenv').config({path: '../.env'});
const pKey = new Buffer.from(
    process.env.PRIVATE_KEY,
    'hex',
)

const createNPA = (contractState, counter,nonce) => async (
    _bankName, _assetOnAuction,
    _auctionID,
    _eventType, _city,
    _reservePrice, _EMD, _bidMultiplier,
    _timestamp,npaAddress
    ) =>{
    try{
        if(!contractState.isMounted){
            throw new Error("Ethereum network not mounted");
        }else {
                const rawTx = {
                    nonce: nonce,
                    gasLimit: 3000000,
                    gasPrice: 20000000000,
                    from: contractState.accounts[0],
                    to: contractState.assetManagerInstance.options.address,
                    chainId: 4,
                    data: contractState.assetManagerInstance.methods
                        .addNPA(_bankName, _assetOnAuction,
                            _auctionID,
                            _eventType, _city,
                            _reservePrice, _EMD, _bidMultiplier,
                            _timestamp).encodeABI(),
                }
                const tx = new Tx(rawTx,{ chain: 'rinkeby', hardfork: 'petersburg' });
                tx.sign(pKey);
                const serializedTx = tx.serialize();
                console.log("Before send",nonce);
                await contractState.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'),(err,res)=>console.log("CallBack",err,res,nonce))
                    .on('receipt', async (err)=> {
                        if(err){
                            return await getUpdate(contractState)(counter).then(res=> {
                                if(res.flag){
                                npaAddress.push(
                                    {
                                        flag: true,
                                        data: {
                                            id: counter,
                                            address: res.response.address,
                                        }
                                    })
                                }else{
                                    console.log({
                                        flag: false,
                                        data: "Contract already exist"
                                    })
                                }
                            }
                            );
                        }
                    });
            }
    }catch (e) {
        console.log(e, {
            flag: false,
            data: "Contract Already exists",
        })
    }
}

const getUpdate = (contractState) => async(id) => {
    const result = await contractState.assetManagerInstance.methods.getNPA(id).call({
        from: contractState.accounts[0],
    });
    try {
        if (result.add !== '0x0000000000000000000000000000000000000000') {
            return {
                flag: true,
                response: {id: Number(result.id), address: result.add},
            };
        } else {
            return {
                flag: false,
                error: 'No such entry found'
            }
        }
    }catch (e){
        return {
            flag: false,
            error: "No such entry found"
        }
    }
};

fetchData = (contractState) => async (address) => {
    try{
        contractState.assetInterfaceInstance.options.address=address;
        const npa = {};
        const {_EMD,_NPA_ID,_assetOnAuction,_auctionID,_bankName,_bidMultipliers,
            _city,_eventType,_reservePrice,_timeStamp
        } = await contractState.assetInterfaceInstance.methods.getNPADetails().call();
        Object.assign(npa,
            {_NPA_ID,_auctionID,_bankName,_assetOnAuction,_city,_timeStamp,_reservePrice,_EMD,_bidMultipliers,_eventType,address
            })
        return {
            flag: true,
            Data: npa
        };
    }catch(e){
        console.log(e);
        return {
            flag: false,
            Data: e
        };
    }
}

module.exports = {createNPA, getUpdate, fetchData};