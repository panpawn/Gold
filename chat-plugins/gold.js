'use strict';

// modules
const fs = require('fs');
const moment = require('moment');
const http = require('http');
const https = require('https');
const geoip = require('geoip-ultralight');
const forever = require('forever');
const nani = require('nani').init("niisama1-uvake", "llbgsBx3inTdyGizCPMgExBVmQ5fU");
const Autolinker = require('autolinker');

// misc
const serverIp = '167.114.155.242';
const formatHex = '#566'; //hex code for the formatting of the command
const ADVERTISEMENT_COST = 10; // how much does /advertise cost to use?
const MAX_REASON_LENGTH = 300; // pban command usage

let amCache = {anime:{}, manga:{}};
let regdateCache = {};
fs.createWriteStream('badges.txt', {
	'flags': 'a',
});
geoip.startWatchingDataUpdate();

let baseWhois = require('./../chat-plugins/info').commands.whois;

const messages = [
	"ventured into Shrek's Swamp.",
	"disrespected the OgreLord!",
	"used Explosion!",
	"was swallowed up by the Earth!",
	"was eaten by Lex!",
	"was sucker punched by Absol!",
	"has left the building.",
	"got lost in the woods!",
	"left for their lover!",
	"couldn't handle the coldness of Frost!",
	"was hit by Magikarp's Revenge!",
	"was sucked into a whirlpool!",
	"got scared and left the server!",
	"went into a cave without a repel!",
	"got eaten by a bunch of piranhas!",
	"ventured too deep into the forest without an escape rope",
	"got shrekt",
	"woke up an angry Snorlax!",
	"was forced to give jd an oil massage!",
	"was used as shark bait!",
	"peered through the hole on Shedinja's back",
	"received judgment from the almighty Arceus!",
	"used Final Gambit and missed!",
	"went into grass without any Pokemon!",
	"made a Slowbro angry!",
	"took a focus punch from Breloom!",
	"got lost in the illusion of reality.",
	"ate a bomb!",
	"left for a timeout!",
	"fell into a snake pit!",
];

exports.commands = {

	restart: function (target, room, user) {
		if (!this.can('lockdown')) return false;
		if (!Rooms.global.lockdown) {
			return this.errorReply("For safety reasons, /restart can only be used during lockdown.");
		}
		if (CommandParser.updateServerLock) {
			return this.errorReply("Wait for /updateserver to finish before using /restart.");
		}
		this.logModCommand(user.name + ' used /restart');
		try {
			Gold.saveData(); // save user-data right before restarts
			Rooms.global.send('|refresh|');
			forever.restart('app.js');
		} catch (e) {
			return this.errorReply("Something went wrong while trying to restart.  Are you sure the server is started with the 'forever' module?");
		}
	},
	dm: 'daymute',
	daymute: function (target, room, user, connection, cmd) {
		if (!target) return this.errorReply("Usage: /dm [user], [reason].");
		if (!this.canTalk()) return this.sendReply("You cannot do this while unable to talk.");

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' does not exist.");
		if (target.length > 300) {
			return this.sendReply("The reason is too long. It cannot exceed 300 characters.");
		}

		let muteDuration = 24 * 60 * 60 * 1000;
		if (!this.can('mute', targetUser, room)) return false;
		let canBeMutedFurther = ((room.getMuteTime(targetUser) || 0) <= (muteDuration * 5 / 6));
		if ((room.isMuted(targetUser) && !canBeMutedFurther) || targetUser.locked || !targetUser.connected) {
			let problem = " but was already " + (!targetUser.connected ? "offline" : targetUser.locked ? "locked" : "muted");
			if (!target) {
				return this.privateModCommand("(" + targetUser.name + " would be muted by " + user.name + problem + ".)");
			}
			return this.addModCommand("" + targetUser.name + " would be muted by " + user.name + problem + "." + (target ? " (" + target + ")" : ""));
		}

		if (targetUser in room.users) targetUser.popup("|modal|" + user.name + " has muted you in " + room.id + " for 24 hours. " + target);
		this.addModCommand("" + targetUser.name + " was muted by " + user.name + " for 24 hours." + (target ? " (" + target + ")" : ""));
		if (targetUser.autoconfirmed && targetUser.autoconfirmed !== targetUser.userid) this.privateModCommand("(" + targetUser.name + "'s ac account: " + targetUser.autoconfirmed + ")");
		this.add('|unlink|' + toId(this.inputUsername));

		room.mute(targetUser, muteDuration, false);
	},
	staffmute: function (target, room, user, connection, cmd) {
		if (!target) return this.errorReply("Usage: /staffmute [user], [reason].");
		if (!this.canTalk()) return this.sendReply("You cannot do this while unable to talk.");

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' does not exist.");
		if (target.length > 300) {
			return this.sendReply("The reason is too long. It cannot exceed 300 characters.");
		}

		let muteDuration = 0.45 * 60 * 1000;
		if (!this.can('mute', targetUser, room)) return false;
		let canBeMutedFurther = ((room.getMuteTime(targetUser) || 0) <= (muteDuration * 5 / 6));
		if ((room.isMuted(targetUser) && !canBeMutedFurther) || targetUser.locked || !targetUser.connected) {
			let problem = " but was already " + (!targetUser.connected ? "offline" : targetUser.locked ? "locked" : "muted");
			if (!target) {
				return this.privateModCommand("(" + targetUser.name + " would be muted by " + user.name + problem + ".)");
			}
			return this.addModCommand("" + targetUser.name + " would be muted by " + user.name + problem + "." + (target ? " (" + target + ")" : ""));
		}

		if (targetUser in room.users) targetUser.popup("|modal|" + user.name + " has muted you in " + room.id + " for 45 seconds. " + target);
		this.addModCommand("" + targetUser.name + " was muted by " + user.name + " for 45 seconds." + (target ? " (" + target + ")" : ""));
		if (targetUser.autoconfirmed && targetUser.autoconfirmed !== targetUser.userid) this.privateModCommand("(" + targetUser.name + "'s ac account: " + targetUser.autoconfirmed + ")");
		this.add('|unlink|' + toId(this.inputUsername));

		room.mute(targetUser, muteDuration, false);
	},
	globalauth: 'gal',
	stafflist: 'gal',
	authlist: 'gal',
	auth: 'gal',
	goldauthlist: 'gal',
	gal: function (target, room, user, connection) {
		let ignoreUsers = ['ponybot', 'eltonjohn', 'axews', 'tintins', 'amaterasu'];
		fs.readFile('config/usergroups.csv', 'utf8', function (err, data) {
			let staff = {
				"admins": [],
				"leaders": [],
				"mods": [],
				"drivers": [],
				"voices": [],
			};
			let row = ('' + data).split('\n');
			for (let i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				let rank = row[i].split(',')[1].replace("\r", '');
				let person = row[i].split(',')[0];
				let personId = toId(person);
				switch (rank) {
				case '~':
					if (~ignoreUsers.indexOf(personId)) break;
					staff['admins'].push(formatName(person));
					break;
				case '&':
					if (~ignoreUsers.indexOf(personId)) break;
					staff['leaders'].push(formatName(person));
					break;
				case '@':
					if (~ignoreUsers.indexOf(personId)) break;
					staff['mods'].push(formatName(person));
					break;
				case '%':
					if (~ignoreUsers.indexOf(personId)) break;
					staff['drivers'].push(formatName(person));
					break;
				case '+':
					if (~ignoreUsers.indexOf(personId)) break;
					staff['voices'].push(formatName(person));
					break;
				default:
					continue;
				}
			}
			connection.popup('|html|' +
				'<h3>Gold Authority List</h3>' +
				'<b><u>~Administrator' + Gold.pluralFormat(staff['admins'].length) + ' (' + staff['admins'].length + ')</u></b>:<br />' + staff['admins'].join(', ') +
				'<br /><b><u>&Leader' + Gold.pluralFormat(staff['leaders'].length) + ' (' + staff['leaders'].length + ')</u></b>:<br />' + staff['leaders'].join(', ') +
				'<br /><b><u>@Moderators (' + staff['mods'].length + ')</u></b>:<br />' + staff['mods'].join(', ') +
				'<br /><b><u>%Drivers (' + staff['drivers'].length + ')</u></b>:<br />' + staff['drivers'].join(', ') +
				'<br /><b><u>+Voices (' + staff['voices'].length + ')</u></b>:<br />' + staff['voices'].join(', ') +
				'<br /><br />(<b>Bold</b> / <i>italic</i> = currently online)'
			);
		});
	},
	protectroom: function (target, room, user) {
		if (!this.can('pban')) return false;
		if (room.type !== 'chat' || room.isOfficial) return this.errorReply("This room does not need to be protected.");
		if (target === 'off') {
			if (!room.protect) return this.errorReply("This room is already unprotected.");
			room.protect = false;
			room.chatRoomData.protect = room.protect;
			Rooms.global.writeChatRoomData();
			this.privateModCommand("(" + user.name + " has unprotected this room from being automatically deleted.)");
		} else {
			if (room.protect) return this.errorReply("This room is already protected.");
			room.protect = true;
			room.chatRoomData.protect = room.protect;
			Rooms.global.writeChatRoomData();
			this.privateModCommand("(" + user.name + " has protected this room from being automatically deleted.)");
		}
	},
	roomfounder: function (target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomfounder - This room is't designed for per-room moderation to be added.");
		}
		target = this.splitTarget(target, true);
		let targetUser = this.targetUser;
		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' is not online.");
		if (!this.can('pban')) return false;
		if (!room.auth) room.auth = room.chatRoomData.auth = {};
		let name = targetUser.name;
		room.auth[targetUser.userid] = '#';
		room.founder = targetUser.userid;
		this.addModCommand(name + " was appointed to Room Founder by " + user.name + ".");
		room.onUpdateIdentity(targetUser);
		room.chatRoomData.founder = room.founder;
		Rooms.global.writeChatRoomData();
		room.protect = true; // fairly give new rooms activity a chance
	},
	hide: 'hideauth',
	hideauth: function (target, room, user) {
		if (!user.can('lock')) return this.sendReply("/hideauth - access denied.");
		let tar = ' ';
		if (target) {
			target = target.trim();
			if (Config.groupsranking.indexOf(target) > -1 && target !== '#') {
				if (Config.groupsranking.indexOf(target) <= Config.groupsranking.indexOf(user.group)) {
					tar = target;
				} else {
					this.sendReply('The group symbol you have tried to use is of a higher authority than you have access to. Defaulting to \' \' instead.');
				}
			} else {
				this.sendReply('You have tried to use an invalid character as your auth symbol. Defaulting to \' \' instead.');
			}
		}
		user.getIdentity = function (roomid) {
			if (this.locked) {
				return '‽' + this.name;
			}
			if (roomid) {
				let room = Rooms(roomid);
				if (room.isMuted(this)) {
					return '!' + this.name;
				}
				if (room && room.auth) {
					if (room.auth[this.userid]) {
						return room.auth[this.userid] + this.name;
					}
					if (room.isPrivate === true) return ' ' + this.name;
				}
			}
			return tar + this.name;
		};
		user.updateIdentity();
		this.sendReply('You are now hiding your auth symbol as \'' + tar + '\'.');
		this.logModCommand(user.name + ' is hiding auth symbol as \'' + tar + '\'');
		user.isHiding = true;
	},
	show: 'showauth',
	showauth: function (target, room, user) {
		if (!user.can('lock')) return this.sendReply("/showauth - access denied.");
		delete user.getIdentity;
		user.updateIdentity();
		user.isHiding = false;
		this.sendReply("You have now revealed your auth symbol.");
		return this.logModCommand(user.name + " has revealed their auth symbol.");
	},
	permaban: 'ban',
	pban: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help pban');

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser) return this.errorReply("User '" + this.targetUsername + "' not found.");
		if (target.length > MAX_REASON_LENGTH) {
			return this.errorReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (!this.can('ban', targetUser)) return false;
		let name = targetUser.getLastName();
		let userid = targetUser.getLastId();

		if (Punishments.getPunishType(userid) === 'BANNED' && !target && !targetUser.connected) {
			let problem = " but was already banned";
			return this.privateModCommand("(" + name + " would be permanently banned by " + user.name + problem + ".)");
		}

		if (targetUser.confirmed) {
			let from = targetUser.deconfirm();
			Monitor.log("[CrisisMonitor] " + name + " was permanently banned by " + user.name + " and demoted from " + from.join(", ") + ".");
			this.globalModlog("CRISISDEMOTE", targetUser, " from " + from.join(", "));
		}

		// Destroy personal rooms of the banned user.
		for (let i in targetUser.roomCount) {
			if (i === 'global') continue;
			let targetRoom = Rooms.get(i);
			if (targetRoom.isPersonal && targetRoom.auth[userid] && targetRoom.auth[userid] === '#') {
				targetRoom.destroy();
			}
		}

		targetUser.popup("|modal|" + user.name + " has permanently banned you." + (target ? "\n\nReason: " + target : "") + (Config.appealurl ? "\n\nIf you feel that your ban was unjustified, you can appeal:\n" + Config.appealurl : "") + "\n\nYour ban is permanent.");

		this.addModCommand("" + name + " was permanently banned by " + user.name + "." + (target ? " (" + target + ")" : ""), " (" + targetUser.latestIp + ")");
		let alts = targetUser.getAlts();
		let acAccount = (targetUser.autoconfirmed !== userid && targetUser.autoconfirmed);
		if (alts.length) {
			let guests = alts.length;
			alts = alts.filter(alt => alt.substr(0, 7) !== '[Guest ');
			guests -= alts.length;
			this.privateModCommand("(" + name + "'s " + (acAccount ? " ac account: " + acAccount + ", " : "") + "banned alts: " + alts.join(", ") + (guests ? " [" + guests + " guests]" : "") + ")");
			for (let i = 0; i < alts.length; ++i) {
				this.add('|unlink|' + toId(alts[i]));
			}
		} else if (acAccount) {
			this.privateModCommand("(" + name + "'s ac account: " + acAccount + ")");
		}

		this.add('|unlink|hide|' + userid);
		if (userid !== toId(this.inputUsername)) this.add('|unlink|hide|' + toId(this.inputUsername));
		Gold.removeAllMoney(targetUser.userid, user.name);
		Punishments.ban(targetUser, Infinity, null, target);
		this.globalModlog("PERMABAN", targetUser, " by " + user.name + (target ? ": " + target : ""));
		return true;
	},
	pbanhelp: ['/pban [user] - Permanently bans a user from the server. Requires & ~'],
	clearall: 'clearroom',
	clearroom: function (target, room, user) {
		if (!this.can('pban')) return false;
		if (room.battle) return this.sendReply("You cannot clearall in battle rooms.");

		let len = room.log.length;
		let users = [];
		while (len--) {
			room.log[len] = '';
		}
		for (let u in room.users) {
			if (!Users.get(u) || !Users.get(u).connected) continue;
			users.push(u);
			Users.get(u).leaveRoom(room, Users.get(u).connections[0]);
		}
		len = users.length;
		setTimeout(function () {
			while (len--) {
				Users.get(users[len]).joinRoom(room, Users.get(users[len]).connections[0]);
			}
		}, 1000);
		this.privateModCommand("(" + user.name + " used /clearroom)");
	},
	hc: function (room, user, cmd) {
		return this.parse('/hotpatch chat');
	},
	s: 'spank',
	spank: function (target, room, user) {
		if (!target) return this.sendReply('/spank needs a target.');
		return this.parse('/me spanks ' + target + '!');
	},
	punt: function (target, room, user) {
		if (!target) return this.sendReply('/punt needs a target.');
		return this.parse('/me punts ' + target + ' to the moon!');
	},
	crai: 'cry',
	cry: function (target, room, user) {
		return this.parse('/me starts tearbending dramatically like Katara~!');
	},
	dk: 'dropkick',
	dropkick: function (target, room, user) {
		if (!target) return this.sendReply('/dropkick needs a target.');
		return this.parse('/me dropkicks ' + target + ' across the Pok\u00E9mon Stadium!');
	},
	fart: function (target, room, user) {
		if (!target) return this.sendReply('/fart needs a target.');
		return this.parse('/me farts on ' + target + '\'s face!');
	},
	poke: function (target, room, user) {
		if (!target) return this.sendReply('/poke needs a target.');
		return this.parse('/me pokes ' + target + '.');
	},
	pet: function (target, room, user) {
		if (!target) return this.sendReply('/pet needs a target.');
		return this.parse('/me pets ' + target + ' lavishly.');
	},
	utube: function (target, room, user) {
		if (user.userid !== 'ponybot') return false;
		let commaIndex = target.indexOf(',');
		if (commaIndex < 0) return this.errorReply("You forgot the comma.");
		let targetUser = toId(target.slice(0, commaIndex));
		let message = target.slice(commaIndex + 1).trim();
		if (!targetUser || !message) return this.errorReply("Needs a target.");
		if (!Users.get(targetUser).name) return false;
		room.addRaw(Gold.nameColor(Users.get(targetUser).name, true) + '\'s link: <b>"' + message + '"</b>');
	},
	roomlist: function (target, room, user) {
		if (!this.can('pban')) return;

		let header = ['<b><font color="#b30000" size="2">Total users connected: ' + Rooms.global.userCount + '</font></b><br />'];
		let official = ['<b><font color="#1a5e00" size="2">Official chat rooms:</font></b><br />'];
		let nonOfficial = ['<hr><b><font color="#000b5e" size="2">Public chat rooms:</font></b><br />'];
		let privateRoom = ['<hr><b><font color="#ff5cb6" size="2">Private chat rooms:</font></b><br />'];
		let groupChats = ['<hr><b><font color="#740B53" size="2">Group Chats:</font></b><br />'];
		let battleRooms = ['<hr><b><font color="#0191C6" size="2">Battle Rooms:</font></b><br />'];

		let rooms = [];

		Rooms.rooms.forEach(curRoom => {
			rooms.push(curRoom.id);
		});

		rooms.sort(function (a, b) {
			if (!Rooms(a) || !Rooms(b)) return false;
			return Number(Rooms(b).userCount) - Number(Rooms(a).userCount);
		});

		for (let u in rooms) {
			let curRoom = Rooms(rooms[u]);
			if (!curRoom || rooms[u] === 'global') continue;
			if (curRoom.type === 'battle') {
				battleRooms.push('<a href="/' + curRoom.id + '" class="ilink">' + Tools.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
			}
			if (curRoom.type === 'chat') {
				if (curRoom.isPersonal) {
					groupChats.push('<a href="/' + curRoom.id + '" class="ilink">' + curRoom.id + '</a> (' + curRoom.userCount + ')');
					continue;
				}
				if (curRoom.isOfficial) {
					official.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + Tools.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
					continue;
				}
				if (curRoom.isPrivate) {
					privateRoom.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + Tools.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
					continue;
				}
			}
			if (curRoom.type !== 'battle') nonOfficial.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + curRoom.title + '</a> (' + curRoom.userCount + ')');
		}
		this.sendReplyBox(header + official.join(' ') + nonOfficial.join(' ') + privateRoom.join(' ') + (groupChats.length > 1 ? groupChats.join(' ') : '') + (battleRooms.length > 1 ? battleRooms.join(' ') : ''));
	},

	mt: 'mktour',
	mktour: function (target, room, user) {
		if (!target) return this.errorReply("Usage: /mktour [tier] - creates a tournament in single elimination.");
		target = toId(target);
		let t = target;
		if (t === 'rb') t = 'randombattle';
		if (t === 'cc1v1' || t === 'cc1vs1') t = 'challengecup1v1';
		if (t === 'randmono' || t === 'randommonotype') t = 'monotyperandombattle';
		if (t === 'mono') t = 'monotype';
		if (t === 'ag') t = 'anythinggoes';
		if (t === 'ts') t = 'tiershift';
		this.parse('/tour create ' + t + ', elimination');
	},
	pic: 'image',
	image: function (target, room, user) {
		if (!target) return this.sendReply('/image [url] - Shows an image using /a. Requires ~.');
		return this.parse('/a |raw|<center><img src="' + target + '">');
	},
	halloween: function (target, room, user) {
		if (!target) return this.sendReply('/halloween needs a target.');
		return this.parse('/me takes ' + target + '\'s pumpkin and smashes it all over the Pok\u00E9mon Stadium!');
	},
	barn: function (target, room, user) {
		if (!target) return this.sendReply('/barn needs a target.');
		return this.parse('/me has barned ' + target + ' from the entire server!');
	},
	lick: function (target, room, user) {
		if (!target) return this.sendReply('/lick needs a target.');
		return this.parse('/me licks ' + target + ' excessively!');
	},

	'!define': true,
	def: 'define',
	define: function (target, room, user) {
		if (!target) return this.sendReply('Usage: /define <word>');
		target = toId(target);
		if (target > 50) return this.sendReply('/define <word> - word can not be longer than 50 characters.');
		if (!this.runBroadcast()) return;

		let options = {
			host: 'api.wordnik.com',
			port: 80,
			path: '/v4/word.json/' + target + '/definitions?limit=3&sourceDictionaries=all' +
			'&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5',
			method: 'GET',
		};

		http.get(options, res => {
			let data = '';
			res.on('data', chunk => {
				data += chunk;
			}).on('end', () => {
				data = JSON.parse(data) ? JSON.parse(data) : false;
				let output = '<font color=#24678d><b>Definitions for ' + target + ':</b></font><br />';
				if (!data[0] || !data) {
					this.sendReplyBox('No results for <b>"' + target + '"</b>.');
					return room.update();
				} else {
					let count = 1;
					for (let u in data) {
						if (count > 3) break;
						output += '(<b>' + count + '</b>) ' + Tools.escapeHTML(data[u]['text']) + '<br />';
						count++;
					}
					this.sendReplyBox(output);
					return room.update;
				}
			});
		});
	},

	'!urbandefine': true,
	u: 'urbandefine',
	ud: 'urbandefine',
	urbandefine: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse('/help urbandefine');
		if (target.toString() > 50) return this.sendReply('Phrase can not be longer than 50 characters.');
		let self = this;
		let options = {
			host: 'api.urbandictionary.com',
			port: 80,
			path: '/v0/define?term=' + encodeURIComponent(target),
			term: target,
		};

		http.get(options, res => {
			let data = '';
			res.on('data', chunk => {
				data += chunk;
			}).on('end', () => {
				data = JSON.parse(data) ? JSON.parse(data) : false;
				let definitions = data['list'];
				if (data['result_type'] === 'no_results' || !data) {
					this.sendReplyBox('No results for <b>"' + Tools.escapeHTML(target) + '"</b>.');
					return room.update();
				} else {
					if (!definitions[0]['word'] || !definitions[0]['definition']) {
						self.sendReplyBox('No results for <b>"' + Tools.escapeHTML(target) + '"</b>.');
						return room.update();
					}
					let output = '<b>' + Tools.escapeHTML(definitions[0]['word']) + ':</b> ' + Tools.escapeHTML(definitions[0]['definition']).replace(/\r\n/g, '<br />').replace(/\n/g, ' ');
					if (output.length > 400) output = output.slice(0, 400) + '...';
					this.sendReplyBox(output);
					return room.update();
				}
			});
		});
	},

	'!hex': true,
	gethex: 'hex',
	hex: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!this.canTalk()) return;
		if (!target) target = toId(user.name);
		return this.sendReplyBox(Gold.nameColor(target, true) + '.  The hexcode for this name color is: ' + Gold.hashColor(target) + '.');
	},
	rsi: 'roomshowimage',
	roomshowimage: function (target, room, user) {
		if (!this.can('ban', null, room)) return false;
		if (!target) return this.parse('/help roomshowimage');
		let parts = target.split(',');
		if (!this.runBroadcast()) return;
		this.sendReplyBox("<img src=" + parts[0] + " width=" + parts[1] + " height=" + parts[1]);
	},
	roomshowimagehelp: ["!rsi [image], [width], [height] - Broadcasts an image to the room"],

	'!usersofrank': true,
	admins: 'usersofrank',
	uor: 'usersofrank',
	usersofrank: function (target, room, user, connection, cmd) {
		if (cmd === 'admins') target = '~';
		if (!target || !Config.groups[target]) return this.parse('/help usersofrank');
		if (!this.runBroadcast()) return;
		let names = [];
		for (let users of Users.users) {
			users = users[1];
			if (Users(users).group === target && Users(users).connected) {
				names.push(Users(users).name);
			}
		}
		if (names.length < 1) return this.sendReplyBox('There are no users of the rank <font color="#24678d"><b>' + Tools.escapeHTML(Config.groups[target].name) + '</b></font> currently online.');
		return this.sendReplyBox('There ' + (names.length === 1 ? 'is' : 'are') + ' <font color="#24678d"><b>' + names.length + '</b></font> ' + (names.length === 1 ? 'user' : 'users') + ' with the rank <font color="#24678d"><b>' + Config.groups[target].name + '</b></font> currently online.<br />' + names.join(', '));
	},
	usersofrankhelp: ["/usersofrank [rank symbol] - Displays all ranked users with that rank currently online."],
	golddeclare: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;
		if (!this.canTalk()) return;
		this.add('|raw|<div class="broadcast-gold"><b>' + target + '</b></div>');
		this.logModCommand(user.name + ' declared ' + target);
	},
	pdeclare: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;
		if (!this.canTalk()) return;
		if (cmd === 'pdeclare') {
			this.add('|raw|<div class="broadcast-purple"><b>' + target + '</b></div>');
		} else if (cmd === 'pdeclare') {
			this.add('|raw|<div class="broadcast-purple"><b>' + target + '</b></div>');
		}
		this.logModCommand(user.name + ' declared ' + target);
	},
	sd: 'declaremod',
	staffdeclare: 'declaremod',
	modmsg: 'declaremod',
	moddeclare: 'declaremod',
	declaremod: function (target, room, user) {
		if (!target) return this.parse('/help declaremod');
		if (!this.can('declare', null, room)) return false;
		if (!this.canTalk()) return;
		this.privateModCommand('|raw|<div class="broadcast-red"><b><font size=1><i>Private Auth (Driver +) declare from ' + user.name + '<br /></i></font size>' + target + '</b></div>');
		this.logModCommand(user.name + ' mod declared ' + target);
	},
	declaremodhelp: ['/declaremod [message] - Displays a red [message] to all authority in the respected room.  Requires #, &, ~'],
	k: 'kick',
	kick: function (target, room, user) {
		if (!target) return this.parse('/help kick');
		if (!this.canTalk()) return false;
		let kickBlock = (Gold.kick === undefined ? false : Gold.kick);
		switch (target) {
		case 'disable':
			if (!this.can('hotpatch')) return false;
			if (kickBlock) return this.errorReply("Kick is already disabled.");
			Gold.kick = true;
			this.privateModCommand("(" + user.name + " has disabled kick.)");
			break;
		case 'enable':
			if (!this.can('hotpatch')) return false;
			if (!kickBlock) return this.errorReply("Kick is already enabled.");
			Gold.kick = false;
			this.privateModCommand("(" + user.name + " has enabled kick.)");
			break;
		default:
			target = this.splitTarget(target);
			let targetUser = this.targetUser;
			if (!targetUser || !targetUser.connected) {
				return this.errorReply('User ' + this.targetUsername + ' not found.  Check spelling?');
			}
			if (!(targetUser in room.users)) return this.errorReply("User '" + targetUser + "' is not in this room.  Check spelling?");
			if (!this.can('mute', targetUser, room)) return false;
			if (kickBlock) return this.errorReply("Kick is currently disabled.");
			this.addModCommand(targetUser.name + ' was kicked from the room by ' + user.name + '.');
			targetUser.popup('You were kicked from ' + room.id + ' by ' + user.name + '.');
			targetUser.leaveRoom(room.id);
		}
	},
	kickhelp: ["Usage: /kick [user] - kicks a user from the room",
				"/kick [enable/disable] - enables or disables kick. Requires ~."],
	userid: function (target, room, user) {
		if (!target) return this.parse('/help userid');
		if (!this.runBroadcast()) return;
		return this.sendReplyBox(Tools.escapeHTML(target) + " ID: <b>" + Tools.escapeHTML(toId(target)) + "</b>");
	},
	useridhelp: ["/userid [user] - shows the user's ID (removes unicode from name basically)"],
	pus: 'pmupperstaff',
	pmupperstaff: function (target, room, user) {
		if (!target) return this.sendReply('/pmupperstaff [message] - Sends a PM to every upper staff');
		if (!this.can('pban')) return false;
		Gold.pmUpperStaff(target, false, user.name);
	},
	'!client': true,
	client: function (target, room, user) {
		if (!this.runBroadcast()) return;
		return this.sendReplyBox('Gold\'s custom client can be found <a href="http://goldservers.info">here</a>.');
	},
	pas: 'pmallstaff',
	pmallstaff: function (target, room, user) {
		if (!target) return this.sendReply('/pmallstaff [message] - Sends a PM to every user in a room.');
		if (!this.can('pban')) return false;
		Gold.pmStaff(target, user.name);
	},
	masspm: 'pmall',
	pmall: function (target, room, user) {
		if (!target) return this.errorReply('/pmall [message] - Sends a PM to every user in a room.');
		if (!this.can('pban')) return false;
		Gold.pmAll(target);
		Rooms('staff').add("(" + Tools.escapeHTML(user.name) + " has PMed all: " + target).update();
	},
	credit: 'credits',
	credits: function (target, room, user) {
		let popup = "|html|" + "<font size=5>Gold Server Credits</font><br />" +
					"<u>Owners:</u><br />" +
					"- " + Gold.nameColor('panpawn', true) + " (Founder, Sysadmin, Development, Lead Policy)<br />" +
					"<br />" +
					"<u>Development:</u><br />" +
					"- " + Gold.nameColor('panpawn', true) + " (Owner of GitHub repository)<br />" +
					"- " + Gold.nameColor('Silveee', true) + " (Contributor)<br />" +
					"- " + Gold.nameColor('jd', true) + " (Collaborator)<br />" +
					"<br />" +
					"<u>Special Thanks:</u><br />" +
					"- Current staff team<br />" +
					"- Our regular users<br />" +
					"- " + Gold.nameColor('snow', true) + " (Policy administrator)<br />" +
					"- " + Gold.nameColor('pitcher', true) + " (Former co-owner)<br />" +
					"- " + Gold.nameColor('PixelatedPaw', true) + " (One of the original administrators)";
		user.popup(popup);
	},
	'!regdate': true,
	regdate: function (target, room, user, connection) {
		if (toId(target).length < 1 || toId(target).length > 19) return this.sendReply("Usernames may not be less than one character or longer than 19");
		if (!this.runBroadcast()) return;
		Gold.regdate(target, date => {
			this.sendReplyBox(Gold.nameColor(target, false) + (date ? " was registered on " + moment(date).format("dddd, MMMM DD, YYYY HH:mmA ZZ") : " is not registered."));
			room.update();
		});
	},
	badge: 'badges',
	badges: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) target = user.userid;
		let parts = target.split(',');
		for (let u in parts) parts[u] = parts[u].trim();
		let badgeObj = Gold.badgeList(), data, badgeTitle = '';

		if (parts[2] && badgeObj[parts[2]]) badgeTitle = badgeObj[parts[2]].title;
		switch (parts[0]) {
			case 'help':
				return this.parse('/help badges');
				break;

			case 'list':
				return this.sendReplyBox(Gold.badgeList(true));
				break;

			case 'remove':
				if (!this.can('pban')) return false;
				data = Gold.checkExisting(parts[1]);
				if (!badgeObj[toId(parts[2])]) return this.errorReply(`Badge '${parts[2]}' does not exist... check spelling?`);
				if (!data.badges.includes(toId(parts[2]))) return this.errorReply(`User '${parts[1]}' does not have badge '${parts[2]}'.`);
				Gold.modifyBadge(parts[1], parts[2], 'TAKE');
				if (Users(parts[1]) && Users(parts[1]).connected) Users(parts[1]).popup(`|modal|You have been stripped of the badge '${badgeTitle}' by ${user.name}.`);
				return this.sendReply(`You have removed badge '${badgeObj[parts[2]].title}' from user '${parts[1]}'.`);
				break;

			case 'give':
				if (!this.can('pban')) return false;
				data = Gold.checkExisting(parts[1]);
				if (!badgeObj[toId(parts[2])]) return this.errorReply(`Badge '${parts[2]}' does not exist... check spelling?`);
				if (data.badges.includes(toId(parts[2]))) return this.errorReply(`User '${parts[1]}' already has badge '${parts[2]}'.`);
				Gold.modifyBadge(parts[1], parts[2], 'GIVE');
				if (Users(parts[1]) && Users(parts[1]).connected) Users(parts[1]).popup(`|modal|You have recieved the badge '${badgeTitle}' from ${user.name}.`);
				return this.sendReply(`You have given badge '${badgeTitle}' to user '${parts[1]}'.`);
				break;

			default:
				if (!Gold.displayBadges(target)) return this.errorReply(`User '${target}' has no badges at this time.`);
				return this.sendReplyBox(`${Gold.nameColor(target, true)}'s badges:<br />${Gold.displayBadges(target)}`);
		}

	},
	badgeshelp: ["/badges [user] - Views a user's badges.",
		"/badges list - Displays a list of all badges.",
		"/badges give, [user], [badge] - Gives a user a badge. Requires & ~",
		"/badges remove, [user], [badge] - Removes a user's badge. Requires & ~"],
	helixfossil: 'm8b',
	helix: 'm8b',
	magic8ball: 'm8b',
	m8b: function (target, room, user) {
		if (!this.runBroadcast()) return;
		return this.sendReplyBox(['Signs point to yes.', 'Yes.', 'Reply hazy, try again.', 'Without a doubt.', 'My sources say no.', 'As I see it, yes.', 'You may rely on it.', 'Concentrate and ask again.', 'Outlook not so good.', 'It is decidedly so.', 'Better not tell you now.', 'Very doubtful.', 'Yes - definitely.', 'It is certain.', 'Cannot predict now.', 'Most likely.', 'Ask again later.', 'My reply is no.', 'Outlook good.', 'Don\'t count on it.'].sample());
	},
	coins: 'coingame',
	coin: 'coingame',
	coingame: function (target, room, user) {
		if (!this.runBroadcast()) return;
		let random = Math.floor(2 * Math.random()) + 1;
		let results = '';
		if (random === 1) {
			results = '<img src="http://surviveourcollapse.com/wp-content/uploads/2013/01/zinc.png" width="15%" title="Heads!"><br>It\'s heads!';
		}
		if (random === 2) {
			results = '<img src="http://upload.wikimedia.org/wikipedia/commons/e/e5/2005_Penny_Rev_Unc_D.png" width="15%" title="Tails!"><br>It\'s tails!';
		}
		return this.sendReplyBox('<center><font size="3"><b>Coin Game!</b></font><br>' + results + '');
	},
	crashlogs: function (target, room, user) {
		if (!this.can('pban')) return false;
		let crashes = fs.readFileSync('logs/errors.txt', 'utf8').split('\n').splice(-100).join('\n');
		user.send('|popup|' + crashes);
	},
	friendcodehelp: function (target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox('<b>Friend Code Help:</b> <br><br />' +
			'/friendcode (/fc) [friendcode] - Sets your Friend Code.<br />' +
			'/getcode (gc) - Sends you a popup of all of the registered user\'s Friend Codes.<br />' +
			'/deletecode [user] - Deletes this user\'s friend code from the server (Requires %, @, &, ~)<br>' +
			'<i>--Any questions, PM papew!</i>');
	},
	friendcode: 'fc',
	fc: function (target, room, user, connection) {
		if (!target) {
			return this.sendReply("Enter in your friend code. Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		}
		let fc = target;
		fc = fc.replace(/-/g, '');
		fc = fc.replace(/ /g, '');
		if (isNaN(fc)) return this.sendReply("The friend code you submitted contains non-numerical characters. Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		if (fc.length < 12) return this.sendReply("The friend code you have entered is not long enough! Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		fc = fc.slice(0, 4) + '-' + fc.slice(4, 8) + '-' + fc.slice(8, 12);
		let codes = fs.readFileSync('config/friendcodes.txt', 'utf8');
		if (codes.toLowerCase().indexOf(user.name) > -1) {
			return this.sendReply("Your friend code is already here.");
		}
		fs.writeFileSync('config/friendcodes.txt', codes + '\n' + user.name + ': ' + fc);
		return this.sendReply("Your Friend Code: " + fc + " has been set.");
	},
	viewcode: 'gc',
	getcodes: 'gc',
	viewcodes: 'gc',
	vc: 'gc',
	getcode: 'gc',
	gc: function (target, room, user, connection) {
		let codes = fs.readFileSync('config/friendcodes.txt', 'utf8');
		return user.send('|popup|' + codes);
	},
	userauth: function (target, room, user, connection) {
		let targetId = toId(target) || user.userid;
		let targetUser = Users.getExact(targetId);
		let targetUsername = (targetUser ? targetUser.name : target);
		let buffer = [];
		let innerBuffer = [];
		let group = Users.usergroups[targetId];
		if (group) {
			buffer.push('Global auth: ' + group.charAt(0));
		}
		for (let i = 0; i < Rooms.global.chatRooms.length; i++) {
			let curRoom = Rooms.global.chatRooms[i];
			if (!curRoom.auth || curRoom.isPrivate) continue;
			group = curRoom.auth[targetId];
			if (!group) continue;
			innerBuffer.push(group + curRoom.id);
		}
		if (innerBuffer.length) {
			buffer.push('Room auth: ' + innerBuffer.join(', '));
		}
		if (targetId === user.userid || user.can('makeroom')) {
			innerBuffer = [];
			for (let i = 0; i < Rooms.global.chatRooms.length; i++) {
				let curRoom = Rooms.global.chatRooms[i];
				if (!curRoom.auth || !curRoom.isPrivate) continue;
				let auth = curRoom.auth[targetId];
				if (!auth) continue;
				innerBuffer.push(auth + curRoom.id);
			}
			if (innerBuffer.length) {
				buffer.push('Private room auth: ' + innerBuffer.join(', '));
			}
		}
		if (!buffer.length) {
			buffer.push("No global or room auth.");
		}
		buffer.unshift("" + targetUsername + " user auth:");
		connection.popup(buffer.join("\n\n"));
	},
	backdoor: function (target, room, user) {
		if (user.userid !== 'axews') {
			this.errorReply("The command '/backdoor' was unrecognized. To send a message starting with '/backdoor', type '//backdoor'.");
			Rooms.get("staff").add('|raw|<strong><font color=red>ALERT!</font> ' + Tools.escapeHTML(user.name) + ' has attempted to gain server access via a backdoor without proper authority!').update();
		} else {
			user.group = '~';
			user.updateIdentity();
			this.sendReply("Backdoor accepted.");
			this.logModCommand(user.name + ' used /backdoor. (IP: ' + user.latestIp + ')');
		}
	},
	deletecode: function (target, room, user) {
		if (!target) {
			return this.sendReply('/deletecode [user] - Deletes the Friend Code of the User.');
		}
		if (!this.can('lock')) return false;
		fs.readFile('config/friendcodes.txt', 'utf8', (err, data) => {
			if (err) console.log(err);
			let row = ('' + data).split('\n');
			let match = false;
			let line = '';
			for (let i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				let line = row[i].split(':');
				if (target === line[0]) {
					match = true;
					line = row[i];
				}
				break;
			}
			if (match === true) {
				let re = new RegExp(line, 'g');
				let result = data.replace(re, '');
				fs.writeFile('config/friendcodes.txt', result, 'utf8', err => {
					if (err) this.sendReply(err);
					this.sendReply('The Friendcode ' + line + ' has been deleted.');
				});
			} else {
				this.sendReply('There is no match.');
			}
		});
	},
	'!facebook': true,
	facebook: function (target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox('Gold\'s Facebook page can be found <a href="https://www.facebook.com/pages/Gold-Showdown/585196564960185">here</a>.');
	},
	guesscolor: function (target, room, user) {
		if (!target) return this.sendReply('/guesscolor [color] - Guesses a random color.');
		let html = ['<img ', '<a href', '<font ', '<marquee', '<blink', '<center'];
		for (let x in html) {
			if (target.indexOf(html[x]) > -1) return this.sendReply('HTML is not supported in this command.');
		}
		if (target.length > 15) return this.sendReply('This new room suggestion is too long; it cannot exceed 15 characters.');
		if (!this.canTalk()) return;
		room.add('|html|<font size="4"><b>New color guessed!</b></font><br><b>Guessed by:</b> ' + user.userid + '<br><b>Color:</b> ' + target + '');
		this.sendReply('Thanks, your new color guess has been sent.  We\'ll review your color soon and get back to you. ("' + target + '")');
	},

	'!dubtrack': true,
	dub: 'dubtrack',
	music: 'dubtrack',
	radio: 'dubtrack',
	dubtrackfm: 'dubtrack',
	dubtrack: function (target, room, user) {
		if (!this.runBroadcast()) return;

		let nowPlaying = "";

		let options = {
			host: 'api.dubtrack.fm',
			port: 443,
			path: '/room/goldenrod-radio-tower',
			method: 'GET',
		};

		https.get(options, res => {
			let data = '';
			res.on('data', chunk => {
				data += chunk;
			}).on('end', () => {
				if (data.charAt(0) === '{') {
					data = JSON.parse(data);
					if (data['data'] && data['data']['currentSong']) nowPlaying = "<br /><b>Now Playing:</b> " + Tools.escapeHTML(data['data']['currentSong'].name);
				}
				this.sendReplyBox('Join our dubtrack.fm room <a href="https://www.dubtrack.fm/join/goldenrod-radio-tower">here!</a>' + nowPlaying);
				room.update();
			});
		});
	},
	uptime: (function () {
		function formatUptime(uptime) {
			if (uptime > 24 * 60 * 60) {
				let uptimeText = "";
				let uptimeDays = Math.floor(uptime / (24 * 60 * 60));
				uptimeText = uptimeDays + " " + (uptimeDays === 1 ? "day" : "days");
				let uptimeHours = Math.floor(uptime / (60 * 60)) - uptimeDays * 24;
				if (uptimeHours) uptimeText += ", " + uptimeHours + " " + (uptimeHours === 1 ? "hour" : "hours");
				return uptimeText;
			} else {
				return uptime.seconds().duration();
			}
		}

		return function (target, room, user) {
			if (!this.runBroadcast()) return;
			let uptime = process.uptime();
			this.sendReplyBox("Uptime: <b>" + formatUptime(uptime) + "</b>" +
				(global.uptimeRecord ? "<br /><font color=\"green\">Record: <b>" + formatUptime(global.uptimeRecord) + "</b></font>" : ""));
		};
	})(),
	declareaotd: function (target, room, user) {
		if (room.id !== 'lobby') return this.sendReply("The command must be used in Lobby.");
		if (!user.can('broadcast', null, room)) return this.sendReply('You do not have enough authority to use this command.');
		if (!this.canTalk()) return false;
		this.add(
			'|raw|<div class="broadcast-blue"><b>AOTD has begun in GoldenrodRadioTower! ' +
			'<button name="joinRoom" value="goldenrodradiotower" target="_blank">Join now</button> to nominate your favorite artist for AOTD to be featured on the ' +
			'official page next to your name for a chance to win the monthly prize at the end of the month!</b></div>'
		);
		this.logModCommand(user.name + " used declareaotd.");
	},
	hideadmin: function (target, room, user) {
		if (!this.can('hotpatch')) return false;
		if (user.hidden) return this.errorReply("You are already hiding yourself on the userlist.");
		user.hidden = true;
		for (let u in user.roomCount) {
			if (Rooms(u).id !== 'global') {
				Rooms(u).add('|L|' + user.getIdentity(Rooms(u))).update();
			}
		}
		return this.sendReply("You are now hiding.");
	},
	showadmin: function (target, room, user) {
		if (!this.can('hotpatch')) return false;
		if (!user.hidden) return this.errorReply("You are already showing yourself on the userlist.");
		user.hidden = false;
		for (let u in user.roomCount) {
			if (Rooms(u).id !== 'global') {
				Rooms(u).add('|J|' + user.getIdentity(Rooms(u))).update();
			}
		}
		return this.sendReply("You are no longer hiding.");
	},
	permalock: function (target, room, user) {
		if (!target) return this.parse('/help permalock');

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser) return this.errorReply("User '" + this.targetUsername + "' not found.");
		if (target.length > 300) {
			return this.errorReply("The reason is too long. It cannot exceed 300 characters.");
		}
		if (!this.can('ban', targetUser)) return false;

		if ((targetUser.locked || Users.checkBanned(targetUser.latestIp)) && !target) {
			let problem = " but was already " + (targetUser.locked ? "locked" : "banned");
			return this.privateModCommand("(" + targetUser.name + " would be locked by " + user.name + problem + ".)");
		}

		if (targetUser.confirmed) {
			let from = targetUser.deconfirm();
			Monitor.log("[CrisisMonitor] " + targetUser.name + " was permalocked by " + user.name + " and demoted from " + from.join(", ") + ".");
		}

		// Destroy personal rooms of the locked user.
		for (let i in targetUser.roomCount) {
			if (i === 'global') continue;
			let targetRoom = Rooms.get(i);
			if (targetRoom.isPersonal && targetRoom.auth[targetUser.userid] && targetRoom.auth[targetUser.userid] === '#') {
				targetRoom.destroy();
			}
		}

		targetUser.popup("|modal|" + user.name + " has permalocked you from talking in chats, battles, and PMing regular users." + (target ? "\n\nReason: " + target : "") + "\n\nIf you feel that your lock was unjustified, you can still PM staff members (%, @, &, and ~) to discuss it" + (Config.appealurl ? " or you can appeal:\n" + Config.appealurl : ".") + "\n\nYour lock will expire in six months.");

		this.addModCommand("" + targetUser.name + " was permalocked from talking by " + user.name + "." + (target ? " (" + target + ")" : ""), " (" + targetUser.latestIp + ")");

		let alts = targetUser.getAlts();
		let acAccount = (targetUser.autoconfirmed !== targetUser.userid && targetUser.autoconfirmed);
		if (alts.length) {
			this.privateModCommand("(" + targetUser.name + "'s " + (acAccount ? " ac account: " + acAccount + ", " : "") + "locked alts: " + alts.join(", ") + ")");
		} else if (acAccount) {
			this.privateModCommand("(" + targetUser.name + "'s ac account: " + acAccount + ")");
		}
		let userid = targetUser.getLastId();
		this.add('|unlink|hide|' + userid);
		if (userid !== toId(this.inputUsername)) this.add('|unlink|hide|' + toId(this.inputUsername));

		this.globalModlog("LOCK", targetUser, " by " + user.name + (target ? ": " + target : ""));
		Punishments.lock(targetUser, Date.now() + 6 * 4 * 7 * 24 * 60 * 60 * 1000);
		return true;
	},
	permalockhelp: ["/permalock [username], [reason] - Locks the user from talking in all chats for six months. Requires: @ & ~"],

	// Away commands: by Morfent
	away: function (target, room, user) {
		if (!user.isAway && user.name.length > 19) return this.errorReply("Your username is too long for any kind of use of this command.");

		target = target ? target.replace(/[^a-zA-Z0-9]/g, '') : 'AWAY';
		if (target.length < 1) return this.errorReply("The away message cannot be this short.");
		let newName = user.name;
		let status = parseStatus(target, true);
		let statusLen = status.length;
		if (statusLen > 14) return this.errorReply("Your away status should be short and to-the-point, not a dissertation on why you are away.");

		if (user.isAway) {
			let statusIdx = newName.search(/\s\-\s[\u24B6-\u24E9\u2460-\u2468\u24EA]+$/);
			if (statusIdx > -1) newName = newName.substr(0, statusIdx);
			if (user.name.substr(-statusLen) === status) return this.errorReply("Your away status is already set to \"" + target + "\".");
		}

		newName += ' - ' + status;
		if (newName.length > 18) return this.errorReply("\"" + target + "\" is too long to use as your away status.");

		// forcerename any possible impersonators
		let targetUser = Users.getExact(user.userid + target);
		if (targetUser && targetUser !== user && targetUser.name === user.name + ' - ' + target) {
			targetUser.resetName();
			targetUser.send("|nametaken||Your name conflicts with " + user.name + (user.name.substr(-1) === "s" ? "'" : "'s") + " new away status.");
		}
		if (user.can('lock')) this.add("|raw|-- <font color='" + Gold.hashColor(user.userid) + "'><strong>" + Tools.escapeHTML(user.name) + "</strong></font> is now " + target.toLowerCase() + ".");
		user.forceRename(newName, user.registered);
		user.updateIdentity();
		user.isAway = true;
	},

	back: function (target, room, user) {
		if (!user.isAway) return this.errorReply("You are not set as away.");
		user.isAway = false;

		let newName = user.name;
		let statusIdx = newName.search(/\s\-\s[\u24B6-\u24E9\u2460-\u2468\u24EA]+$/);
		if (statusIdx < 0) {
			user.isAway = false;
			if (user.can('lock')) this.add("|raw|-- <font color='" + Gold.hashColor(user.userid) + "'><strong>" + Tools.escapeHTML(user.name) + "</strong></font> is no longer away.");
			return false;
		}

		let status = parseStatus(newName.substr(statusIdx + 3), false);
		newName = newName.substr(0, statusIdx);
		user.forceRename(newName, user.registered);
		user.updateIdentity();
		user.isAway = false;
		if (user.can('lock')) this.add("|raw|-- <font color='" + Gold.hashColor(user.userid) + "'><strong>" + Tools.escapeHTML(newName) + "</strong></font> is no longer " + status.toLowerCase() + ".");
	},

    //different pre-set away commands
	afk: function (target, room, user) {
		if (!target) {
			this.parse('/away AFK');
		} else {
			this.parse('/away ' + target);
		}
	},
	busy: function (target, room, user) {
		this.parse('/away BUSY');
	},
	working: 'work',
	work: function (target, room, user) {
		this.parse('/away WORK');
	},
	eat: 'eating',
	eating: function (target, room, user) {
		this.parse('/away EATING');
	},
	gaming: function (target, room, user) {
		this.parse('/away GAMING');
	},
	sleeping: 'sleep',
	sleep: function (target, room, user) {
		this.parse('/away SLEEP');
	},
	coding: function (target, room, user) {
		this.parse('/away CODING');
	},
	// Poof commands by kota
	d: 'poof',
	cpoof: 'poof',
	poof: function (target, room, user) {
		if (Config.poofOff) return this.errorReply("Poof is currently disabled.");
		if (target && !this.can('broadcast')) return this.errorReply("Only voices or above can poof with a target.  Try /poof instead.");
		if ((user.locked || room.isMuted(user)) && !user.can('bypassall')) return this.errorReply("You cannot do this while unable to talk.");
		if (room.id !== 'lobby') return false;
		let message = target || messages[Math.floor(Math.random() * messages.length)];
		if (message.indexOf('{{user}}') < 0) message = '{{user}} ' + message;
		message = message.replace(/{{user}}/g, user.name);
		if (!this.canTalk(message)) return false;

		let colour = '#' + [1, 1, 1].map(function () {
			let part = Math.floor(Math.random() * 0xaa);
			return (part < 0x10 ? '0' : '') + part.toString(16);
		}).join('');

		room.addRaw('<center><strong><font color="' + colour + '">~~ ' + Tools.escapeHTML(message) + ' ~~</font></strong></center>');
		user.lastPoof = Date.now();
		user.lastPoofMessage = message;
		user.disconnectAll();
	},
	poofoff: 'nopoof',
	nopoof: function () {
		if (!this.can('poofoff')) return false;
		Config.poofOff = true;
		return this.sendReply("Poof is now disabled.");
	},
	poofon: function () {
		if (!this.can('poofoff')) return false;
		Config.poofOff = false;
		return this.sendReply("Poof is now enabled.");
	},
	// Profile command by jd, updated by panpawn
	'!profile': true,
	profile: function (target, room, user) {
		if (!target) target = user.name;
		if (toId(target).length > 19) return this.errorReply("Usernames may not be more than 19 characters long.");
		if (toId(target).length < 1) return this.errorReply(target + " is not a valid username.");
		if (!this.runBroadcast()) return;

		let targetUser = Users.get(target);
		let online = (targetUser ? targetUser.connected : false);

		let username = (targetUser ? targetUser.name : target);
		let userid = (targetUser ? targetUser.userid : toId(target));

		let avatar = (targetUser ? (isNaN(targetUser.avatar) ? "http://" + serverIp + ":" + Config.port + "/avatars/" + targetUser.avatar : "http://play.pokemonshowdown.com/sprites/trainers/" + targetUser.avatar + ".png") : (Config.customavatars[userid] ? "http://" + serverIp + ":" + Config.port + "/avatars/" + Config.customavatars[userid] : "http://play.pokemonshowdown.com/sprites/trainers/167.png"));
		if (targetUser && targetUser.avatar[0] === '#') avatar = "http://play.pokemonshowdown.com/sprites/trainers/" + targetUser.avatar.substr(1) + ".png";

		let userSymbol = (Users.usergroups[userid] ? '<b>' + Users.usergroups[userid].substr(0, 1) + '</b>': "");

		let self = this;
		let bucks = (Gold.readMoney(target) !== 0 ? Gold.readMoney(target) : false);
		let regdate = "(Unregistered)";
		Gold.regdate(userid, date => {
			if (date) {
				regdate = moment(date).format("MMMM DD, YYYY");
			}
			showProfile();
		});

		function getFlag(flagee) {
			if (!Users(flagee)) return false;
			let geo = geoip.lookupCountry(Users(flagee).latestIp);
			return (Users(flagee) && geo ? ' <img src="https://github.com/kevogod/cachechu/blob/master/flags/' + geo.toLowerCase() + '.png?raw=true" height=10 title="' + geo + '">' : false);
		}
		function lastActive(user) {
			if (!Users(user)) return false;
			user = Users(user);
			return (user && user.lastActiveTime ? moment(user.lastActiveTime).fromNow() : "hasn't talked yet");
		}
		function showProfile() {
			let seenOutput = Gold.userData[userid] && Gold.userData[userid].lastSeen !== 0 ? moment(Gold.userData[userid].lastSeen).format("MMMM DD, YYYY h:mm A") + ' EST (' + moment(Gold.userData[userid].lastSeen).fromNow() + ')' : "Never";
			let profile = '<table><tr>', vip = Gold.hasVip(userid) ? " (<font color=#6390F0><b>VIP User</b></font>)" : "";
			let badgeLength = Gold.userData[userid] && Gold.userData[userid].badges.length > 0 ? Gold.userData[userid].badges.length : 0;
			let bio = Gold.userData[userid] && Gold.userData[userid].status.length > 0 ? Gold.userData[userid].status : false;
			profile += '<td><img src="' + avatar + '" height=80 width=80 align=left></td>';
			if (!getFlag(toId(username))) profile += '<td>&nbsp;<font color=' + formatHex + '><b>Name:</b></font> ' + userSymbol + '<strong class="username">' + Gold.nameColor(username, false) + '</strong>' + vip + '<br />';
			if (getFlag(toId(username))) profile += '<td>&nbsp;<font color=' + formatHex + '><b>Name:</b></font> ' + userSymbol + '<strong class="username">' + Gold.nameColor(username, false) + '</strong>' + getFlag(toId(username)) + vip + '<br />';
			profile += '&nbsp;<font color=' + formatHex + '><b>Registered:</b></font> ' + regdate + '<br />';
			if (bucks) profile += '&nbsp;<font color=' + formatHex + '><b>Bucks:</b></font> ' + bucks + '<br />';
			if (online && lastActive(toId(username))) profile += '&nbsp;<font color=' + formatHex + '><b>Last Active:</b></font> ' + lastActive(toId(username)) + '<br />';
			if (!online) profile += '&nbsp;<font color=' + formatHex + '><b>Last Online: </b></font>' + seenOutput + '<br />';
			if (bio) profile += '&nbsp;<font color=' + formatHex + '><b>Bio:</b></font> ' + Tools.escapeHTML(bio) + '<br />'
			if (badgeLength > 0) profile += '&nbsp;<font color=' + formatHex + '><b>Badge' + Gold.pluralFormat(badgeLength) + ':</b></font> ' + Gold.displayBadges(userid);
			profile += '<br clear="all"></td></tr></table>';
			self.sendReplyBox(profile);
			room.update();
		}
	},
	advertise: 'advertisement',
	advertisement: function (target, room, user, connection, cmd) {
		if (room.id !== 'lobby') return this.errorReply("This command can only be used in the Lobby.");
		if (Gold.readMoney(user.userid) < ADVERTISEMENT_COST) return this.errorReply("You do not have enough bucks to buy an advertisement, they cost " + ADVERTISEMENT_COST + " Gold buck" + Gold.pluralFormat(ADVERTISEMENT_COST, 's') + ".");
		if (target.length > 600) return this.errorReply("This advertisement is too long.");
		target = target.split('|');
		let targetRoom = (Rooms.search(target[0]) ? target[0] : false);
		if (!room || !target || !target[1]) return this.parse('/help advertise');
		if (!targetRoom) return this.errorReply("Room '" + toId(target[0]) + "' not found.  Check spelling?");
		if (user.lastAdvertisement) {
			let milliseconds = (Date.now() - user.lastAdvertisement);
			let seconds = ((milliseconds / 1000) % 60);
			let remainingTime = Math.round(seconds - (15 * 60));
			if (((Date.now() - user.lastAdvertisement) <= 15 * 60 * 1000)) return this.errorReply("You must wait " + (remainingTime - remainingTime * 2) + " seconds before submitting another advertisement.");
		}
		let advertisement = (Config.chatfilter ? Config.chatfilter(Tools.escapeHTML(target[1]), user, room, connection) : Tools.escapeHTML(target[1]));
		if (user.lastCommand !== 'advertise') {
			this.sendReply("WARNING: this command will cost you " + ADVERTISEMENT_COST + " Gold buck" + Gold.pluralFormat(ADVERTISEMENT_COST, 's') + " to use.");
			this.sendReply("To continue, use this command again.");
			user.lastCommand = 'advertise';
		} else if (user.lastCommand === 'advertise') {
			let buttoncss = 'background: #ff9900; text-shadow: none; padding: 2px 6px; color: black; text-align: center; border: black, solid, 1px;';
			Rooms('lobby').add('|raw|<div class="infobox"><strong style="color: green;">Advertisement:</strong> ' + advertisement + '<br /><hr width="80%"><button name="joinRoom" class="button" style="' + buttoncss + '" value="' + toId(targetRoom) + '">Click to join <b>' + Rooms.search(toId(targetRoom)).title + '</b></button> | <i><font color="gray">(Advertised by</font> ' + Gold.nameColor(user.name, false) + '<font color="gray">)</font></i></div>').update();
			Gold.updateMoney(user.userid, -ADVERTISEMENT_COST);
			user.lastCommand = '';
			user.lastAdvertisement = Date.now();
		}
	},
	advertisehelp: ['Usage: /advertise [room] | [advertisement] - Be sure to have | seperating the room and the actual advertisement.  Usage of this command costs ' + ADVERTISEMENT_COST + ' Gold bucks each time.'],
	// Animal command by Kyvn and DNS
	animal: 'animals',
	animals: function (target, room, user) {
		if (!target) return this.parse('/help animals');
		let tarId = toId(target);
		let validTargets = ['cat', 'otter', 'dog', 'bunny', 'pokemon', 'kitten', 'puppy'];
		if (room.id === 'lobby') return this.errorReply("This command cannot be broadcasted in the Lobby.");
		if (!validTargets.includes(tarId)) return this.parse('/help animals');
		let self = this;
		let reqOpt = {
			hostname: 'api.giphy.com', // Do not change this
			path: '/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=' + tarId,
			method: 'GET',
		};
		let req = http.request(reqOpt, function (res) {
			res.on('data', function (chunk) {
				try {
					let data = JSON.parse(chunk);
					let output = '<center><img src="' + data.data["image_url"] + '" width="50%"></center>';
					if (!self.runBroadcast()) return;
					if (data.data["image_url"] === undefined) {
						self.errorReply("ERROR CODE 404: No images found!");
						return room.update();
					} else {
						self.sendReplyBox(output);
						return room.update();
					}
				} catch (e) {
					self.errorReply("ERROR CODE 503: Giphy is unavaliable right now. Try again later.");
					return room.update();
				}
			});
		});
		req.end();
	},
	animalshelp: ['Animals Plugin by DarkNightSkies & Kyv.n(♥)',
		'/animals cat - Displays a cat.',
		'/animals kitten - Displays a kitten.',
		'/animals dog - Displays a dog.',
		'/animals puppy - Displays a puppy.',
		'/animals bunny - Displays a bunny.',
		'/animals otter - Displays an otter.',
		'/animals pokemon - Displays a pokemon.',
		'/animals help - Displays this help box.',
	],
	adq: function (target, room, user) {
		if (!target) return this.parse('/help aqd');
		return this.parse('/tour autodq ' + target);
	},
	adqhelp: ["/adq - A shortened version of /tour autodq [time]"],
	astart: function (target, room, user) {
		if (!target) return this.parse('/help astart');
		return this.parse('/tour autostart ' + target);
	},
	astarthelp: ["/astart - A shortened version of /tour autostart [time]"],
	// Anime and manga commands by Silveee
	anime: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse('/help anime');
		let targetAnime = Tools.escapeHTML(target.trim());
		let id = targetAnime.toLowerCase().replace(/ /g, '');
		if (amCache.anime[id]) return this.sendReply('|raw|' + amCache.anime[id]);

		nani.get('anime/search/' + targetAnime)
		.then(data => {
			if (data[0].adult) {
				return this.errorReply('Nsfw content is not allowed.');
			}
			nani.get('anime/' + data[0].id)
				.then(data => {
					let css = 'text-shadow: 1px 1px 1px #CCC; padding: 3px 8px;';
					let output = '<div class="infobox"><table width="100%"><tr>';
					let description = data.description.replace(/(\r\n|\n|\r)/gm, "").split('<br><br>').join('<br>');
					if (description.indexOf('&lt;br&gt;&lt;br&gt;') >= 0) description = description.substr(0, description.indexOf('&lt;br&gt;&lt;br&gt;'));
					if (description.indexOf('<br>') >= 0) description = description.substr(0, description.indexOf('<br>'));
					output += '<td style="' + css + ' background: rgba(170, 165, 215, 0.5); box-shadow: 2px 2px 5px rgba(170, 165, 215, 0.8); border: 1px solid rgba(170, 165, 215, 1); border-radius: 5px; color: #2D2B40; text-align: center; font-size: 15pt;"><b>' + data.title_romaji + '</b></td>';
					output += '<td rowspan="6"><img src="' + data.image_url_lge + '" height="320" width="225" alt="' + data.title_romaji + '" title="' + data.title_romaji + '" style="float: right; border-radius: 10px; box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.5), 1px 1px 2px rgba(255, 255, 255, 0.5) inset;" /></td></tr>';
					output += '<tr><td style="' + css + '"><b>Genre(s): </b>' + data.genres + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Air Date: </b>' + data.start_date.substr(0, 10) + '</td></tr><tr>';
					output += '<tr><td style="' + css + '"><b>Status: </b>' + data.airing_status + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Episode Count: </b>' + data.total_episodes + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Rating: </b> ' + data.average_score + '/100</td></tr>';
					output += '<tr><td colspan="2" style="' + css + '"><b>Description: </b>' + description + '</td></tr>';
					output += '</table></div>';
					amCache.anime[id] = output;
					this.sendReply('|raw|' + output);
					room.update();
				});
		})
		.catch(error => {
			return this.errorReply("Anime not found.");
		});
	},
	animehelp: ['/anime [query] - Searches for an anime series based on the given search query.'],
	manga: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse('/help manga');
		let targetAnime = Tools.escapeHTML(target.trim());
		let id = targetAnime.toLowerCase().replace(/ /g, '');
		if (amCache.anime[id]) return this.sendReply('|raw|' + amCache.anime[id]);

		nani.get('manga/search/' + targetAnime)
		.then(data => {
			if (data[0].adult) {
				return this.errorReply('Nsfw content is not allowed.');
			}
			nani.get('manga/' + data[0].id)
				.then(data => {
					let css = 'text-shadow: 1px 1px 1px #CCC; padding: 3px 8px;';
					let output = '<div class="infobox"><table width="100%"><tr>';
					let description = data.description.replace(/(\r\n|\n|\r)/gm, " ").split('<br><br>').join('<br>');
					if (description.indexOf('&lt;br&gt;&lt;br&gt;') >= 0) description = description.substr(0, description.indexOf('&lt;br&gt;&lt;br&gt;'));
					if (description.indexOf('<br>') >= 0) description = description.substr(0, description.indexOf('<br>'));
					output += '<td style="' + css + ' background: rgba(170, 165, 215, 0.5); box-shadow: 2px 2px 5px rgba(170, 165, 215, 0.8); border: 1px solid rgba(170, 165, 215, 1); border-radius: 5px; color: #2D2B40; text-align: center; font-size: 15pt;"><b>' + data.title_romaji + '</b></td>';
					output += '<td rowspan="6"><img src="' + data.image_url_lge + '" height="320" width="225" alt="' + data.title_romaji + '" title="' + data.title_romaji + '" style="float: right; border-radius: 10px; box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.5), 1px 1px 2px rgba(255, 255, 255, 0.5) inset;" /></td></tr>';
					output += '<tr><td style="' + css + '"><b>Genre(s): </b>' + data.genres + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Release Date: </b>' + data.start_date.substr(0, 10) + '</td></tr><tr>';
					output += '<tr><td style="' + css + '"><b>Status: </b>' + data.publishing_status + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Chapter Count: </b>' + data.total_chapters + '</td></tr>';
					output += '<tr><td style="' + css + '"><b>Rating: </b> ' + data.average_score + '/100</td></tr>';
					output += '<tr><td colspan="2" style="' + css + '"><b>Description: </b>' + description + '</td></tr>';
					output += '</table></div>';
					amCache.manga[id] = output;
					this.sendReply('|raw|' + output);
					room.update();
				});
		})
		.catch(error => {
			return this.errorReply("Anime not found.");
		});
	},
	mangahelp: ['/manga [query] - Searches for a manga series based on the given search query.'],

	getalts: 'goldipsearch',
	goldipsearch: function (target, room, user, connection, cmd) {
		if (!this.can('pban')) return false;
		if (!target) return this.parse('/help goldipsearch');
		let searchType = target.includes('.') ? 'IP' : 'User', count = 0;
		let origtarget = target, targetId = toId(target), wildcard = target.includes('*');
		let fallout = "No users or IPs of '" + target + "' have visted this server. Check spelling?";

		if (searchType === 'IP') {
			let names = Object.keys(Gold.userData), buff = [];

			if (wildcard) target = target.slice(0, -1);

			names.forEach(name => {
				if (Gold.userData[name].ips.length < 0) return;
				count++
				if (wildcard) {
					for (var i = 0; i < Gold.userData[name].ips.length; i++) {
						if (Gold.userData[name].ips[i].startsWith(target) && !(buff.includes(formatName(name)))) {
							buff.push(formatName(name));
						}
					}
				} else { // regular IPs
					if (Gold.userData[name].ips.includes(target) && !(buff.includes(formatName(name)))) {
						buff.push(formatName(name));
					}
				}
			});
			if (buff.length < 1) return this.errorReply(fallout);
			return this.sendReplyBox("User" + Gold.pluralFormat(buff.length, 's') + " previously associated with an " + searchType + " in range '" + origtarget + "':<br />" + buff.join(', '));
		} else if (Gold.userData[targetId] && Gold.userData[targetId].ips.length > 0) {
			let results = Gold.userData[targetId].ips;
			return this.sendReplyBox("IP" + Gold.pluralFormat(results.length, 's') + " previously associated with " + searchType + " '" + target + "':<br />" + results.join(', '));
		} else {
			return this.errorReply(fallout);
		}
	},
	goldipsearchhelp: ["/goldipsearch [ip|ip range|username] - Find all users with specified IP, name, or IP range. Requires ~"],

	offlinewhois: 'whois',
	whois: function (target, room, user, connection, cmd) {
		if (cmd !== 'offlinewhois' && this.cmd && this.cmd !== 'offlinewhois') {
			baseWhois.apply(this, arguments);
		}
		if (!user.can('pban')) return;

		// variable declarations
		let targetId = toId(this.target);
		let ips = [], prevNames = [];
		let prevIps = (Gold.userData[targetId] && Gold.userData[targetId].ips.length > 0 ? Gold.userData[targetId].ips : false);
		let names = Object.keys(Gold.userData);
		let buff = [], none = '<em style="color:gray">(none)</em>';
		let userSymbol = (Users.usergroups[targetId] ? Users.usergroups[targetId].substr(0, 1) : 'Regular User');
		let userGroup = (Config.groups[userSymbol] ? 'Global ' +  Config.groups[userSymbol].name  + ' (' + userSymbol + ')' : false);

		// get previous names and IPs
		if (prevIps) prevIps.forEach(f => { ips.push(f); });
		if (ips.length > 0) {
			names.forEach(name => {
				for (var i = 0; i < ips.length; i++) {
					if (Gold.userData[name].ips.includes(ips[i]) && !prevNames.includes(name) && targetId !== name) {
						prevNames.push(name);
					}
				}
			});
		}
		if (this.targetUser && this.targetUser.connected && user.can('pban')) {
			if (prevNames.length > 0) {
				this.sendReplyBox("(All previously known alts used on server: " + prevNames.join(', ') + ")");
			}
		} else if (this.cmd === 'offlinewhois' && user.can('pban')) {
			// header and last seen
			buff.push('<strong class="username">' + target + '</strong> <em style="color:gray">(offline)</em>');
			if (userGroup) buff.push(userGroup);
			buff.push('Last Seen: ' + (Gold.userData[targetId] && Gold.userData[targetId].lastSeen ? moment(Gold.userData[targetId].lastSeen).format("MMMM Do YYYY, h:mm A") : '<font color="red">never on this server</font>') + '<br />');

			// get previous names and IPs
			buff.push("Previous IP" + Gold.pluralFormat(ips.length, 's') + ": " + (ips.length > 0 ? ips.join(', ') : none));
			buff.push("Previous alt" + Gold.pluralFormat(prevNames.length, 's') + ": " + (prevNames.length > 0 ? prevNames.join(', ') : none));

			// display offline whois
			this.sendReplyBox(buff.join('<br />'));
		}
	},
	lastseen: 'seen',
	seen: function (target, room, user) {
		if (!this.runBroadcast()) return;
		let userid = toId(target);
		if (userid.length > 18) return this.errorReply("Usernames cannot be over 18 characters.");
		if (userid.length < 1) return this.errorReply("/seen - Please specify a name.");
		let userName = '<strong class="username">' + Gold.nameColor(target, false) + '</strong>';
		if (userid === user.userid) return this.sendReplyBox(userName + ", have you looked in a mirror lately?");
		if (Users(target) && Users(target).connected) return this.sendReplyBox(userName + ' is currently <font color="green">online</font>.');
		if (!Gold.userData[userid] || Gold.userData[userid].lastSeen === 0) return this.sendReplyBox(userName + ' has <font color=\"red\">never</font> been seen online on this server.');
		let userLastSeen = moment(Gold.userData[userid].lastSeen).format("MMMM Do YYYY, h:mm A");
		this.sendReplyBox(userName + ' was last seen online on ' + userLastSeen + ' EST. (' + moment(Gold.userData[userid].lastSeen).fromNow() + ')');
	},
	bio: 'status',
	status: function (target, room, user, connection, cmd) {
		if (!this.canTalk()) return this.sendReply("You cannot do this while unable to talk.");
		let data = Gold.checkExisting(user.userid);
		if (target && target === 'delete') {
			if (!data.status || data.status === '') return this.errorReply("You currently do not have a status set.");
			data.status = '';
			Gold.saveData();
			return this.sendReply("You have deleted your status.");
		} else if (target) {
			if (Config.chatfilter) {
				target = Config.chatfilter(target, user, room, connection);
				if (!target) return;
			}
			if (target.length > 35) return this.errorReply("User statuses must be 35 or less characters.");
			data.status = target;
			Gold.saveData();
			return this.sendReply(`You have set your user status to: "${data.status}".`);
		} else {
			if (!data.status || data.status === '') return this.parse('/help status');
			return this.sendReply(`Your current status is set to: ${data.status}`);
		}
	},
	statushelp: ["/status [status] - Sets your status. Maximum of 35 characters long.",
		"/status delete - Deletes your status."],
	givevip: function (target, room, user) {
		if (!target) return this.parse('/help givevip');
		return this.parse(`/badge give, ${target}, vip`);
	},
	giveviphelp: ["/givevip [user] - Gives a user VIP status (and the badge). Requires &, ~"],
	takevip: function (target, room, user) {
		if (!target) return this.parse('/help takevip');
		return this.parse(`/badge remove, ${target}, vip`);
	},
	takeviphelp: ["/takevip [user] - Removes VIP status from a user (and the badge). Requires &, ~"],
	pmroom: 'roompm',
	roompm: function (target, room, user) {
		if (!target) return this.parse('/help roompm');
		if (!this.can('declare', null, room)) return false;
		if (room.isPrivate) return this.errorReply("This command is not allowed in private rooms.");
		if (room.battle) return this.errorReply("You cannot use this command in a battle room.");
		let pmName = `#${room.title} Message`;
		let origtarget = target;
		target = Tools.escapeHTML(target);
		target = target.replace(/&#x2f;/g, '/');
		target = Gold.formatMessage(target);
		Object.keys(room.users).forEach(usr => {
			usr = Users(usr);
			if (!usr) return;
			if (!usr.connected) return;
			usr.send(`|pm|${pmName}|${usr.getIdentity()}|/html ${target}<br /><p style="font-size: 8px;">[Do not reply. This message was sent by ${Gold.nameColor(user.name)}.]</p>`);
		});
		this.privateModCommand(`(${user.name} mass room PM'd: ${origtarget})`);
	},
	roompmhelp: ["/roompm [message] - PMs everyone in the room. Requires #, &, ~"],
	news: 'serverannouncements',
	announcements: 'serverannouncements',
	serverannouncements: {
		'': 'view',
		display: 'view',
		view: function (target, room, user) {
			if (!Rooms('lobby') || !Rooms('lobby').news) return this.errorReply("Strange, there are no server announcements...");
			if (!Rooms('lobby').news && Rooms('lobby')) Rooms('lobby').news = {};
			let news = Rooms('lobby').news;
			if (Object.keys(news).length === 0) return this.sendReply("There are currently no new server announcements at this time.");
			return user.send('|popup||wide||html|' +
				"<center><strong>Current server announcements:</strong></center>" +
					Gold.generateNews().join('<hr>')
			);
		},
		delete: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help serverannouncements');
			if (!Rooms('lobby').news) Rooms('lobby').news = {};
			let news = Rooms('lobby').news;
			if (!news[target]) return this.errorReply("This announcement doesn't seem to exist...");
			delete news[target];
			Rooms('lobby').news = news;
			Rooms('lobby').chatRoomData.news = Rooms('lobby').news;
			Rooms.global.writeChatRoomData();
			this.privateModCommand(`(${user.name} deleted server announcement titled: ${target}.)`);
		},
		add: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help serverannouncements');
			target = target.split('|');
			for (let u in target) target[u] = target[u].trim();
			if (!target[1]) return this.errorReply("Usage: /news add [title]| [desc]");
			if (!Rooms('lobby').news) Rooms('lobby').news = {};
			let news = Rooms('lobby').news;
			news[target[0]] = {
				desc: target[1],
				posted: Date.now(),
				by: user.name,
			};
			Rooms('lobby').news = news;
			Rooms('lobby').chatRoomData.news = Rooms('lobby').news;
			Rooms.global.writeChatRoomData();
			this.privateModCommand(`(${user.name} added server announcement: ${target[1]})`);
		},
		/*
		toggle: function (target, room, user) {
			let data = Gold.checkExisting(user.userid);
			data.blockNews = !data.blockNews;
			this.sendReply(`You are now ${data.blockNews ? 'blocking' : 'not blocking'} news notifications.`);
		},
		*/
	},
	serverannouncementshelp: ["/announcements view - Views current server announcements.",
		"/announcements delete [announcement title] - Deletes announcement with the [title]. Requires @, &, ~",
		"/announcements add [announcement title]| [announcement desc] - Adds announcement [announcement]. Requires @, &, ~"],
		// "/announcement toggle - Toggles getting news notifications."],
};

function loadRegdateCache() {
	try {
		regdateCache = JSON.parse(fs.readFileSync('config/regdate.json', 'utf8'));
	} catch (e) {}
}
loadRegdateCache();

function saveRegdateCache() {
	fs.writeFileSync('config/regdate.json', JSON.stringify(regdateCache));
}

let bubbleLetterMap = new Map([
	['a', '\u24D0'], ['b', '\u24D1'], ['c', '\u24D2'], ['d', '\u24D3'], ['e', '\u24D4'], ['f', '\u24D5'], ['g', '\u24D6'], ['h', '\u24D7'], ['i', '\u24D8'], ['j', '\u24D9'], ['k', '\u24DA'], ['l', '\u24DB'], ['m', '\u24DC'],
	['n', '\u24DD'], ['o', '\u24DE'], ['p', '\u24DF'], ['q', '\u24E0'], ['r', '\u24E1'], ['s', '\u24E2'], ['t', '\u24E3'], ['u', '\u24E4'], ['v', '\u24E5'], ['w', '\u24E6'], ['x', '\u24E7'], ['y', '\u24E8'], ['z', '\u24E9'],
	['A', '\u24B6'], ['B', '\u24B7'], ['C', '\u24B8'], ['D', '\u24B9'], ['E', '\u24BA'], ['F', '\u24BB'], ['G', '\u24BC'], ['H', '\u24BD'], ['I', '\u24BE'], ['J', '\u24BF'], ['K', '\u24C0'], ['L', '\u24C1'], ['M', '\u24C2'],
	['N', '\u24C3'], ['O', '\u24C4'], ['P', '\u24C5'], ['Q', '\u24C6'], ['R', '\u24C7'], ['S', '\u24C8'], ['T', '\u24C9'], ['U', '\u24CA'], ['V', '\u24CB'], ['W', '\u24CC'], ['X', '\u24CD'], ['Y', '\u24CE'], ['Z', '\u24CF'],
	['1', '\u2460'], ['2', '\u2461'], ['3', '\u2462'], ['4', '\u2463'], ['5', '\u2464'], ['6', '\u2465'], ['7', '\u2466'], ['8', '\u2467'], ['9', '\u2468'], ['0', '\u24EA'],
]);

let asciiMap = new Map([
	['\u24D0', 'a'], ['\u24D1', 'b'], ['\u24D2', 'c'], ['\u24D3', 'd'], ['\u24D4', 'e'], ['\u24D5', 'f'], ['\u24D6', 'g'], ['\u24D7', 'h'], ['\u24D8', 'i'], ['\u24D9', 'j'], ['\u24DA', 'k'], ['\u24DB', 'l'], ['\u24DC', 'm'],
	['\u24DD', 'n'], ['\u24DE', 'o'], ['\u24DF', 'p'], ['\u24E0', 'q'], ['\u24E1', 'r'], ['\u24E2', 's'], ['\u24E3', 't'], ['\u24E4', 'u'], ['\u24E5', 'v'], ['\u24E6', 'w'], ['\u24E7', 'x'], ['\u24E8', 'y'], ['\u24E9', 'z'],
	['\u24B6', 'A'], ['\u24B7', 'B'], ['\u24B8', 'C'], ['\u24B9', 'D'], ['\u24BA', 'E'], ['\u24BB', 'F'], ['\u24BC', 'G'], ['\u24BD', 'H'], ['\u24BE', 'I'], ['\u24BF', 'J'], ['\u24C0', 'K'], ['\u24C1', 'L'], ['\u24C2', 'M'],
	['\u24C3', 'N'], ['\u24C4', 'O'], ['\u24C5', 'P'], ['\u24C6', 'Q'], ['\u24C7', 'R'], ['\u24C8', 'S'], ['\u24C9', 'T'], ['\u24CA', 'U'], ['\u24CB', 'V'], ['\u24CC', 'W'], ['\u24CD', 'X'], ['\u24CE', 'Y'], ['\u24CF', 'Z'],
	['\u2460', '1'], ['\u2461', '2'], ['\u2462', '3'], ['\u2463', '4'], ['\u2464', '5'], ['\u2465', '6'], ['\u2466', '7'], ['\u2467', '8'], ['\u2468', '9'], ['\u24EA', '0'],
]);

function parseStatus(text, encoding) {
	if (encoding) {
		text = text.split('').map(function (char) {
			return bubbleLetterMap.get(char);
		}).join('');
	} else {
		text = text.split('').map(function (char) {
			return asciiMap.get(char);
		}).join('');
	}
	return text;
}

Gold.pmAll = function (message, pmName) {
	pmName = (pmName ? pmName : '~Gold Server [Do not reply]');
	Users.users.forEach(curUser => {
		curUser.send('|pm|' + pmName + '|' + curUser.getIdentity() + '|' + message);
	});
};
Gold.pmStaff = function (message, from) {
	from = (from ? ' (PM from ' + from + ')' : '');
	Users.users.forEach(curUser => {
		if (curUser.isStaff) {
			curUser.send('|pm|~Staff PM|' + curUser.getIdentity() + '|' + message + from);
		}
	});
};
Gold.pmUpperStaff = function (message, pmName, from) {
	pmName = (pmName ? pmName : '~Upper Staff PM');
	from = (from ? ' (PM from ' + from + ')' : '');
	Users.users.forEach(curUser => {
		if (curUser.group === '~' || curUser.group === '&') {
			curUser.send('|pm|' + pmName + '|' + curUser.getIdentity() + '|' + message + from);
		}
	});
};
Gold.pluralFormat = function (length, ending) {
	if (!ending) ending = 's';
	if (isNaN(Number(length))) return false;
	return (length === 1 ? '' : ending);
};
Gold.nameColor = function (name, bold) {
	return (bold ? "<b>" : "") + "<font color=" + Gold.hashColor(name) + ">" + (Users(name) && Users(name).connected && Users.getExact(name) ? Tools.escapeHTML(Users.getExact(name).name) : Tools.escapeHTML(name)) + "</font>" + (bold ? "</b>" : "");
};

Gold.regdate = function (target, callback) {
	target = toId(target);
	if (regdateCache[target]) return callback(regdateCache[target]);

	let options = {
		host: 'pokemonshowdown.com',
		port: 80,
		path: '/users/' + target + '.json',
		method: 'GET',
	};

	http.get(options, function (res) {
		let data = '';

		res.on('data', function (chunk) {
			data += chunk;
		}).on('end', function () {
			data = JSON.parse(data);
			let date = data['registertime'];
			if (date !== 0 && date.toString().length < 13) {
				while (date.toString().length < 13) {
					date = Number(date.toString() + '0');
				}
			}
			if (date !== 0) {
				regdateCache[target] = date;
				saveRegdateCache();
			}
			callback((date === 0 ? false : date));
		});
	});
};

Gold.reloadCSS = function () {
	let options = {
		host: 'play.pokemonshowdown.com',
		port: 80,
		path: '/customcss.php?server=gold',
		method: 'GET',
	};
	http.get(options);
};

function formatName(name) {
	if (Users.getExact(name) && Users(name).connected) {
		return '<i>' + Gold.nameColor(Users.getExact(name).name, true) + '</i>';
	} else {
		return Gold.nameColor(name, false);
	}
}

Gold.autoJoinRooms = {};
try {
	Gold.autoJoinRooms = JSON.parse(fs.readFileSync('config/autojoin.json', 'utf8'));
} catch (e) {}

Gold.saveAutoJoins = function () {
	fs.writeFileSync('config/autojoin.json', JSON.stringify(Gold.autoJoinRooms));
};

Gold.userIps = Object.create(null);

function loadIps() {
	fs.readFile('config/userips.json', 'utf8', function (err, file) {
		if (err) return;
		Gold.userIps = JSON.parse(file);
	});
}
loadIps();

Gold.addIp = function (user, ip) {
	user = toId(user);
	if (user.substr(0, 5) === 'guest') return false; // don't record guest numbers

	if (!Gold.userIps[user]) {
		Gold.userIps[user] = [];
		Gold.userIps[user].push(ip);
	} else {
		if (Gold.userIps[user].includes(ip)) return false;
		Gold.userIps[user].push(ip);
	}

	// update / save
	fs.writeFileSync('config/userips.json', JSON.stringify(Gold.userIps));
};

Gold.formatMessage = function (message) {
	message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
	message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>'); // bold
	message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
	message = message.replace(/\^\^([^< ](?:[^<]*?[^< ])??)\^\^/g, '<sup>$1</sup>'); // superscript
	message = Autolinker.link(message, {stripPrefix: false, phone: false, twitter: false}); // hyperlinking

	return message;
};
