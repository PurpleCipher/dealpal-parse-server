const User = require('./user'),
    user = new User();
const Deal = require('./deal'),
    deal = new Deal();

Parse.Cloud.beforeSave(Parse.User, async (req) => user.beforeSave(req));
Parse.Cloud.beforeSave(deal.DEAL_CLASS, async (req) => deal.beforeSave(req));
Parse.Cloud.beforeFind(deal.DEAL_CLASS, (req) => deal.beforeFind(req));
Parse.Cloud.define('search-deals', async (req) => deal.search(req));
Parse.Cloud.job('sanitize-deal-job', async (req) => deal.sanitizeDealKeywords(req));
Parse.Cloud.define('getMoreDeals', async(req) => deal.getMoreDeals(req))