/****************************
 * Offline Messaging System *
 *       by: panpawn        *
 ***************************/
"use strict";

const MAX_TELLS_IN_QUEUE = 10;
const MAX_TELL_LENGTH = 600;


exports.commands = {
	tell: function (target, room, user) {
		if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
		if (!target) return this.parse('/help tell');
		let commaIndex = target.indexOf(',');
		if (commaIndex < 0) return this.errorReply("You forgot the comma.");
		let targetUser = toId(target.slice(0, commaIndex)), origUser = target.slice(0, commaIndex);
		let sentReply = `|raw|Your tell to ${Gold.nameColor(origUser, true)} has been added to their offline messaging queue.${Users(targetUser) && Users(targetUser).connected && user.userid !== targetUser ? "<br /><b>However, this user is currently online if you would like to private message them.</b>" : ""}`;
		if (Users.ShadowBan.checkBanned(user)) return this.sendReply(sentReply);
		if (targetUser === user.userid) return this.errorReply("You cannot send a tell to yourself.");
		let message = target.slice(commaIndex + 1).trim();
		if (Users(targetUser) && Users(targetUser).ignorePMs && !user.can('hotpatch')) return this.errorReply("Because this user is currently blocking PMs, this tell has failed to be added to their offline messaging queue.");
		if (message.length > MAX_TELL_LENGTH && !user.can('hotpatch')) return this.errorReply(`This tell is too large, it cannot exceed ${MAX_TELL_LENGTH} characters.`);
		if (targetUser.length < 1 || targetUser.length > 18) return this.errorReply("Usernames cannot be this length.  Check spelling?");
		if (!message || message.length < 1) return this.errorReply("Tell messages must be at least one character.");
		if (Gold.userData[targetUser] && Gold.userData[targetUser].tells && Object.keys(Gold.userData[targetUser].tells).length >= MAX_TELLS_IN_QUEUE && !user.can('hotpatch')) return this.errorReply("This user has too many tells queued, try again later.");
		Gold.createTell(user.name, targetUser, message); // function saves when tell is created automatically
		return this.sendReply(sentReply);
	},
	tellhelp: ["/tell [user], [message] - sends a user an offline message to be recieved when they next log on."],

	mailbox: function (target, room, user) {
		if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
		let pop = '|popup||wide||html| ';
		if (!target) {
			let data = Object.keys(Gold.userData);
			let keys, results = Object.create(null), userIdRegEx = new RegExp(`${user.userid}#.*`, "g");
			let tableTop = 'Current pending tells queued:<br /><table border="1" cellspacing ="0" cellpadding="3">';
			tableTop += '<tr><td>Tell ID:</td><td>Tell to:</td><td>Message:</td><td></td></tr>';
			let midTable = '', displayedIds = [];

			data.forEach(name => {
				if (!Gold.userData[name].tells || Gold.userData[name].tells.length > 0) return;
				keys = Object.keys(Gold.userData[name].tells);
				keys.find(arr => { // eslint-disable-line array-callback-return
					if (arr.match(userIdRegEx)) {
						results[arr.match(userIdRegEx)] = name;
					}
				});
				if (Object.keys(results).length > 0) {
					Object.keys(results).forEach(tellid => {
						if (!Gold.userData[results[tellid]].tells[tellid]) return;
						if (displayedIds.includes(tellid)) return;
						midTable += `<tr><td><code>${tellid}</code></td><td>${Gold.nameColor(name, true)}</td><td>${Gold.userData[name].tells[tellid]}</td><td><button class="button" name="send" value="/mailbox ${name},${tellid}">Delete Pending Message</button></td></tr>`;
						displayedIds.push(tellid);
					});
				}
			});
			if (!midTable) return user.send('|popup||wide||html|<font color="red">You do not currently have any tells pending to be sent at this time.</font>');
			user.send(`${pop + tableTop + midTable}</table>`);
		} else {
			target = target.split(',');
			for (let u in target) target[u] = target[u].trim();
			let mailboxButton = '<button class="button" name="send" value="/mailbox">Back to mailbox</button>';
			if (!target[1]) return false;
			if (!Gold.userData[target[0]]) return false;
			if (!Gold.userData[target[0]].tells[target[1]]) return user.popup(`${pop} <font color="red">This tell does not exist. Perhaps they just got it?</font><br /><br />${mailboxButton}`);
			if (!target[1].startsWith(`${user.userid}#`)) return user.popup(`${pop}<font color="red">You do not have permission to delete this tell.</font><br /><br />${mailboxButton}`);
			delete Gold.userData[target[0]].tells[target[1]];
			Gold.saveData();
			user.send(`${pop}You have deleted the pending tell to ${Gold.nameColor(target[0], true)} with tell ID: <code>${target[1]}</code>.<br /><br />${mailboxButton}`);
		}
	},
};
