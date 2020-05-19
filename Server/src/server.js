const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config({path: '../.env'});
const Web3 = require("web3");
const AssetManagerContract = require("./contracts/AssetManager.json");
const AssetInterfaceContract = require("./contracts/AssetInterface.json");
const AuctionManagerContract = require("./contracts/AuctionManager.json")
const mountEthereum = require('./support/ethereum');
const npa = require('./support/npa');
const webScraper = require('./support/webScraper.js');
const init = require('./support/initialiseDatabase.js');

const provider = new Web3.providers.HttpProvider(
    "https://rinkeby.infura.io/v3/d29e6e8389ba4119ac071627843b1521"
);

const app = express();
app.use(bodyParser.json());
app.use(cors());

//-----------------------------------Database simulation---------------------------------

let counter = 400;
const npaAddress = []
const contractState = {};

//===============================================================================

//-----------------------------  API Calls ---------------------------------------//

app.get('/getAuctionManager',(req,res)=>{
    res.json(contractState.auctionManagerAddress);
})

app.get('/getAddress',(req,res)=>{
    res.json(npaAddress);
})

app.post('/fetchData',(req,res)=>{
    const {address} = req.body;
    npa.fetchData(contractState)(address).then(npa=>res.json(npa));
})

app.listen(process.env.PORT || 3001,async ()=>{
    mountEthereum(Web3,provider,AssetManagerContract,AssetInterfaceContract,AuctionManagerContract)().then(async res=>{
        Object.assign(contractState,res);
        let flag = false;
        do{
            await npa.getUpdate(contractState)(counter).then(res=>{
                if(res.flag){
                    npaAddress.push(res.response);
                    counter++;
                }else {
                    flag = true;
                }
            });
        }while(flag===false)
    }).then(res=> {
        init.initialiseDb(webScraper, npa, npaAddress, fetch, process.env.API_TOKEN, counter, contractState)();
        setInterval(()=>
            {
                init.initialiseDb(webScraper, npa, npaAddress, fetch, process.env.API_TOKEN, counter, contractState)();
            }
            ,86400000);
        }
    )

    console.log(`Server listening to port ${process.env.PORT}`);
});