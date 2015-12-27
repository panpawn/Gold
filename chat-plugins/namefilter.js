"use strict";
const DIR = 'config/namefilter.json';
let namefilter;
try {
	namefilter = JSON.parse(fs.readFileSync(DIR));
} catch (err) {
	namefilter = {};
}

let notifyName = exports.notifyName = function (user) {
	for (let i in namefilter) {
		if (i == user.userid || user.userid.indexOf(i) > -1) {
			Rooms('staff').add("|html| [NameFilter] User " + user.name + "'s name contains the filtered word '" + i + '".' +
				'<button name = "send" value = "/fr ' + user.userid + '">Click2FR</button>').update();
		}
	}
}

exports.commands = {
	filtername: 'addnamefilter',
	addnamefilter: function (target, room, user) {
		if (!target || !target.trim()) return this.parse('/help namefilter');
		if (!this.can('hotpatch')) return false;
		if (target.length > 18) return this.errorReply("You cannot add names longer than 18 characters, the maximum character limit for a username.");

		let name = toId(target);
		namefilter[name] = 1;
		fs.writeFileSync(DIR, JSON.stringify(namefilter));

		Rooms('staff').add(user.name + " has added the word '" + name + "' to the name filter.").update();
		if (room.id !== 'staff') this.sendReply("The word '" + name + "' was added to the name filter.");
	},

	unfiltername: function (target, room, user) {
		if (!target || !target.trim()) return this.parse('/help namefilter');
		if (!this.can('hotpatch')) return false;
		if (target.length > 18) return this.errorReply("You cannot add names longer than 18 characters, the maximum character limit for a username.");

		let name = toId(target);
		if (!(name in namefilter)) return this.errorReply("The word '" + name + "' has not been added into the name filter.");

		delete namefilter[name];
		fs.writeFileSync(DIR, JSON.stringify(namefilter));

		Rooms('staff').add(user.name + " has removed the word '" + target + "' from the name filter.").update();
		if (room.id !== 'staff') this.sendReply("The word '" + name + "' was removed from name filter.");
	},

	namefilter: function (target, room, user) {
		if (!user.isStaff) return false;
		if (room.id === 'staff' && this.canBroadcast()) return;
		this.sendReplyBox('List of filtered names:<br>' + Object.keys(namefilter).join(', '));
	}

	namefilterhelp: ['/namefilter - Allows a user to view the list of filtered names. Requires %, @, &, ~',
		'/filtername [name] - Adds a name into the name filter. If a user\'s name contains a word present in this list, a notification will be sent to the staff room. Requires ~',
		'/unfiltername [name] - Removes a name from the name filter. Requires ~.'
	]
}
