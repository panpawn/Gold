/* Friends List system
 * This is a simple friends list system for Pokemon Showdown.
 * It will alert you when your friends come online.  It also
 * will show you the last time they were online on the server.
 * by: panpawn
 */
'use strict';

const fs = require('fs');
const moment = require('moment');

const friendsFilepath = 'config/friends.json';
const settingsFilepath = 'config/friendssettings.json';

let Friends = Object.create(null);
function loadFriendsData() {
	fs.readFile(friendsFilepath, 'utf8', function (err, file) {
		if (err) return;
		Friends = JSON.parse(file);
	});
}
loadFriendsData();

let NotifySetting = Object.create(null);
function loadSettingsData() {
	fs.readFile(settingsFilepath, 'utf8', function (err, file) {
		if (err) return;
		NotifySetting = JSON.parse(file);
	});
}
loadSettingsData();

function getName(user, color, bold) {
	let name = (Users.getExact(user) && Users(user).connected ? Users.getExact(user).name : user);
	color = Gold.nameColor(user);
	let boldName = '<b>' + color + '</b>';
	if (user && !color && !bold) return name;
	if (user && color && !bold) return color;
	if (user && color && bold) return boldName;
}

function updateFriends() {
	fs.writeFileSync(friendsFilepath, JSON.stringify(Friends));
}
Gold.updateFrens = updateFriends;

function updateSettings() {
	fs.writeFileSync(settingsFilepath, JSON.stringify(NotifySetting));
}

function getFriendsNumber(user) {
	let list = Object.keys(Friends);
	let number = 0;
	list.forEach(function (kek) {
		Friends[kek].forEach(function (kek2) {
			if (kek2 === user) number++;
		});
	});
	return number;
}

function getAdded(user) {
	let originalName = user;
	user = toId(user);
	let list = Object.keys(Friends);
	let output = [];
	let label = (getFriendsNumber(user) > 1 ? 'users have' : 'user has');
	let reply = "<div style=\"max-height: 150px; overflow-y: auto; overflow-x: hidden;\" target=\"_blank\">";
	reply += "The following " + label + " added " + getName(originalName, true, true) + " as a friend:<br />";
	list.forEach(function (kek) {
		Friends[kek].forEach(function (kek2) {
			if (user === kek2) {
				kek = " <button name=\"send\" value=\"/friendslist " + kek + "\">" + getName(kek, true, false) + "</button>";
				output.push(kek);
			}
		});
	});
	if (output.length < 1) output.push("No one has added this user to their friendslist yet.");
	reply += output;
	return reply;
}

function friendsNotify(user) {
	let list = Object.keys(Friends);
	list.forEach(function (kek) {
		Friends[kek].forEach(function (kek2) {
			if (~kek2.indexOf(user)) {
				if (Users(kek) && Users(kek).connected && Users.getExact(kek)) {
					if (NotifySetting[kek]) {
						return Users(kek).send('|pm|~Friendslist Notifications|' + Users(kek).getIdentity() + '|/raw <b><font color="' + Gold.hashColor(user) + '">' + getName(user) + '</font></b> has come <font color=green>online</font>!');
					}
				}
			}
		});
	});
}
Gold.friendsNotify = friendsNotify;

function formatList(user, by) {
	if (!Friends[user]) Friends[user] = [];
	let reply = "<div style=\"max-height: 150px; overflow-y: auto; overflow-x: hidden;\" target=\"_blank\"><b><u>Friendslist of </u><u>" + getName(user, true, true) + "</u> (" + Friends[user].length + "):</b><br />";
	reply += (NotifySetting[user] ? "(<i>does</i> get notified when friends come online)" : "(<i>does NOT</i> get notified when friends come online)");
	reply += '<table border="1" cellspacing ="0" cellpadding="3">';
	reply += "<tr><td><u>Friend:</u></td><td><u>Last Online:</u></td><td><u>Bucks:</u></td></tr>";
	function lastSeen(frens) {
		if (Users(frens) && Users.getExact(frens) && Users(frens).connected) return "<font color=green>Currently Online</font>";
		if (!Gold.userData[frens] || Gold.userData[frens].lastSeen === 0) return "<font color=red>Never seen on this server</font>";
		let userLastSeen = moment(Gold.userData[frens].lastSeen).fromNow();
		return userLastSeen;
	}
	Friends[user].forEach(function (frens) {
		reply += "<tr><td>" + getName(frens, true, true) + "</td><td>" + lastSeen(frens) + "</td><td>" + (Gold.readMoney(frens) === 0 ? "None" : Gold.readMoney(frens)) + "</td></tr>";
	});
	reply += "</table>";
	let number = getFriendsNumber(user);
	let label = (number > 1 ? ' users have' : ' user has');
	reply += (number > 0 ? "<button title=\"See who added " + user + " as a friend.\" name=\"send\" value=\"/friendslist getadded, " + user + "\">" + number + label + " added " + getName(user, false, false) + " as a friend.</button>" : "");
	reply += "</div>";
	return reply;
}

exports.commands = {
	frens: 'friendslist',
	friends: 'friendslist',
	friend: 'friendslist',
	friendlist: 'friendslist',
	friendslist: function (target, room, user) {
		target = target.split(',');
		for (let u in target) target[u] = target[u].trim();

		if (!Friends[user.userid]) {
			Friends[user.userid] = [];
			updateFriends();
		}
		if (NotifySetting[user.userid] === null) {
			NotifySetting[user.userid] = false;
			updateSettings();
		}

		switch (target[0]) {
		case 'add':
			let newFriend = toId(target[1]);
			if (!newFriend) return this.errorReply("Usage: /friendslist add, [user] - Adds a user to your friendslist.");
			if (user.userid === newFriend) return this.errorReply("You cannot add yourself to your friendslist...");
			if (newFriend.length > 18) return this.errorReply("Usernames are not this long...");
			if (~Friends[user.userid].indexOf(newFriend)) return this.errorReply("You are already friends with this person!");
			if (Friends[user.userid].length > 100) return this.errorReply("You cannot have over 100 friends added to your friendslist, unfortunately.");
			Friends[user.userid].push(newFriend);
			updateFriends();
			this.sendReply("|raw|You have added " + getName(newFriend, true, true) + " to your friends list.");
			break;

		case 'delete':
		case 'remove':
			let removee = toId(target[1]);
			if (!removee) return this.errorReply("Usage: /friendslist remove, [user] - Removes a user from your friendslist.");
			if (!~Friends[user.userid].indexOf(removee)) return this.errorReply("You are not currently friends with this user.  Check spelling?");
			Friends[user.userid].splice(Friends[user.userid].indexOf(removee), 1);
			updateFriends();
			this.sendReply("|raw|You have <font color=red>unfriended</font> " + getName(removee, true, true) + " from your friends list.");
			break;

		case 'clear':
		case 'deleteall':
		case 'removeall':
			if (!Friends[user.userid] || Friends[user.userid].lenth < 1) return this.errorReply("You do not have any friends added to your friendslist yet.");
			if (user.lastCommand !== '/friendslist removeall') {
				user.lastCommand = '/friendslist removeall';
				this.errorReply("This command will clear your friendslist entirely.");
				this.errorReply("Do the command again to confirm that you want to clear your friendslist.");
				return;
			}
			Friends[user.userid] = [];
			updateFriends();
			user.lastCommand = '';
			this.sendReply("You have cleared your friendslist.");
			break;

		case 'toggle':
		case 'notify':
			if (NotifySetting[user.userid]) {
				NotifySetting[user.userid] = false;
				updateSettings();
			} else {
				NotifySetting[user.userid] = true;
				updateSettings();
			}
			let notify = NotifySetting[user.userid];
			this.sendReply("You are now " + (notify ? ' being notified ' : ' not being notified ') + "of friends joining the server.");
			break;

		case 'help':
			this.parse('/help friendslist');
			break;

		// command used with GUI
		case 'getadded':
		case 'added':
			if (!target[1]) return false;
			this.sendReplyBox(getAdded(target[1]));
			break;

		default:
			if (!this.runBroadcast()) return;
			if (!target[0]) {
				if (!Friends[user.userid] || Friends[user.userid].length < 1) {
					this.parse('/help friendslist');
					return this.errorReply("You do not have any friends added to your friendslist yet.");
				}
				return this.sendReplyBox(formatList(user.userid, user.userid));
			} else {
				target[0] = toId(target[0]);
				if (!Friends[target[0]] || Friends[target[0]].length < 1 || target[0] === 'constructor') {
					return this.errorReply("This user does not have any friends added to their friendslist yet.");
				}
				return this.sendReplyBox(formatList(target[0], user.userid));
			}
		}
	},
	friendslisthelp: ["Gold's friendslist allows users to add friends to their friendslists. The commands include...",
		"/friendslist add, [user] - Adds a user to your friendslist.",
		"/friendslist remove, [user] - Removes a user from your friendslist.",
		"/friendslist removeall - Clears your friendslist.",
		"/friendslist - Displays your friendslist.",
		"/friendslist [user] - Displays [user]'s friendslist.",
		"/friendslist added, [user] - Shows whose added a user as a friend to their friendslist.",
		"/friendslist notify - Toggles being notified or not when a friend comes online (disabled by default)."],
};

Gold.friends = Friends;
Gold.friendsSettings = NotifySetting;
