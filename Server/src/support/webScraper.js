const db = {
    sitemap: {
        flag: false,
        id: 0,
        name: ''
    },
    scraping: {
        flag: false,
        id: 0,
    }
};

const jobBody = {
    "sitemap_id": 0,
    "driver": "fulljs",
    "page_load_delay": 2000,
    "request_interval": 2000,
    "proxy": 0
}

//---------------------------Web Scraper Api calls ------------------------------

const toTimestamp = (year,month,day) => {
    const datum = new Date(Date.UTC(year,month,day));
    return datum.getTime()/1000;
}

const parseToJson = (row) => {
    const singleChar = row.split('');
    const filter = singleChar.filter(each=>each!=='\\');
    const {auction_id, bankName, assetOnAuction, city,date, reservePrice, EMD, eventType} = JSON.parse(filter.reduce((str,each)=>str+each));
    const _auction_id = Number(auction_id);
    const _reservePrice = Number(reservePrice);
    const _EMD = Number(EMD);
    const bidMultipliers = 10000;
    const _date = new Date(date);
    const _timestamp = toTimestamp(_date.getFullYear(),_date.getMonth(),_date.getDate());
    return {_auction_id, bankName, assetOnAuction, city,_timestamp, _reservePrice, _EMD, bidMultipliers, eventType};
};

const getSitemaps = (fetch,token) => async () => {
    const response = await fetch('https://api.webscraper.io/api/v1/sitemaps?api_token='+token);
    const sitemaps = await response.json();
    const bea = await sitemaps.data.find(sitemap=>sitemap.name==='BankEAuctions');
    Object.assign(db.sitemap,{
        flag: true,
        id: bea.id,
        name: bea.name,
    });
};

const createScrapingJob = (fetch,token) => async (id) =>{
    Object.assign(jobBody,{"sitemap_id": id});
    const response = await fetch(
        'https://api.webscraper.io/api/v1/scraping-job?api_token='+token,
        {
            method: 'POST',
            body: JSON.stringify(jobBody),
            headers: {'Content-Type': 'application/json'}
        });
    const dataId = await response.json()
    console.log(dataId);
    Object.assign(db.scraping,{
        flag: true,
        id: dataId.data.id,
    });
}

const getScrapingJobStatus = (fetch,token) => async (id) =>{
    const response = await fetch('https://api.webscraper.io/api/v1/scraping-job/'+id+'?api_token='+token);
    const status = await response.json();
    return status.data.status;
};

const getData = (fetch,token) => async (id) => {
    const response = await fetch('https://api.webscraper.io/api/v1/scraping-job/'+id+'/json?api_token='+token);
    const data = await response.text();
    const bracket = await data.split('\n');
    bracket.pop();
    const parse = await bracket.map(row=>parseToJson(row));
    Object.assign(db,{npa: parse});
};

//===============================================================================

module.exports = {getSitemaps, createScrapingJob, getScrapingJobStatus, getData, db};