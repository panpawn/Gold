/**
 * Gold Users Functions
 * Gold Server - http://gold.psim.us/
 *
 * Various utility functions pertaining to custom user functions.
 *
 * This currently handles features such as:
 * Economy - "bucks," used to buy things from the "shop"
 * Offline Messaging (tells) - Offline private messaging system
 * Last seen - When a user was last on the server
 * Badges - Various acomplisments
 * VIP Status - Lets a user use specific features other user's can't
 * Proxy whitelisting - Trusting specific users to not get locked when using a proxy
 * User Statuses - Appears on user's profiles
 * User IP Logging - Used for various disiplinary actions
 * News - Much like main's news system appeared while connecting
 *
 * Credits: panpawn
 *
 * @license MIT license
 */
'use strict';

const fs = require('fs');
const moment = require('moment');

Gold.userData = Object.create(null);
function loadUserData() {
	fs.readFile('config/goldusers.json', 'utf8', function (err, file) {
		if (err) return;
		Gold.userData = JSON.parse(file);
	});
}
loadUserData();

Gold.punishments = Object.create(null);
function loadPunishments() {
	fs.readFile('config/gold-punishments.json', 'utf8', function (err, file) {
		if (err) return;
		Gold.punishments = JSON.parse(file);
	});
}
loadPunishments();

try {
	Object.assign(Gold, {

		/******************************
		 * Initialize User Functions  *
		 ******************************/
		createUser: function (user) { // doesn't save unless it gets edited
			user = toId(user);
			if (Gold.userData[user] || user === 'constructor') return false;
			if (user.substr(0, 5) === 'guest') return false;

			Gold.userData[user] = { // esteemed user data
				ips: [],
				tells: Object.create(null),
				friends: [],
				badges: [],
				autojoin: [],
				tellNum: 0,
				money: 0,
				lastSeen: 0,
				color: false,
				icon: false,
				vip: false,
				proxywhitelist: false,
				status: '',
				friendcode: '',
			}; // we don't save blank user data objects until next save
		},
		saveData: function () {
			setTimeout(function () {
				fs.writeFileSync('config/goldusers.json', JSON.stringify(Gold.userData));
			}, (1.25 * 1000)); // only save every 1.25 seconds - TOPS
		},
		initiateUser: function (user, ip) {	// when the user connections, this runs
			user = toId(user);
			if (!Gold.userData[user]) Gold.createUser(user);

			this.addIp(user, ip);
			this.updateSeen(user); // (saves)
		},
		checkExisting: function (user) {
			user = toId(user);
			if (!Gold.userData[user]) Gold.createUser(user);
			return Gold.userData[user];
		},

		/*********************
		 * Economy Functions *
		 *********************/
		updateMoney: function (user, amount) {
			user = toId(user);
			if (isNaN(amount)) return false;
			amount = Number(amount);

			let data = this.checkExisting(user);
			data.money = Number(Number(data.money) + amount);
			this.saveData();
			// if (Rooms('staff')) Rooms('staff').add(`[DEBUG] ${user} has recieved ${amount} bucks.  They now have ${data.money} bucks.`).update();
		},
		removeAllMoney: function (user, punisher) {
			user = toId(user);
			if (!Gold.userData[user] || Gold.userData[user].money === 0) return false;
			let data = this.checkExisting(user);
			let oldMoney = data.money;
			data.money = 0;
			this.saveData();

			let staff = Rooms('staff');
			if (staff) staff.add(`|c|~|[BucksMonitor] ${user} has lost ${oldMoney} buck${Gold.pluralFormat(oldMoney)} due to being globally locked and/or banned by ${punisher}.`).update();
		},
		readMoney: function (user) {
			user = toId(user);
			if (user === 'constructor') return 0;
			let data = this.checkExisting(user);
			if (data) return data.money;
			return 0;
		},
		moneyCirculating: function () {
			let data = Object.keys(Gold.userData);
			// [total bucks, average bucks, number of users with at least 1 money]
			let results = [0, 0, 0];

			data.forEach(user => {
				if (Gold.userData[user].money > 0) {
					if (isNaN(Gold.userData[user].money) || Gold.userData[user].money === null) return;
					results[0] += Math.round(Number(Gold.userData[user].money));
					results[2]++;
				}
			});
			results[1] = Math.round(results[0] / results[2]);

			return results;
		},
		richestUsers: function (number) { // basically the heavy lifting for the command
			number = number > Gold.moneyCirculating()[2] ? Gold.moneyCirculating()[2] : number;
			let data = Object.keys(Gold.userData);
			let userids = new Array(0);
			let tableStyle = 'background: linear-gradient(10deg, #FFF8B5, #eadf7c, #FFF8B5); color: black; border: 1px solid #635b00; padding: 2px; border-radius: 5px; text-align:center;';
			let tdStyle = 'border-radius: 5px; border: 1px solid #635b00; background: #fff8b5; color: black;';
			let returnText = `${number > 10 ? '<div class="infobox-limited">' : '<div>'}<b>The top ${number} richest users are:</b><table style="${tableStyle}" border="1" cellspacing ="0" cellpadding="3">`;
			returnText += `<tr><td style="${tdStyle}"><b>Rank</b></td><td style="${tdStyle}"><b>Name</b></td><td style="${tdStyle}"><b>Bucks</b></td></tr>`;

			function ResultsArray(id, money) {
				this.id = id;
				this.money = money;
			}

			data.forEach(user => {
				if (Gold.userData[user].money > 0) {
					if (Gold.userData[user].money === null || isNaN(Gold.userData[user].money)) return; // this should never happen... *coughs*
					userids.push(new ResultsArray(user, Gold.userData[user].money));
				}
			});

			userids.sort(function (a, b) {
				return b.money - a.money;
			});

			for (let i = 0; i < number; i++) {
				if (userids[i]) returnText += `<tr><td style="${tdStyle}">${i + 1}.</td><td style="${tdStyle}">${Gold.nameColor(userids[i].id, true)}</td><td style="${tdStyle}">${userids[i].money}</td></tr>`;
			}
			returnText += '</table></div>';

			return returnText;
		},

		/********************
		 * Badge Functions *
		 *******************/
		hasVip: function (user) {
			user = toId(user);
			if (user.startsWith('guest')) return false;
			let data = this.checkExisting(user);
			if (!data.badges) data.badges = [];
			let vip = data.badges.includes('vip');
			return vip;
		},
		modifyBadge: function (user, badgeid, action) {
			user = toId(user);
			badgeid = toId(badgeid);

			let data = this.checkExisting(user);
			if (!data.badges) data.badges = [];

			if (action === 'GIVE') {
				if (data.badges.includes(badgeid)) return false;
				data.badges.push(badgeid);
			} else if (action === 'TAKE') {
				if (!data.badges.includes(badgeid)) return false;
				data.badges.splice(data.badges.indexOf(badgeid), 1);
			} else {
				return false;
			}
			this.saveData();
		},
		badgeList: function (displayall) {
			// This houses the badges of the server.  You can add/modify/remove badges
			// here the with the same format as you see.
			let badgeList = {
				'dev': {
					title: 'Developer',
					img: 'http://www.smogon.com/media/forums/images/badges/factory_foreman.png',
				}, 'admin': {
					title: 'Server Administrator',
					img: 'http://www.smogon.com/media/forums/images/badges/sop.png',
				}, 'fgs': {
					title: 'Former Gold Staff',
					img: 'http://www.smogon.com/media/forums/images/badges/forummod_alum.png',
				}, 'leader': {
					title: 'Server Leader',
					img: 'http://www.smogon.com/media/forums/images/badges/aop.png',
				}, 'mod': {
					title: 'Exceptional Staff Member',
					img: 'http://www.smogon.com/media/forums/images/badges/pyramid_king.png',
				}, 'rf': {
					title: 'Successful Room Founder',
					img: 'http://www.smogon.com/media/forums/images/badges/forumsmod.png',
				}, 'comcun': {
					title: 'Community Contributor',
					img: 'http://www.smogon.com/media/forums/images/badges/cc.png',
				}, 'art': {
					title: 'Artist',
					img: 'http://www.smogon.com/media/forums/images/badges/ladybug.png',
				}, 'vip': {
					title: 'VIP User',
					img: 'http://www.smogon.com/media/forums/images/badges/zeph.png',
				}, 'twinner': {
					title: 'Special Event Winner',
					img: 'http://www.smogon.com/media/forums/images/badges/spl.png',
				}, 'creator': {
					title: 'Server Creator',
					img: 'http://www.smogon.com/media/forums/images/badges/dragon.png',
				}, 'udc': {
					title: 'UDC Winner',
					img: 'http://www.smogon.com/media/forums/images/badges/worldcup.png',
				},
			};
			if (displayall) {
				let buff = [];
				Object.keys(badgeList).forEach(badge => {
					buff.push(`<img src="${badgeList[badge].img}" title="${badgeList[badge].title}">`);
				});
				return buff.join(" | ");
			}
			return badgeList;
		},
		displayBadges: function (user) {
			user = toId(user);
			let data = this.checkExisting(user), buff = [];
			if (!data.badges || data.badges.length < 0) return false;

			let badgeObj = this.badgeList();
			let badgeList = Object.keys(badgeObj);
			badgeList.forEach(badge => {
				if (data.badges.includes(badge)) buff.push(`<img src="${badgeObj[badge].img}" title="${badgeObj[badge].title}">`);
			});
			return buff.join(" ");
		},

		/********************
		 * Auto join Magic  *
		 *******************/
		autoJoin: function (user, room, action) {
			let data = this.checkExisting(user);
			if (!data.autojoin) data.autojoin = [];
			if (room.startsWith('groupchat-') || room.startsWith('battle-')) return false;

			if (action === 'ADD' && !data.autojoin.includes(room)) {
				if (!Rooms(room)) return false;
				data.autojoin.push(room);
				this.saveData();
			} else if (action === 'REMOVE' && data.autojoin.includes(room)) {
				data.autojoin.splice(data.autojoin.indexOf(room), 1);
				this.saveData();
			}
		},
		getAutoJoin: function (user) {
			try {
				user = toId(user);
				if (user.startsWith('guest')) return false;
				let data = this.checkExisting(user);
				if (data.autojoin && data.autojoin.length > 0) {
					return data.autojoin;
				}
				return false;
			} catch (e) {
				this.logCrash(e.stack, 'Gold#getAutoJoin on user: ' + user);
				return false;
			}
		},
		/*******************
		 * Misc. Functions *
		 *******************/
		customColor: function (user, action, color) {
			let data = this.checkExisting(user);
			if (!data.color) data.color = '';

			if (action === 'GIVE') {
				data.color = color;
			} else if (action === 'REMOVE') {
				data.color = false;
			} else {
				return false;
			}

			this.saveData();
		},
		customIcon: function (user, action, icon) {
			let data = this.checkExisting(user);
			if (!data.icon) data.icon = '';

			if (action === 'GIVE') {
				data.icon = icon;
			} else if (action === 'REMOVE') {
				data.icon = false;
			} else {
				return false;
			}

			this.saveData();
		},
		addIp: function (user, ip) { // sub-function of initialize user
			if (toId(user).substr(0, 5) === 'guest') return false;

			let data = this.checkExisting(user);
			if (!data.ips) data.ips = [];

			if (!data.ips.includes(ip)) data.ips.push(ip);
		},
		updateSeen: function (user) {
			if (toId(user).substr(0, 5) === 'guest') return false;

			let data = this.checkExisting(user);

			data.lastSeen = Date.now();
			this.saveData();
		},
		getLastSeen: function (user) {
			let data = Gold.userData[toId(user)] || false;

			if (data && data.lastSeen && data.lastSeen !== 0) {
				let reply = moment(Gold.userData[toId(user)].lastSeen).format("MMMM DD, YYYY h:mm A") + ' EST (' + moment(Gold.userData[toId(user)].lastSeen).fromNow() + ')';
				return reply;
			}
			return "Never";
		},
		updateFriends: function (user, friend, action) {
			friend = toId(friend);
			let data = this.checkExisting(user);
			if (!data.friends) data.friends = [];

			if (action === 'ADD') {
				if (!data.friends.includes(friend))data.friends.push(friend);
			} else if (action === 'DELETE') {
				if (data.friends.includes(friend)) data.friends.splice(data.friends.indexOf(friend), 1);
			} else {
				return false;
			}

			this.saveData();
		},
		createTell: function (user, reciever, message) { // heavy lifting for /tell
			let userName = user;
			reciever = toId(reciever);
			user = toId(user);
			message = Gold.emoticons.processEmoticons(Chat.escapeHTML(message)).replace(/&#x2f;/g, '/');

			let data = this.checkExisting(reciever);
			if (!data.tells) data.tells = Object.create(null);
			let tells = data.tells;

			message = Gold.formatMessage(message); // Add PS formatting

			let date = `${moment().format('MMMM Do YYYY, h:mm A')} EST`;
			let tell = `<u>${date}</u><br />${Gold.nameColor(userName, true)} said: ${message}`;

			Gold.userData[user].tellNum++;
			tells[`${user}#${Gold.userData[user].tellNum}`] = tell;
			this.saveData();
		},
		checkTells: function (user) {
			let reply = [];
			let data = this.checkExisting(user);
			if (data) {
				if (Object.keys(data.tells).length > 0) {
					for (let i in Gold.userData[toId(user)].tells) {
						reply.push(`|raw|${data.tells[i]}`);
						delete data.tells[i];
					}
				}
			}
			if (reply.length > 0) this.saveData();
			if (reply.length === 0) return false;
			return reply;
		},
		trustUser: function (user, action) {
			let data = this.checkExisting(user);
			if (!action) action = false;
			if (!data.proxywhitelist) data.proxywhitelist = false;

			data.proxywhitelist = action;

			this.saveData();
		},
		isDev: function (user) {
			user = toId(user);
			let devs = ['panpawn', 'jd'];
			return devs.includes(user);
		},
		generateNews: function () {
			let lobby = Rooms('lobby');
			if (!lobby) return false;
			if (!lobby.news || Object.keys(lobby.news).length < 0) return false;
			if (!lobby.news) lobby.news = {};
			let news = lobby.news, newsDisplay = [];
			Object.keys(news).forEach(announcement => {
				newsDisplay.push(`<h4>${announcement}</h4>${news[announcement].desc}<br /><br /><strong>—<font color="${Gold.hashColor(news[announcement].by)}">${news[announcement].by}</font></strong> on ${moment(news[announcement].posted).format("MMM D, YYYY")}`);
			});
			return newsDisplay;
		},
		newsDisplay: function (user) {
			if (!Users(user)) return false;
			let newsDis = this.generateNews();
			if (newsDis.length === 0) return false;

			if (newsDis.length > 0) {
				newsDis = newsDis.join('<hr>');
				return Users(user).send(`|pm| Gold News|${Users(user).getIdentity()}|/raw ${newsDis}`);
			}
		},
		whois: function (user, online) {
			user = toId(user);
			if (user === 'constructor') return false;

			// variable declarations
			let ips = [], prevNames = [];
			let prevIps = Gold.userData[user] && Gold.userData[user].ips.length > 0 ? Gold.userData[user].ips : false;
			let names = Object.keys(Gold.userData);
			let buff = [], none = '<em style="color:gray">(none)</em>';
			let userSymbol = Users.usergroups[user] ? Users.usergroups[user].substr(0, 1) : 'Regular User';
			let userGroup = userSymbol !== ' ' && Config.groups[userSymbol] ? 'Global ' + Config.groups[userSymbol].name + ' (' + userSymbol + ')' : false;

			// get previous names and IPs
			if (prevIps) prevIps.forEach(f => { ips.push(f); });
			if (ips.length > 0) {
				names.forEach(name => {
					for (let i = 0; i < ips.length; i++) {
						if (Gold.userData[name].ips.includes(ips[i]) && !prevNames.includes(name) && user !== name) {
							prevNames.push(name);
						}
					}
				});
			}
			if (online) {
				let altsDisplay = prevNames.length > 0;
				let ipsDisplay = ips.length > 0;
				if (altsDisplay) buff.push(`(All previously known alts used: ${prevNames.join(', ')})`);
				if (ipsDisplay) buff.push(`(All previously known IPs used: ${ips.join(', ')})`);
				if (altsDisplay || ipsDisplay) return buff.join('<br />');
			} else if (!online) {
				// header and last seen
				if (userGroup) buff.push(userGroup);
				buff.push('Last Seen: ' + this.getLastSeen(user) + '<br />');

				// get previous names and IPs
				buff.push(`Previous IP${Chat.plural(ips.length)}: ${ips.length > 0 ? ips.join(', ') : none}`);
				buff.push(`Previous alt${Chat.plural(prevNames.length)}: ${prevNames.length > 0 ? prevNames.join(', ') : none}`);

				return `${buff.join('<br />')}<br />`;
			}
			return false;
		},
		getIpRange: function (ip) { // strictly for IPv4 support only
			if (!ip) return;
			let ipArr = ip.split('.');
			let firstOctet = ipArr[0];
			let ipClass = '';
			if (firstOctet <= 126 || firstOctet <= 191) {
				ipClass = (firstOctet <= 126 ? 'A' : 'B');
				return [`${ipArr[0]}.${ipArr[1]}`, ipClass]; // this technically is not correct IP addressing
			} else if (firstOctet <= 223) {
				ipClass = 'C';
				return [`${ipArr[0]}.${ipArr[1]}.${ipArr[2]}`, ipClass];
			} else {
				return [undefined, 'unknown']; // this should never happen
			}
		},
		savePunishments: function () {
			setTimeout(function () {
				fs.writeFileSync('config/gold-punishments.json', JSON.stringify(Gold.punishments));
			}, (1.25 * 1000)); // only save every 1.25 seconds - TOPS
		},
		pmAll: function (message, pmName) {
			if (!pmName) pmName = '~Gold Server [Do not reply]';
			Users.users.forEach(curUser => {
				curUser.send('|pm|' + pmName + '|' + curUser.getIdentity() + '|' + message);
			});
		},
		pmStaff: function (message, from) {
			from = from ? ' (PM from ' + from + ')' : '';
			Users.users.forEach(curUser => {
				if (curUser.isStaff) {
					curUser.send('|pm|~Staff PM|' + curUser.getIdentity() + '|' + message + from);
				}
			});
		},
		pmUpperStaff: function (message, pmName, from) {
			if (!pmName) pmName = '~Upper Staff PM';
			from = from ? ' (PM from ' + from + ')' : '';
			Users.users.forEach(curUser => {
				if (curUser.group === '~' || curUser.group === '&') {
					curUser.send('|pm|' + pmName + '|' + curUser.getIdentity() + '|' + message + from);
				}
			});
		},
		logCrash: function (stack, message) {
			for (let roomid of ['development', 'staff']) {
				let curRoom = Rooms(roomid);
				if (curRoom) curRoom.add(`|html|<div class="broadcast-red"><b>CUSTOM GOLD FUNCTIONALITY HAS CRASHED:</b><br />${stack}<br />Detailed message: ${message}<br /><br /><b>Please report this to a developer... so panpawn.`).update();
			}
		},
	});
} catch (e) {
	console.log('crash: ' + e.stack);
	let staff = Rooms('staff');
	if (staff) staff.add(`|html|<div class="broadcast-red"><b>CUSTOM GOLD FUNCTIONALITY HAS CRASHED:</b><br />${e.stack}<br /><br /><b>Please report this to a developer... so panpawn.`).update();
}
