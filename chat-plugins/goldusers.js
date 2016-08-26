/*************************************************
 * User Data Functions - by panpawn              *
 *                                               *
 *  This system includes features that store:    *
 *   - last seen data                            *
 *   - economy (bucks)                           *
 *   - tells (offline messaging)                 *
 *   - and more!                                 *
 *************************************************/
'use strict';

const fs = require('fs');
const moment = require('moment');

Gold.userData = Object.create(null);

function loadUserData() {
	fs.readFile('config/goldusers.json', 'utf8', function (err, file) {
		if (err) return;
		Gold.userData = JSON.parse(file);
	});
};
loadUserData();

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
				tellNum: 0,
				money: 0,
				lastSeen: 0,
				color: false,
				icon: false,
				vip: false,
				status: '',
				friendcode: '',
			} // we don't save blank user data objects until next save
		},
		saveData: function () {
				fs.writeFileSync('config/goldusers.json', JSON.stringify(Gold.userData));
		}.throttle(1 * 1000), // only save once/second - TOPS
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
			data.money = Number(data.money + amount);
			this.saveData();
		},
		readMoney: function (user) {
			user = toId(user);
			let data = this.checkExisting(user);
			return data.money;
		},
		moneyCirculating: function () {
			let data = Object.keys(Gold.userData);
			// [total bucks, average bucks, number of users with at least 1 money]
			let results = [0, 0, 0];

			data.forEach(user => {
				if (Gold.userData[user].money > 0) {
					if (isNaN(Gold.userData[user].money)) return;
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

			function ResultsArray (id, money) {
				this.id = id;
				this.money = money;
			}

			data.forEach(user => {
				if (Gold.userData[user].money > 0) {
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

		/*******************
		 * Misc. Functions *
		 *******************/
		hasVip: function (user) {
			user = toId(user);
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
				data.badges.remove(badgeid);
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
					title: 'Event Tournament Winner',
					img: 'http://www.smogon.com/media/forums/images/badges/spl.png',
				}, 'creator': {
					title: 'Server Creator',
					img: 'http://www.smogon.com/media/forums/images/badges/dragon.png',
				}
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
		customColor: function (user, action, color) {
			user = toId(user);
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
			user = toId(user);
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
			user = toId(user);
			if (user.substr(0, 5) === 'guest') return false;

			let data = this.checkExisting(user);
			if (!data.ips) data.ips = [];

			if (!data.ips.includes(ip)) data.ips.push(ip);
		},
		updateSeen: function (user) {
			user = toId(user);
			if (user.substr(0, 5) === 'guest') return false;

			let data = Gold.userData[user];
			if (!data) this.createUser(user);

			data.lastSeen = Date.now();
			this.saveData();
		},
		updateFriends: function (user, friend, action) {
			user = toId(user), friend = toId(friend);
			let data = this.checkExisting(user);
			if (!data.friends) data.friends = [];

			if (action === 'ADD') {
				if (!data.friends.includes(friend))data.friends.push(friend);
			} else if (action === 'DELETE') {
				if (data.friends.includes(friend)) data.friends.remove(friend);
			} else {
				return false;
			}

			this.saveData();
		},
		createTell: function (user, reciever, message) { // heavy lifting for /tell
			reciever = toId(reciever);
			user = toId(user);
			message = Gold.emoticons.processEmoticons(Tools.escapeHTML(message)).replace(/&#x2f;/g, '/');

			let data = this.checkExisting(reciever);
			if (!data.tells) data.tells = Object.create(null);
			let tells = data.tells;

			message = Gold.formatMessage(message); // Add PS formatting

			let date = `${moment().format('MMMM Do YYYY, h:mm A')} EST`;
			let tell = `<u>${date}</u><br />${Gold.nameColor(user, true)} said: ${message}`;

			Gold.userData[user].tellNum++;
			tells[`${user}#${Gold.userData[user].tellNum}`] = tell;
			this.saveData();
		},
		checkTells: function (user) {
			user = toId(user);
			let reply = [];
			if (Gold.userData[user]) {
				if (Object.keys(Gold.userData[user].tells).length > 0) {
					for (let i in Gold.userData[user].tells) {
						reply.push(`|raw|${Gold.userData[user].tells[i]}`);
						delete Gold.userData[user].tells[i];
					}
				}
			}
			if (reply.length > 0) this.saveData();
			if (reply.length === 0) return false;
			return reply;
		},
	});
} catch (e) {
	let staff = Rooms('staff');
	if (staff) staff.add(`|html|<div class="broadcast-red"><b>CUSTOM PS FUNCTIONALITY HAS CRASHED:</b><br />${e.stack}<br /><br /><b>Please report this to a developer... so panpawn.`).update();
}
