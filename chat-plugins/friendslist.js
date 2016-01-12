/* Friends List system
 * This is a simple friends list system for Pokemon Showdown.
 * It will alert you when your friends come online.  It also 
 * will show you the last time they were online on the server.
 * by: panpawn
 */

var fs = require('fs');
var moment = require('moment');

var friendsFilepath = 'config/friends.json';
var Friends = require('../' + friendsFilepath);

function getName(user, color, bold) {
	var name = (Users.getExact(user) && Users(user).connected ? Users.getExact(user).name : user);
	var color = '<font color="' + Gold.hashColor(user) + '">' + Tools.escapeHTML(name) + '</font>';
	var boldName = '<b>' + color + '</b>';
	if (user && !color && !bold) return name;
	if (user && color && !bold) return color;
	if (user && color && bold) return boldName;
}

function updateFriends() {
	fs.writeFile(friendsFilepath, JSON.stringify(Friends));
}
Gold.updateFrens = updateFriends;

function getFriendsNumber(user) {
	var list = Object.keys(Friends);
	var number = 0;
	list.forEach(function(kek) {
		Friends[kek].list.forEach(function(kek2) {
			if (kek2 === user) number++;
		});
	});
	return number;
}

function getAdded(user) {
	var originalName = user;
	user = toId(user);
	var list = Object.keys(Friends);
	var output = [];
	var label = (getFriendsNumber(user) > 1 ? 'users have' : 'user has');
	var reply = "<div style=\"max-height: 150px; overflow-y: auto; overflow-x: hidden;\" target=\"_blank\">";
	reply += "The following " + label + " added " + getName(originalName, true, true) + " as a friend:<br />";
	list.forEach(function(kek) {
		Friends[kek].list.forEach(function(kek2) {
			if (user === kek2) {
				kek = " <button name=\"send\" value=\"/friendslist " + kek + "\">" + getName(kek, true, false) + "</button>";
				output.push(kek);
			}
		});
	});
	if (output.length < 1) output.push("No one has added this user to their friendslist yet.");
	return reply += output;
}

function friendsNotify(user) {
	var list = Object.keys(Friends);
	list.forEach(function(kek) {
		Friends[kek].list.forEach(function(kek2) {
			if (~kek2.indexOf(user)) {
				if (Users(kek) && Users(kek).connected && Users.getExact(kek)) {
					if (Friends[kek].notify) {
						return Users(kek).send('|pm|~Friendslist Notifications|' + Users(kek).getIdentity() + '|/html <b><font color="' + Gold.hashColor(user) + '">' + getName(user) + '</font></b> has come <font color=green>online</font>!');
					}
				}
			}
		});
	});
}
Gold.friendsNotify = friendsNotify;

function formatList(user, by) {
	if (!Friends[user]) Friends[user] = {notify: false, list: []};
	var reply = "<div style=\"max-height: 150px; overflow-y: auto; overflow-x: hidden;\" target=\"_blank\"><b><u>Friendslist of </u><u>" + getName(user, true, true) + "</u> (" + Friends[user].length + "):</b><br />";
		reply += (Friends[user].notify ? "(<i>does</i> get notified when friends come online)" : "(<i>does NOT</i> get notified when friends come online)");
		reply += '<table border="1" cellspacing ="0" cellpadding="3">';
		reply += "<tr><td><u>Friend:</u></td><td><u>Last Online:</u></td><td><u>Bucks:</u></td></tr>";
	Friends[user].list.forEach(function(frens) {
		function lastSeen(frens) {
			if (Users(frens) && Users.getExact(frens) && Users(frens).connected) return "<font color=green>Currently Online</font>";
			if (!Gold.seenData[frens]) return "<font color=red>Never seen on this server</font>";
			var userLastSeen = moment(Gold.seenData[frens]).fromNow();
			return userLastSeen;
		}
		reply += "<tr><td>" + getName(frens, true, true) + "</td><td>" + lastSeen(frens) + "</td><td>" + (economy.readMoney(frens) == 0 ? "None" : economy.readMoney(frens)) + "</td></tr>";
	});
	reply += "</table>";
	var number = getFriendsNumber(user);
	var label = (number > 1 ? ' users have' : ' user has');
	reply += (number > 0 ? "<button title=\"See who added " + getName(user, false, false) + " as a friend.\" name=\"send\" value=\"/friendslist getadded, " + user + "\">" + number + label + " added " + getName(user, false, false) + " as a friend.</button>" :  "");
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
		for (var u in target) target[u] = target[u].trim();

		if (!Friends[user.userid]) {
			Friends[user.userid] = {
				notify: false,
				list: []
			}
			updateFriends();
		}

		switch (target[0]) {
			case 'add':
				var newFriend = toId(target[1]);
				if (!newFriend) return this.errorReply("Usage: /friendslist add, [user] - Adds a user to your friendslist.");
				if (user.userid === newFriend) return this.errorReply("You cannot add yourself to your friendslist...");
				if (newFriend.length > 18) return this.errorReply("Usernames are not this long...");
				if (~Friends[user.userid].indexOf(newFriend)) return this.errorReply("You are already friends with this person!");
				if (Friends[user.userid].length >= 100) return this.errorReply("You cannot have over 100 friends added to your friendslist, unfortunately.");
				Friends[user.userid].list.push(newFriend);
				updateFriends();
				return this.sendReply("|raw|You have added " + getName(newFriend, true, true) + " to your friends list.");
				break;

			case 'delete':
			case 'remove':
				var removee = toId(target[1]);
				if (!removee) return this.errorReply("Usage: /friendslist remove, [user] - Removes a user from your friendslist.");
				if (!~Friends[user.userid].indexOf(removee)) return this.errorReply("You are not currently friends with this user.  Check spelling?");
				Friends[user.userid].list.remove(removee);
				updateFriends();
				return this.sendReply("|raw|You have <font color=red>unfriended</font> " + getName(removee, true, true) + " from your friends list.");
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
				Friends[user.userid].list = [];
				updateFriends();
				user.lastCommand = '';
				return this.sendReply("You have cleared your friendslist.");
				break;

			case 'toggle':
			case 'notify':
				var notify = Friends[user.userid].notify = !Friends[user.userid].notify;
				updateFriends();
				return this.sendReply("You will " + (notify ? 'now be' : 'no longer be') + " notified of friends joining the server.");
				break;

			case 'help':
				this.parse('/help friendslist');
				break;

			// command used with GUI
			case 'getadded':
			case 'added':
				if (!target[1]) return false;
				return this.sendReplyBox(getAdded(target[1]));
				break;

			default:
				if (!this.canBroadcast()) return;
				if (!target[0]) {
					if (!Friends[user.userid] || Friends[user.userid].list.length < 1) {
						this.parse('/help friendslist');
						return this.errorReply("You do not have any friends added to your friendslist yet.");
					}
					return this.sendReplyBox(formatList(user.userid, user.userid));
				} else {
					target[0] = toId(target[0]);
					if (!Friends[target[0]] || Friends[target[0]].list.length < 1) {
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
