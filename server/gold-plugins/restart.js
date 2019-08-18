'use strict';

const CronJob = require('cron').CronJob;

new CronJob('1 20 * * *', function() { // everday at 8:01 EST
	const lobby = Rooms('lobby');
	if (lobby) lobby.add('|raw|<strong>The server is about to automatically restart in 5 minutes.</strong>').update();
	setTimeout(function() {
		process.exit();
	}, 5 * 60 * 1000);
}, null, true, 'America/New_York');
