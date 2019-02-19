class User {

	async beforeSave(req) {
		const user = req.object;

		if (user.has('email') && !this.validateEmail(user.get('email'))) {
			throw new Parse.Error(101, 'Email is invalid.');
		}

	}

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
}

module.exports = User;
