"use strict";
const DIR = 'config/namefilter.json';
let namefilter;
try {
	namefilter = JSON.parse(fs.readFileSync(DIR));
} catch (err) {
	fs.writeFileSync(DIR, '{}');
	namefilter = JSON.parse(fs.readFileSync(DIR));
}

let notifyName = exports.notifyName = function (user) {
	for (let i in namefilter) {
		if (i == user.userid || user.userid.indexOf(i) > -1) {
			Rooms('staff').add("|c|~| [NameFilter] User " + user + "'s name contains the filtered word '" + i + '"').update();
		}
	}
}

exports.commands = {
	filtername: 'namefilter',
	namefilter: function (target, room, user) {
		if (!target || !target.trim()) return this.parse('/help namefilter');
		if (!this.can('hotpatch')) return false;
		if (target.length > 18) return this.errorReply("You cannot add names longer than 18 characters, the maximum character limit for a username.");

		let name = toId(target);
		namefilter[name] = 1;
		fs.writeFileSync(DIR, JSON.stringify(namefilter, null, 1));

		Rooms('staff').add(user.name + " has added the word '" + target + "' to the name filter.").update();
	},
	namefilterhelp: ['/namefilter [word] - Adds a word to the name filter and notifies staff if a user is using a name containing this word.']
}
