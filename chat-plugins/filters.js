'use strict';
/* Chat filter plugin
 * By: jd, panpawn
 * Caps/stretching moderating from: https://github.com/Ecuacion/Pokemon-Showdown-Node-Bot/blob/master/features/moderation/index.js
 */

const fs = require('fs');

let adWhitelist = Config.adWhitelist ? Config.adWhitelist : [];
let adRegex = new RegExp("(play.pokemonshowdown.com\\/~~)(?!(" + adWhitelist.join('|') + "))", "g");

let bannedMessages = Config.bannedMessages ? Config.bannedMessages : [];

let watchPhrases = Config.watchPhrases ? Config.watchPhrases : [];
let watchUsers = Config.watchUsers ? Config.watchUsers : [];

/*********************
 * Chatfilter Magic *
 * ******************/

Config.chatfilter = function (message, user, room, connection, targetUser) {
	user.lastActiveTime = Date.now();
	if (!room && !Users(targetUser)) targetUser = {name: 'unknown user'};

	// watch phrases and watch users
	let watchRoom = Rooms('watchroom') ? Rooms('watchroom') : false;
	if (watchRoom) {
		let watchWords = watchPhrases.filter(phrase => { return ~toId(message).indexOf(phrase); }).length;
		let watchUserslist = watchUsers.filter(name => { return ~user.userid.indexOf(name); }).length;
		if (!user.can('hotpatch') && watchWords >= 1 || watchUserslist >= 1) {
			watchRoom.add('|c|' + user.getIdentity() + '| __(' + (room ? "To " + room.id : "Private message to " + targetUser.name) + ")__ " + message).update();
		}
	}

	// global banned messages
	for (let x in bannedMessages) {
		if (message.toLowerCase().indexOf(bannedMessages[x]) > -1 && bannedMessages[x] !== '' && message.substr(0, 1) !== '/') {
			if (user.locked) return false;
			Punishments.lock(user, Date.now() + 7 * 24 * 60 * 60 * 1000, "Said a banned word: " + bannedMessages[x]);
			user.popup('You have been automatically locked for sending a message containing a banned word.');
			Monitor.log('[PornMonitor]' + user.name + ' __(' + (room ? 'In ' + room.id : 'Private message to ' + targetUser.name) + ')__ was automatically locked for trying to say "' + message + '"');
			fs.appendFile('logs/modlog/modlog_staff.txt', '[' + (new Date().toJSON()) + '] (staff) ' + user.name + ' was locked from talking by the Server (' +
			bannedMessages[x] + ') (' + connection.ip + ')\n');
			Gold.pmUpperStaff(user.name + ' has been automatically locked for sending a message containing a banned word' +
			(room ? ". **Room:**" + room.id : " in a private message to " + targetUser.name + ".") + ' **Message:** ' + message, '~Server');
			return false;
		}
	}

	// advertising
	let pre_matches = (message.match(/psim|psim.us|psim us|psm.us|psm us/g) || []).length;
	let final_check = (pre_matches >= 1 ? adWhitelist.filter(server => { return ~message.indexOf(server); }).length : 0);
	if (!user.can('hotpatch') && (pre_matches >= 1 && final_check === 0 || pre_matches >= 2 && final_check >= 1 || message.match(adRegex))) {
		if (user.locked) return false;
		if (!user.advWarns) user.advWarns = 0;
		user.advWarns++;
		if (user.advWarns > 1) {
			Punishments.lock(user, Date.now() + 7 * 24 * 60 * 60 * 1000, "Advertising");
			fs.appendFile('logs/modlog/modlog_staff.txt', '[' + (new Date().toJSON()) + '] (staff) ' + user.name + ' was locked from talking by the Server. (Advertising) (' + connection.ip + ')\n');
			connection.sendTo(room, '|raw|<strong class="message-throttle-notice">You have been locked for attempting to advertise.</strong>');
			Gold.pmUpperStaff(user.name + " has been locked for attempting to advertise" + (room ? ". **Room:**" + room.id : " in a private message to " + targetUser.name + ".") + " **Message:** " + message, "~Server");
			Monitor.log(user.name + " has been locked for attempting to advertise" + (room ? ". **Room:** " + room.id : " in a private message to " + targetUser.name + ".") + " **Message:** " + message);
			return false;
		}
		Gold.pmUpperStaff(user.name + " has attempted to advertise" + (room ? ". **Room:** " + room.id : " in a private message to " + targetUser.name + ".") + " **Message:** " + message, "~Server");
		Monitor.log(user.name + " has attempted to advertise" + (room ? ". **Room:** " + room.id : " in a private message to " + targetUser.name + ".") + " **Message:** " + message);
		connection.sendTo(room, '|raw|<strong class="message-throttle-notice">Advertising detected, your message has not been sent and upper staff has been notified.' + '<br />Further attempts to advertise in a chat OR PMs will result in being locked</strong>');
		connection.user.popup("|modal|Advertising detected, your message has not been sent and upper staff has been notified.\n" + "Further attempts to advertise in a chat OR in PMs will result in being locked");
		return false;
	}
	return message;
};

/*********************
 * Namefilter Magic *
 * ******************/

try {
	Config.bannedNames = fs.readFileSync('config/bannednames.txt', 'utf8').toLowerCase().split('\n');
} catch (e) {
	Config.bannedNames = [];
}

function loadBannedNames() {
	try {
		Config.bannedNames = fs.readFileSync('config/bannednames.txt', 'utf8').toLowerCase().split('\n');
	} catch (e) {
		Config.bannedNames = [];
	}
}
loadBannedNames();


Config.namefilter = function (name) {
	var badNames = Config.bannedNames;
	for (var x in badNames) {
		if (toId(name).indexOf(badNames[x]) > -1 && badNames[x] !== '') {
			Monitor.log('[NameFilter] should probably FR: ' + name);
		}
	}
    return name;
};


/*********************
 * Hostfilter Magic *
 * ******************/

Config.hostfilter = function (host, user, connection) {
	let badHosts = Object.keys(Gold.lockedHosts), userHost = user.latestHost.toLowerCase();
	if (badHosts.length < 0) return false; // no hosts are blacklisted (yet)

	badHosts.forEach(host => {
		if (userHost.includes(host)) {
			user.locked = '#hostfilter';
			user.updateIdentity();
			user.popup('|modal|You have been automatically locked due to being on a blacklisted proxy.  If you feel that this is a mistake, PM an Upper Staff member to discuss it.');
			return;
		}
	});
};

Gold.lockedHosts = Object.create(null);

function loadHostBlacklist () {
	fs.readFile('config/lockedhosts.json', 'utf8', function (err, file) {
		if (err) return;
		Gold.lockedHosts = JSON.parse(file);
	});
}
loadHostBlacklist();

function saveHost () {
	fs.writeFileSync('config/lockedhosts.json', JSON.stringify(Gold.lockedHosts));
}

exports.commands = {
	lockhost: function (target, room, user) {
		if (!this.can('pban')) return false;
		if (!target) return this.parse('/help lockhost');
		if (Gold.lockedHosts[target]) return this.errorReply("The host '" + target + "' is was already locked by " + Gold.lockedHosts[target].by + ".");

		Gold.lockedHosts[target] = {
			by: user.name,
			on: Date.now(),
		}
		saveHost();

		this.privateModCommand("(" + user.name + " has blacklisted host: " + target + ")");
	},
	lockhosthelp: ["/lockhost [host] - Adds host to server blacklist.  Users connecting with these hosts will be automatically locked from connection, so use this carefully! Requires & ~"],

	unlockhost: function (target, room, user) {
		if (!this.can('pban')) return false;
		if (!target) return this.parse('/help unlockhost');
		if (!Gold.lockedHosts[target]) return this.errorReply("The host '" + target + "' is not currently blacklisted.");

		delete Gold.lockedHosts[target];
		saveHost();

		this.privateModCommand("(" + user.name + " has unblacklisted host: " + target + ")");
	},
	unlockhosthelp: ["/unlockhost [host] - Removes a host from the server's blacklist.  Requires & ~"],

	proxylist: function (target, room, user) {
		if (!this.can('pban')) return false;
		let badHosts = Object.keys(Gold.lockedHosts);
		if (badHosts.length < 0) return this.errorReply("Weird, no proxies have been blacklisted (yet).");

		let buff = '<table border="1" cellspacing ="0" cellpadding="3"><tr><td><b>Proxy:</b></td><td><b>Blacklisted By:</b></td><td><b>Blacklisted:</b></td></tr>';
		badHosts.forEach(proxy => {
			buff += '<tr><td>' + proxy + '</td><td>' + Gold.lockedHosts[proxy].by + '</td><td>' + Tools.toDurationString(Date.now() - Gold.lockedHosts[proxy].on) + ' ago</td></tr>';
		});

		return this.sendReplyBox(buff);
	}
};
