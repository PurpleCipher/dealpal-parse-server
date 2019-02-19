const _ = require('lodash'),
	moment = require('moment');

class Deal {

	constructor() {
		this.DEAL_CLASS = 'Deal';
	}

	beforeSave(req) {
		const deal = req.object;
		const title = deal.get('title');
		const bodyText = deal.get('bodyText');
		const offerType = deal.get('offerType');

		if (offerType == 0 && !deal.has('dealUrl')) {
			throw new Parse.Error(401, 'Web deals must have a deal url.');
		}

		let keywords = _.uniq(_.merge(this.toArray(title), this.toArray(bodyText)));

		if (!deal.existed()) {
			const endsAt = moment(deal.get('endsAt')).endOf('day');
			const today = moment();
			if (!deal.has('offerType')) {
				deal.set('offerType', 0);
			}

			if (moment(endsAt).isBefore(today)) {
				throw new Parse.Error(101, 'Deal cannot end before today.');
			} else {
				deal.set('keywords', keywords);
				deal.set('endsAt', endsAt.toDate());
			}
		}
	}

	beforeFind(req) {
		const query = req.query;
		const yesterday = moment().subtract(1, 'day').endOf('day');
		query.greaterThanOrEqualTo('endsAt', yesterday.toDate());
	}

	async getMoreDeals(req) {
		const lastDealId = req.params.dealId;
		const lastDealQuery = new Parse.Query(this.DEAL_CLASS);
		lastDealQuery.equalTo('objectId', lastDealId);

		try {
			const lastDeal = lastDealQuery.first();
			if (!lastDeal) throw new Parse.Error(404, 'Deal not found.');
			const lastDate = lastDeal.get('createdAt');

			const moreDealsQuery = new Parse.Query(this.DEAL_CLASS);
			moreDealsQuery.greaterThanOrEqualTo('createdAt', lastDate);

			return moreDealsQuery.find();
		} catch (error) {
			throw error;
		}
	}

	async search(req) {
		const term = req.params.term;
		const query = new Parse.Query(this.DEAL_CLASS);
		query.containsAll('keywords', term.split(' '));
		query.descending('createdAt');
		try {
			return query.find();
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async sanitizeDealKeywords(req) {
		const query = new Parse.Query(this.DEAL_CLASS);
		query.doesNotExist('keywords');
		req.message('Starting job...')
		try {
			const count = await query.count();
			query.limit(count);
			const deals = await query.find();

			const promises = _.map(deals, async (deal) => {
				req.message(`Sanitizing ${deal.id}`)
				const title = deal.get('title');
				const bodyText = deal.get('bodyText');
				const endsAt = moment(deal.get('endsAt')).endOf('day');

				const titleKeywords = this.toArray(title);
				const bodyKeywords = this.toArray(bodyText)

				let keywords = [];

				_.map(titleKeywords, (w) => {
					keywords.push(w)
				});

				_.map(bodyKeywords, (w) => {
					keywords.push(w)
				});

				keywords = _.uniq(keywords);

				deal.set('keywords', keywords);
				deal.set('endsAt', endsAt.toDate());

				if (!deal.has('categories')) {
					deal.set('categories', [0]);
				}

				await deal.save(null, { useMasterKey: true });
			});
			await Promise.all(promises);
			req.message('Job done!');
		} catch (error) {
			req.message(error.message);
			console.error(error);
		}
	}

	toArray(s) {
		const stopWords = ['the', 'in', 'and', 'is'];
		const toLowerCase = w => w.toLowerCase();
		let words = s.split(' ');
		words = _.map(words, toLowerCase);
		words = _.filter(words, w => w.match(/^\w+$/) && !_.includes(stopWords, w));
		return words;
	}
}

module.exports = Deal;