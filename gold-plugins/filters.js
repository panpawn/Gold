/**
 * Filters
 * Gold Server - http://gold.psim.us/
 *
 * Manually sets filters for chatting and names.
 * In this, we also handle proxy connections with a blacklist feature.
 * Credits: jd, panpawn
 *
 * @license MIT license
 */
'use strict';

const fs = require('fs');

let adWhitelist = Config.adWhitelist ? Config.adWhitelist : [];
let adRegex = new RegExp("(play.pokemonshowdown.com\\/~~)(?!(" + adWhitelist.join('|') + "))", "g");

let bannedMessages = Config.bannedMessages ? Config.bannedMessages : [];

let proxyWhitelist = Config.proxyWhitelist || false;

/*********************
 * Chatfilter Magic *
 * ******************/

exports.chatfilter = function (message, user, room, connection, targetUser) {
	user.lastActiveTime = Date.now();
	if (!room && !Users(targetUser)) targetUser = {name: 'unknown user'};

	// global banned messages
	for (let x in bannedMessages) {
		if (message.toLowerCase().indexOf(bannedMessages[x]) > -1 && bannedMessages[x] !== '' && message.substr(0, 1) !== '/') {
			if (user.locked) return false;
			Punishments.lock(user, Date.now() + 7 * 24 * 60 * 60 * 1000, null, `Attempted to link an inappropriate website`);
			user.popup('You have been automatically locked for sending a message containing an inappropriate website.');
			Monitor.log(`[PornMonitor] LOCKED: ${user.name} ${room ? `<<${room.id}>>` : `(PM to ${targetUser.name})`} for trying to say "${message}"`);
			modlog(`${user.name} was locked from talking by the Server (${bannedMessages[x]}) (${connection.ip})`);
			Gold.pmUpperStaff(user.name + ' has been automatically locked for sending a message containing a banned word' +
			(room ? ". **Room:**" + room.id : " in a private message to " + targetUser.name + ".") + ' **Message:** ' + message, '~Server');
			return false;
		}
	}

	// advertising
	let pre_matches = (message.match(/[pP][sS][iI][mM].[uU][sS]|[pP][sS][iI][mM] [uU][sS]|[pP][sS][mM].[uU][sS]|[pP][sS][mM] [uU][sS]/g) || []).length;
	let final_check = (pre_matches >= 1 ? adWhitelist.filter(server => { return ~message.indexOf(server); }).length : 0);
	if (!user.can('lock') && (pre_matches >= 1 && final_check === 0 || pre_matches >= 2 && final_check >= 1 || message.match(adRegex))) {
		const location = (room ? ` in <<${room.id}>>` : `(in a PM to ${targetUser.name})`);
		if (room && !room.isPrivate) {
			user.sendTo(room.id, `|html|<div class="message-error">Advertising other servers is against our rules, so your message was not sent.</div>`);
			Monitor.log(`[AdvMonitor] ${user.name} tried to say: "${message}" ${location}`);
			return false;
		} else { // PMs
			Monitor.log(`[AdvMonitor] ${user.name} said: "${message}" ${location}`);
		}
	}

	if (Config.autoSban && !user.can('hotpatch')) {
		let autoSban = '';
		Config.autoSban.forEach(phrase => {
			if (message.includes(phrase)) autoSban = phrase;
		});
		if (autoSban !== '') {
			Users.ShadowBan.addUser(user);
			let msg = (room ? " **Room:** " + room.id : " in a private message to " + targetUser.name + ".") + " **Message:** " + message;
			modlog(`${user.name} was shadow banned by the Server. (Message contained: ${autoSban}) (${connection.ip})`);
			Gold.pmUpperStaff(user.name + " has been sbanned for triggering autosban" + msg, "~Server");
			Monitor.log(`[TextMonitor] SHADOWBANNED: ${user.name}: ${msg}`);
			return false;
		}
	}

	if (room && room.id === 'lobby') { // lag test messages
		if (message.toLocaleString() === 'test' || message === '.' || toId(message) === 'lagtest' || toId(message) === 'testlag') {
			user.sendTo(room.id, `|c:|${~~(Date.now() / 1000)}|${user.getIdentity(room.id)}|${message}`);
			return false;
		}
	}

	return message;
};

function modlog(message) {
	fs.appendFileSync(`logs/modlog/modlog_staff.txt`, `[${(new Date().toJSON())}] (staff) ${message}\n`);
}
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


Chat.namefilter = function (name, user) {
	const badHosts = Object.keys(Gold.lockedHosts);
	const nameId = toId(name);

	let badNameMatch = false;
	Config.bannedNames.forEach(badName => {
		if (badNameMatch) return;
		if (badName && nameId.includes(badName)) {
			badNameMatch = true;
		}
	});
	if (badNameMatch) {
		user.send('|nametaken||Your name contains a banned word. Please change it to something appropriate.');
		user.forceRenamed = name;
		return false;
	}

	if (user.forceRenamed) {
		Monitor.log(`[NameMonitor] ${name} (forcerenamed from ${user.forceRenamed})`);
		user.forceRenamed = undefined;
	}

	// Hostfilter stuff
	if (!user.connections) return name; // this should never happen
	let conNum = Object.keys(user.connections).length - 1;
	const ip = user.connections[conNum].ip;
	const trusted = trustedHack(nameId);

	if (Config.autoSbanIps && Config.autoSbanIps.includes(ip)) {
		const added = Users.ShadowBan.addUser(user, true);
		if (added) Monitor.log(`[IPShadowBanMonitor] SHADOWBANNED: ${name}`);
		return;
	}

	Dnsbl.reverse(ip).then(host => {
		if (!host) return;
		if (badHosts.length < 0) return; // there are no blacklisted hosts (yet)

		// handling "trusted" users...
		if (trusted) return;
		if (Gold.userData[toId(name)] && Gold.userData[toId(name)].proxywhitelist) return;
		if (proxyWhitelist && proxyWhitelist.includes(nameId)) return;

		badHosts.forEach(badHost => {
			if (host.includes(badHost)) {
				user.locked = '#hostfilter';
				user.updateIdentity();
				user.popup("|modal|You have been automatically locked due to being on a proxy known for spam and abuse.\n\nLog off PS! and try reconnecting without a proxy to be unlocked.");
				// Monitor.log("[ProxyMonitor] " + name + " (" + ip + ") has been automatically locked. (" + host + ")");
				return;
			}
		});
	});

	Gold.evadeMonitor(user, name);

	return name;
};

// deal with global ranked user's manually...
function trustedHack(name) {
	let nameId = toId(name);
	let userSymbol = (Users.usergroups[nameId] ? Users.usergroups[nameId].substr(0, 1) : ' ');
	let rankIndex = (Config.groupsranking.includes(userSymbol) ? Config.groupsranking.indexOf(userSymbol) : false);
	if (rankIndex && rankIndex > 0) return true;
	return false;
}

/*********************
 * Hostfilter Magic *
 * ******************/
Gold.lockedHosts = Object.create(null);

function loadHostBlacklist() {
	fs.readFile('config/lockedhosts.json', 'utf8', function (err, file) {
		if (err) return;
		Gold.lockedHosts = JSON.parse(file);
	});
}
loadHostBlacklist();

function saveHost() {
	fs.writeFileSync('config/lockedhosts.json', JSON.stringify(Gold.lockedHosts));
}


Gold.evadeMonitor = function (user, name, punished) {
	if (punished && punished.alts) { // handles when user is unlocked
		punished.alts.forEach(alt => {
			if (Gold.punishments[toId(alt)]) delete Gold.punishments[toId(alt)];
		});
		Gold.savePunishments();
		return;
	}
	let points = 0;
	let matched = false;
	let userAgent = user.useragent;
	let ip = user.latestIp;

	if (punished) {
		if (user.permalocked) return;
		let tarId = user.userid;
		Object.keys(Gold.punishments).forEach(punished => {
			if (Gold.punishments[punished].ip === ip) matched = true;
		});
		if (!matched && !Gold.punishments[tarId]) {
			Gold.punishments[tarId] = {
				'useragent': userAgent,
				'ip': ip,
				'iprange': Gold.getIpRange(ip)[0],
				'ipclass': Gold.getIpRange(ip)[1],
				'type': punished.type,
				'expires': punished.expires,
			};
			Gold.savePunishments();
		}
	} else {
		if (user.locked || Users.ShadowBan.checkBanned(user) || trustedHack(name)) return;

		let reasons = [];
		let evader = '', offender = '', reason = '';
		let defaultAvatars = [1, 2, 101, 102, 169, 170, 265, 266];
		let punishedUsers = Object.keys(Gold.punishments);

		for (let i = 0; i < punishedUsers.length; i++) {
			offender = Gold.punishments[punishedUsers[i]];
			if (offender.ip === ip) break;
			if (reasons.length >= 3) break; // this should never happen
			if (offender.expires < Date.now()) {
				delete Gold.punishments[punishedUsers[i]];
				Gold.savePunishments();
			}
			if (offender.useragent && offender.useragent === userAgent) {
				reason = `have the same user agent`;
				if (!reasons.includes(reason)) {
					points++;
					reasons.push(reason);
					evader = `${offender.type} user: ${punishedUsers[i]}`;
				}
			}
			if (offender.iprange && ip.startsWith(offender.iprange)) {
				reason = `have the IPv4 class ${offender.ipclass} range (${offender.iprange}.*)`;
				if (!reasons.includes(reason)) {
					points++;
					reasons.push(reason);
					evader = `${offender.type} user: ${punishedUsers[i]}`;
				}
			}
			// this does not count AS a reason (points), but merely to add to the list of reasons
			if (defaultAvatars.includes(user.avatar)) {
				reason = `have a default avatar`;
				if (!reasons.includes(reason)) {
					reasons.push(reason);
					points = points + 0.5;
				}
			}
		}
		let staff = Rooms('staff');
		if (staff) {
			if (points >= 2) {
				Users.ShadowBan.addUser(name);
				let msg = `[EvadeMonitor] SHADOWBANNED: ${name}, evading alt of ${evader} because they ${reasons.join(' and ')}`;
				staff.add(msg).update();
				modlog(msg);
			}
		}
	}
};

exports.commands = {
	lockhost: function (target, room, user) {
		if (!this.can('pban')) return false;
		if (!target) return this.parse('/help lockhost');
		if (Gold.lockedHosts[target]) return this.errorReply("The host '" + target + "' is was already locked by " + Gold.lockedHosts[target].by + ".");

		Gold.lockedHosts[target] = {
			by: user.name,
			on: Date.now(),
		};
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
			buff += '<tr><td>' + proxy + '</td><td>' + Gold.nameColor(Gold.lockedHosts[proxy].by, false) + '</td><td>' + Chat.toDurationString(Date.now() - Gold.lockedHosts[proxy].on) + ' ago</td></tr>';
		});
		buff += '</table>';

		return this.sendReplyBox(buff);
	},

	spamautolock: 'autolockspam',
	autolockspam: function (target, room, user) {
		if (!this.can('pban')) return false;
		if (!target) return this.sendReply(`This room currently will ${(room.autoLockSpam ? 'autolock' : 'NOT autolock')} spammers.`);
		if (this.meansYes(target)) {
			if (room.autoLockSpam) return this.errorReply("This room is already automatically locking spammers.");
			room.autoLockSpam = true;
			this.privateModCommand(`(${user.name} set this room to automatically lock spammers.)`);
		} else if (this.meansNo(target)) {
			if (!room.autoLockSpam) return this.errorReply("This room already is not automatically locking spammers.");
			room.autoLockSpam = false;
			this.privateModCommand(`(${user.name} set this room to no longer automatically lock spammers.)`);
		} else if (target === 'help') {
			return this.parse('/help autolockspam');
		}
		if (room.chatRoomData) {
			room.chatRoomData.autoLockSpam = room.autoLockSpam;
			Rooms.global.writeChatRoomData();
		}
	},
	autolockspamhelp: [
		"/autolockspam on - Enables automatically locking spammers in the current room. Requires: & ~",
		"/autolockspam off - Disables automatically locking spammers in the current room. Requires: & ~",
	],
};
