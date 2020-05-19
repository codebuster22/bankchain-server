const initialiseDb = (webScraper, npa, npaAddress, fetch, token, counter, contractState) => async () =>{
    let nonce = await contractState.web3.eth.getTransactionCount(contractState.accounts[0]);
    await webScraper.getSitemaps(fetch,token)();
    await webScraper.createScrapingJob(fetch,token)(webScraper.db.sitemap.id);
    const timer = setInterval(async ()=>{
        console.log("Inside Timer");
        const response = await webScraper.getScrapingJobStatus(fetch,token)(webScraper.db.scraping.id);
        console.log(response);
        if(response==='finished'){
            const data = await webScraper.getData(fetch,token)(webScraper.db.scraping.id).then(response=>webScraper.db.npa.forEach((each)=>{
                const {bankName,assetOnAuction,
                    _auction_id,
                    eventType, city,
                    _reservePrice, _EMD, bidMultipliers,
                    _timestamp} = each;
                try{
                    npa.createNPA(contractState, counter,nonce)(bankName, assetOnAuction,
                        _auction_id,
                        eventType, city,
                        _reservePrice, _EMD, bidMultipliers,
                        _timestamp,npaAddress);
                    counter++;
                    nonce++;
                }catch (e) {
                    console.log("caught error");
                }
            }));
            clearInterval(timer);
            console.log("Timer closed");
            return data;
        }},10000)
}

module.exports = {initialiseDb};