/**
 * Main file
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * This is the main Pokemon Showdown app, and the file you should be
 * running to start Pokemon Showdown if you're using it normally.
 *
 * This file sets up our SockJS server, which handles communication
 * between users and your server, and also sets up globals. You can
 * see details in their corresponding files, but here's an overview:
 *
 * Users - from users.js
 *
 *   Most of the communication with users happens in users.js, we just
 *   forward messages between the sockets.js and users.js.
 *
 * Rooms - from rooms.js
 *
 *   Every chat room and battle is a room, and what they do is done in
 *   rooms.js. There's also a global room which every user is in, and
 *   handles miscellaneous things like welcoming the user.
 *
 * Tools - from tools.js
 *
 *   Handles getting data about Pokemon, items, etc.
 *
 * Ladders - from ladders.js and ladders-remote.js
 *
 *   Handles Elo rating tracking for players.
 *
 * Chat - from chat.js
 *
 *   Handles chat and parses chat commands like /me and /ban
 *
 * Sockets - from sockets.js
 *
 *   Used to abstract out network connections. sockets.js handles
 *   the actual server and connection set-up.
 *
 * @license MIT license
 */

'use strict';

const fs = require('fs');
const path = require('path');

/*********************************************************
 * Make sure we have everything set up correctly
 *********************************************************/

// Make sure our dependencies are available, and install them if they
// aren't

try {
	require.resolve('sockjs');
} catch (e) {
	if (require.main !== module) throw new Error("Dependencies unmet");

	let command = 'npm install --production';
	console.log('Installing dependencies: `' + command + '`...');
	require('child_process').spawnSync('sh', ['-c', command], {stdio: 'inherit'});
}

/*********************************************************
 * Load configuration
 *********************************************************/

try {
	require.resolve('./config/config');
} catch (err) {
	if (err.code !== 'MODULE_NOT_FOUND') throw err; // should never happen

	// Copy it over synchronously from config-example.js since it's needed before we can start the server
	console.log("config.js doesn't exist - creating one with default settings...");
	fs.writeFileSync(path.resolve(__dirname, 'config/config.js'),
		fs.readFileSync(path.resolve(__dirname, 'config/config-example.js'))
	);
} finally {
	global.Config = require('./config/config');
}

if (Config.watchconfig) {
	let configPath = require.resolve('./config/config');
	fs.watchFile(configPath, (curr, prev) => {
		if (curr.mtime <= prev.mtime) return;
		try {
			delete require.cache[configPath];
			global.Config = require('./config/config');
			if (global.Users) Users.cacheGroupData();
			Gold.readAvatars();
			console.log('Reloaded config/config.js');
		} catch (e) {
			console.log('Error reloading config/config.js: ' + e.stack);
		}
	});
}

/*********************************************************
 * Set up most of our globals
 *********************************************************/

global.Monitor = require('./monitor');

global.Tools = require('./tools');
global.toId = Tools.getId;

global.LoginServer = require('./loginserver');

global.Ladders = require(Config.remoteladder ? './ladders-remote' : './ladders');

global.Users = require('./users');

global.Punishments = require('./punishments');

global.Chat = require('./chat');

global.Rooms = require('./rooms');

delete process.send; // in case we're a child process
global.Verifier = require('./verifier');
Verifier.PM.spawn();

global.Gold = {};
global.Db = require('origindb')('config/db');

global.Tournaments = require('./tournaments');

global.Dnsbl = require('./dnsbl');
Dnsbl.loadDatacenters();

if (Config.crashguard) {
	// graceful crash - allow current battles to finish before restarting
	process.on('uncaughtException', err => {
		let crashType = require('./crashlogger')(err, 'The main process');
		if (crashType === 'lockdown') {
			Rooms.global.startLockdown(err);
		} else {
			Rooms.global.reportCrash(err);
		}
	});
	process.on('unhandledRejection', err => {
		throw err;
	});
}

/*********************************************************
 * Start networking processes to be connected to
 *********************************************************/

global.Sockets = require('./sockets');

exports.listen = function (port, bindAddress, workerCount) {
	Sockets.listen(port, bindAddress, workerCount);
};

if (require.main === module) {
	// if running with node app.js, set up the server directly
	// (otherwise, wait for app.listen())
	let port;
	if (process.argv[2]) {
		port = parseInt(process.argv[2]); // eslint-disable-line radix
	}
	Sockets.listen(port);
}

/*********************************************************
 * Set up our last global
 *********************************************************/

// Generate and cache the format list.
Tools.includeFormats();

global.TeamValidator = require('./team-validator');
TeamValidator.PM.spawn();

// load ipbans at our leisure
/*fs.readFile(path.resolve(__dirname, 'config/ipbans.txt'), (err, data) => {
	if (err) return;
	data = ('' + data).split("\n");
	let rangebans = [];
	for (let i = 0; i < data.length; i++) {
		data[i] = data[i].split('#')[0].trim();
		if (!data[i]) continue;
		if (data[i].includes('/')) {
			rangebans.push(data[i]);
		} else if (!Users.bannedIps[data[i]]) {
			Users.bannedIps[data[i]] = '#ipban';
		}
	}
	Users.checkRangeBanned = Cidr.checker(rangebans);
});*/


// uptime recording
fs.readFile('./logs/uptime.txt', function (err, uptime) {
	if (!err) global.uptimeRecord = parseInt(uptime, 10); // eslint-disable-line radix
	global.uptimeRecordInterval = setInterval(function () {
		if (global.uptimeRecord && process.uptime() <= global.uptimeRecord) return;
		global.uptimeRecord = process.uptime();
		fs.writeFile('./logs/uptime.txt', global.uptimeRecord.toFixed(0));
	}, 1 * 60 * 60 * 1000);
});

//global.tour = require('./tour.js').tour();

/*********************************************************
 * Start up the REPL server
 *********************************************************/

require('./repl').start('app', cmd => eval(cmd));

Array.prototype.sample = function () { // eslint-disable-line no-extend-native
	let arr = this;
	return arr[Math.floor(Math.random() * arr.length)];
};
