const http = require('http'),
	app = require('./app');

http.createServer(app).listen(app.get('port'), () => {
	console.log(`Running on ${app.get('port')}`);
});