/****************************
 * Offline Messaging System *
 *       by: panpawn        *
 ***************************/
"use strict";

const fs = require('fs');
const moment = require('moment');
const MAX_TELLS_IN_QUEUE = 10;
const MAX_TELL_LENGTH = 600;
let tells = {};

function loadTells() {
	try {
		tells = JSON.parse(fs.readFileSync('config/tells.json'));
	} catch (e) {
		tells = {};
	}
}
loadTells();

function saveTells() {
	fs.writeFile('config/tells.json', JSON.stringify(tells));
}
Gold.saveTells = saveTells;

function createTell(sender, reciever, message) {
	reciever = toId(reciever);
	message = Gold.emoticons.processEmoticons(Tools.escapeHTML(message)).replace(/&#x2f;/g, '/');
	if (!tells[reciever]) tells[reciever] = [];

	message = Gold.formatMessage(message); // PS formatting

	let date = moment().format('MMMM Do YYYY, h:mm A') + " EST";
	let tell = "<u>" + date + "</u><br />" + Gold.nameColor(sender, true) + ' said: ' + message;
	tells[reciever].push('|raw|' + tell);
	saveTells();
}

exports.commands = {
	tell: function (target, room, user) {
		if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
		if (!target) return this.parse('/help tell');
		let commaIndex = target.indexOf(',');
		if (commaIndex < 0) return this.errorReply("You forgot the comma.");
		let targetUser = toId(target.slice(0, commaIndex)), origUser = target.slice(0, commaIndex);
		let message = target.slice(commaIndex + 1).trim();
		if (Users(targetUser) && Users(targetUser).ignorePMs && !user.can('hotpatch')) return this.errorReply("Because this user is currently blocking PMs, this tell has failed to be added to their offline messaging queue.");
		if (message.length > MAX_TELL_LENGTH && !user.can('hotpatch')) return this.errorReply("This tell is too large, it cannot exceed " + MAX_TELL_LENGTH + " characters.");
		if (targetUser.length < 1 || targetUser.length > 18) return this.errorReply("Usernames cannot be this length.  Check spelling?");
		if (!message || message.length < 1) return this.errorReply("Tell messages must be at least one character.");
		if (tells[targetUser] && tells[targetUser].length >= MAX_TELLS_IN_QUEUE && !user.can('hotpatch')) return this.errorReply("This user has too many tells queued, try again later.");
		createTell(user.name, targetUser, message); // function saves when tell is created automatically
		return this.sendReply("|raw|Your tell to " + Gold.nameColor(origUser, true) + " has been added to their offline messaging queue." + (Users(targetUser) && Users(targetUser).connected && user.userid !== targetUser ? "<br /><b>However, this user is currently online if you would like to private message them.</b>" : ""));
	},
	tellhelp: ["/tell [user], [message] - sends a user an offline message to be recieved when they next log on."],
};

Gold.tells = tells;
