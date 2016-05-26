/* Seen command
 * by jd and panpawn
 */

'use strict';

if (typeof Gold === 'undefined') global.Gold = {};

const fs = require('fs');
const moment = require('moment');

let seenData = {};
function loadData() {
	try {
		seenData = JSON.parse(fs.readFileSync('config/seenData.json', 'utf8'));
	} catch (e) {
		seenData = {};
	}
}
loadData();

function saveData() {
	fs.writeFileSync('config/seenData.json', JSON.stringify(seenData));
}

function updateSeen(userid) {
	if (!userid) return false;
	if (userid.substr(0, 5) === 'guest') return false; // don't record guest numbers
	seenData[toId(userid)] = Date.now();
	saveData();
}

global.updateSeen = updateSeen;
Gold.seenData = seenData;

exports.commands = {
	lastseen: 'seen',
	seen: function (target, room, user) {
		switch (target) {
			case 'obj':
				if (!this.runBroadcast()) return;
				this.sendReplyBox("There have been " + Object.size(seenData) + " user names recorded in this database.");
				break;
			default:
				if (!this.runBroadcast()) return;
				let userid = toId(target);
				if (userid.length > 18) return this.errorReply("Usernames cannot be over 18 characters.");
				if (userid.length < 1) return this.errorReply("/seen - Please specify a name.");
				let userName = '<strong class="username">' + Gold.nameColor(target, false) + '</strong>';
				if (userid === user.userid) return this.sendReplyBox(userName + ", have you looked in a mirror lately?");
				if (Users(target) && Users(target).connected) return this.sendReplyBox(userName + ' is currently <font color="green">online</font>.');
				if (!seenData[userid]) return this.sendReplyBox(userName + ' has <font color=\"red\">never</font> been seen online on this server.');
				let userLastSeen = moment(seenData[userid]).format("MMMM Do YYYY, h:mm A");
				this.sendReplyBox(userName + ' was last seen online on ' + userLastSeen + ' EST. (' + moment(seenData[userid]).fromNow() + ')');
				break;
		}
	},
};
