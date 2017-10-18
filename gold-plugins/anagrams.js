/**************************************
* Anagram plugin for Pokémon Showdown *
* By: jd                              *
**************************************/
// TODO: Replace .sample methods

/*
'use strict';

const fs = require('fs');
const https = require('https');

let anagramWords = ['pokemon'];

fs.readFile('config/wordlist.txt', 'utf8', function (err, data) {
	if (!err) {
		anagramWords = data.split('\n');
		return;
	}

	let options = {
		host: 'pastebin.com',
		port: 80,
		path: '/raw/5yQ8MLG2',
		method: 'GET',
	};

	https.get(options, function (res) {
		let data = '';

		res.on('data', function (chunk) {
			data += chunk;
		}).on('end', function () {
			if (data.length < 1) return console.log("Error downloading wordlist.txt.");
			fs.writeFile('config/wordlist.txt', data);
			anagramWords = data.split('\n');
		});
	});
});

exports.commands = {
	anagram: function (target, room, user) {
		if (!user.can('broadcast', null, room) || !this.canTalk()) return this.errorReply('/anagram - Access denied.');
		if (!target && !room.anagram) return this.parse("/help anagram");
		if (!this.runBroadcast()) return;
		if (room.anagram) return this.sendReplyBox("Word: " + room.anagram.scrambledWord);
		if (!room.anagram) room.anagram = {};

		target = toId(target);
		let theme = '';

		switch (target) {
		case 'pokemon':
			theme = 'Pokemon';
			let pokemon = Dex.getTemplate(Object.keys(Dex.data.Pokedex).sample().trim());
			room.anagram.word = pokemon.name;
			while (toId(pokemon.name).indexOf('mega') > -1 || pokemon.tier === 'CAP') {
				pokemon = Dex.getTemplate(Object.keys(Dex.data.Pokedex).sample().trim());
				room.anagram.word = pokemon.name;
			}
			break;

		case 'info':
		case 'credits':
			this.sendReplyBox("Anagram plugin by <a href=\"https://gist.github.com/jd4564/194c045bec24e137de92\">jd</a>");
			delete room.anagram;
			break;

		default:
		case 'normal':
			theme = 'Normal';
			room.anagram.word = anagramWords.sample().trim();
			while (room.anagram.word.length < 4 || room.anagram.word.length > 8) room.anagram.word = anagramWords.sample().trim();
			break;
		}

		room.anagram.scrambledWord = toId(room.anagram.word.split('').sort(function () {return 0.5 - Math.random();}).join(''));
		while (room.anagram.scrambledWord === toId(room.anagram.word)) room.anagram.scrambledWord = toId(room.anagram.word.split('').sort(function () { return 0.5 - Math.random(); }).join(''));

		room.chat = function (user, message, connection) {
			message = Chat.parse(message, this, user, connection);
			if (message) {
				this.add('|c|' + user.getIdentity(this.id) + '|' + message, true);
				if (room.anagram && toId(message) === toId(room.anagram.word)) {
					this.add('|raw|<div class="infobox">' + Gold.nameColor(user.name) + ' got the word! It was <b>' + room.anagram.word + '</b></div>');
					delete room.anagram;
					delete room.chat;
				}
			}
			this.update();
		};
		return this.add('|raw|<div class="infobox">' + Gold.nameColor(user.name) + ' has started an anagram. Letters: <b>' + room.anagram.scrambledWord + '</b> Theme: <b>' + theme + '</b></div>');
	},
	anagramhelp: ["Usage: /anagram [normal/pokemon] - Creates an anagram game in the respected room.  Requires +, %, @, #, &, ~"],

	endanagram: function (target, room, user) {
		if (!user.can('broadcast', null, room)) return this.parse("/help endanagram");
		if (!room.anagram) return this.sendReply('There is no anagram running in here.');
		delete room.anagram;
		this.add('|raw|<div class="infobox">The anagram game was ended by <b>' + Gold.nameColor(user.name) + '</b></div>');
	},
	endanagramhelp: ["/endanagram - Ends the current game of anagrams in the respected room.  Requires +, %, @, #, &, ~"],
};
*/
