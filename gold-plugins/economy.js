/**
 * Economy
 * Gold Server - http://gold.psim.us/
 *
 * Deals with economy commands, mostly.
 * Functions for a lot of this can be found in: ./chat-plugins/goldusers.js
 *
 * @license MIT license
 */
'use strict';

const fs = require('fs');

let prices;

exports.commands = {
	shop: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (room.id === 'lobby' && this.broadcasting) {
			return this.sendReplyBox('<center>Click <button name="send" value="/shop" style="background-color: black; font-color: white;" title="Enter the Shop!"><font color="white"><b>here</button></b></font> to enter our shop!');
		} else {
			updatePrices();
			let topStyle = 'background: linear-gradient(10deg, #FFF8B5, #eadf7c, #FFF8B5); color: black; border: 1px solid #635b00; padding: 2px; border-radius: 5px;';
			let top = '<center><h3><b><u>Gold Bucks Shop</u></b></h3><table style="' + topStyle + '" border="1" cellspacing ="2" cellpadding="3"><tr><th>Item</th><th>Description</th><th>Cost</th></tr>';
			let bottom = '</table><br /><b>Prices in the shop go up and down automatically depending on the amount of bucks the average user has at that given time.</b><br />To buy an item from the shop, click the respective button for said item.<br>Do /getbucks to learn more about how to obtain bucks. </center>';

			return this.sendReply('|raw|' +
				top +
				shopTable("Symbol", "Buys a custom symbol to go infront of name and puts you towards the top of userlist (lasts 2 hrs from logout)", prices['symbol']) +
				// shopTable("Declare", "Advertisement declare for a room on the server from an Administrator / Leader.", prices['declare']) +
				shopTable("Fix", "Ability to modify a custom avatar, trainer card, or userlist icon.", prices['fix']) +
				shopTable("Custom", "Buys a custom avatar to be applied to your name (you supply)", prices['custom']) +
				shopTable("Animated", "Buys an animated avatar to be applied to your name (you supply)", prices['animated']) +
				shopTable("Room", "Buys a public unofficial chat room - will be deleted if inactive. Must have a valid purpose; staff can reject making these.", prices['room']) +
				shopTable("Musicbox", "A command that lists / links up to 8 of your favorite songs", prices['musicbox']) +
				shopTable("Trainer", "Gives you a custom command - you provide the HTML and command name.", prices['trainer']) +
				shopTable("Mystery Box", "Gives you a special surprise gift when you open it! (Could be good or bad!)", prices['pack']) +
				shopTable("Emote", "A custom chat emoticon such as \"Kappa\" - must be 30x30", prices['emote']) +
				shopTable("Color", "This gives your username a custom color on the userlist and in all rooms (existing at time of purchase)", prices['color']) +
				shopTable("Icon", "This gives your username a custom userlist icon on our regular client - MUST be a Pokemon and has to be 32x32.", prices['icon']) +
				shopTable("VIP Status", "Gives you the ability to change your custom symbol, avatar, custom color, and userlist icon as much as you wish, and it is also displayed in your profile.", prices['vip']) +
				bottom
			);
		}
	},

	buy: function (target, room, user) {
		updatePrices();
		if (!target) return this.errorReply("You need to pick an item! Type /buy [item] to buy something.");

		let parts = target.split(',');
		let output = '';
		let price;

		function link(link, formatted) {
			return '<a href="' + link + '" target="_blank">' + formatted + '</a>';
		}
		function moneyCheck(price) {
			if (price === 'FREE') return true;
			if (Gold.readMoney(user.userid) < price) return false;
			if (Gold.readMoney(user.userid) >= price) return true;
		}
		function alertStaff(message, staffRoom) {
			Gold.pmUpperStaff('/raw ' + message, '~Server', false);
			if (staffRoom) {
				Rooms.get('staff').add('|raw|<b>' + message + '</b>');
				Rooms.get('staff').update();
			}
		}
		function processPurchase(price, item, desc) {
			if (!desc) desc = '';
			if (Gold.readMoney(user.userid) < price && price !== 'FREE') return false; // this should never happen
			if (price !== 'FREE') Gold.updateMoney(user.userid, -price);
			logTransaction(user.name + ' has purchased a(n) ' + item + '. ' + desc);
		}

		switch (toId(parts[0])) {
		case 'symbol':
			price = prices['symbol'];
			if (Gold.hasVip(user.userid)) return this.errorReply("You are a VIP user - you do not need to buy custom symbols from the shop.  Use /customsymbol to change your symbol.");
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			processPurchase(price, parts[0]);
			this.sendReply("You have purchased a custom symbol. You will have this until you log off for more than an hour.");
			this.sendReply("Use /customsymbol [symbol] to change your symbol now!");
			user.canCustomSymbol = true;
			break;

		case 'custom':
		case 'avatar':
		case 'customavatar':
			price = prices['custom'];
			if (Gold.hasVip(user.userid)) return this.errorReply("You are a VIP user - you do not need to buy avatars from the shop.  Use /customavatar to change your avatar.");
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			if (!parts[1]) return this.errorReply("Usage: /buy avatar, [link to avatar].  Must be a PNG or JPG.");
			let filepaths = ['.png', '.jpg'];
			if (!~filepaths.indexOf(parts[1].substr(-4))) return this.errorReply("Your image for a regular custom avatar must be either a PNG or JPG. (If it is a valid file type, it will end in one of these)");
			processPurchase(price, parts[0], 'Image: ' + parts[1]);
			if (Config.customavatars[user.userid]) output = ' | <button name="send" value="/sca delete, ' + user.userid + '" target="_blank" title="Click this to remove current avatar.">Click2Remove</button>';
			alertStaff(Gold.nameColor(user.name, true) + ' has purchased a custom avatar. Image: ' + link(parts[1].replace(' ', ''), 'desired avatar'), true);
			alertStaff('<center><img src="' + parts[1] + '" width="80" height="80"><br /><button name="send" value="/sca set, ' + toId(user.name) + ', ' + parts[1] + '" target="_blank" title="Click this to set the above custom avatar.">Click2Set</button> ' + output + '</center>', false);
			this.sendReply("You have bought a custom avatar from the shop.  The staff have been notified and will set it ASAP.");
			break;

		case 'color':
		case 'customcolor':
			price = prices['color'];
			if (Gold.hasVip(user.userid)) price = 0;
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			if (!parts[1]) return this.errorReply("Usage: /buy color, [hex code OR name of an alt you want the color of]");
			if (parts[1].length > 20) return this.errorReply("This is not a valid color, try again.");
			processPurchase(price, parts[0], parts[1]);
			alertStaff(Gold.nameColor(user.name, true) + ' has purchased a custom color. Color: ' + parts[1], true);
			this.sendReply("You have purchased a custom color: " + parts[1] + " from the shop.  Please screen capture this in case the staff do not get this message.");
			break;

		case 'emote':
		case 'emoticon':
			price = prices['emote'];
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			if (!parts[1] || !parts[2]) return this.errorReply("Usage: /buy emote, [emote code], [image for the emote]");
			let emoteFilepaths = ['.png', '.jpg', '.gif'];
			if (!~emoteFilepaths.indexOf(parts[2].substr(-4))) return this.errorReply("Emoticons must be in one of the following formats: PNG, JPG, or GIF.");
			if (Gold.emoticons.chatEmotes[parts[1].replace(' ', '')]) return this.errorReply("An emoticon with this trigger word already exists on this server.");
			processPurchase(price, parts[0], 'Emote: ' + parts[1] + ' Link: ' + parts[2]);
			alertStaff(Gold.nameColor(user.name, true) + " has purchased a custom emote. Emote \"" + parts[1].trim() + "\": " + link(parts[2].replace(' ', ''), 'desired emote'), true);
			alertStaff('<center><img title=' + parts[1] + ' src=' + parts[2] + '><br /><button name="send" value="/emote add, ' + parts[1] + ', ' + parts[2] + '" target="_blank" title="Click to add the emoticon above.">Click2Add</button></center>', false);
			this.sendReply("You have bought a custom emoticon from the shop.  The staff have been notified and will add it ASAP.");
			break;

		case 'animated':
			price = prices['animated'];
			if (Gold.hasVip(user.userid)) return this.errorReply("You are a VIP user - you do not need to buy animated avatars from the shop.  Use /customavatar to change your avatar.");
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			if (!parts[1]) return this.errorReply("Usage: /buy animated, [link to avatar].  Must be a GIF.");
			if (parts[1].split('.').pop() !== 'gif') return this.errorReply("Your animated avatar must be a GIF. (If it's a GIF, the link will end in .gif)");
			processPurchase(price, parts[0], 'Image: ' + parts[1]);
			if (Config.customavatars[user.userid]) output = ' | <button name="send" value="/sca delete, ' + user.userid + '" target="_blank" title="Click this to remove current avatar.">Click2Remove</button>';
			alertStaff(Gold.nameColor(user.name, true) + ' has purchased a custom animated avatar. Image: ' + link(parts[1].replace(' ', ''), 'desired avatar'), true);
			alertStaff('<center><img src="' + parts[1] + '" width="80" height="80"><br /><button name="send" value="/sca set, ' + toId(user.name) + ', ' + parts[1] + '" target="_blank" title="Click this to set the above custom avatar.">Click2Set</button> ' + output + '</center>', false);
			this.sendReply("You have purchased a custom animated avatar.  The staff have been notified and will add it ASAP.");
			break;

		case 'room':
		case 'chatroom':
			price = prices['room'];
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			if (!parts[1]) return this.errorReply("Usage: /buy room, [room name]");
			let bannedRoomNames = [',', '|', '[', '-'];
			if (~bannedRoomNames.indexOf(parts[1])) return this.errorReply("This room name is not valid, try again.");
			processPurchase(price, parts[0], 'Room name: ' + parts[1]);
			alertStaff(Gold.nameColor(user.name, true) + ' has purchased a chat room.  Room name: ' + parts[1], true);
			this.sendReply("You have purchased a room.  The staff have been notified and it will be created shortly as long as it meets our basic rules.");
			break;

		case 'trainer':
		case 'trainercard':
			price = prices['trainer'];
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			processPurchase(price, parts[0]);
			alertStaff(Gold.nameColor(user.name, true) + ' has purchased a trainer card.', true);
			this.sendReply("|html|You have purchased a trainer card.  Please use <a href=http://goldservers.info/site/trainercard.html>this</a> to make your trainer card and then PM a leader or administrator the HTML with the command name you want it to have.");
			break;

		case 'mb':
		case 'musicbox':
			price = prices['musicbox'];
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			if (!Gold.createMusicBox(user)) return this.errorReply("You already have a music box! There's no need to buy another.");
			processPurchase(price, parts[0]);
			alertStaff(Gold.nameColor(user.name, true) + ' has purchased a music box.', true);
			Gold.createMusicBox(user); // give the user a music box
			this.parse('/' + toId(parts[0]) + ' help');
			this.sendReply("You have purchased a music box. You may have a maximum of 8 songs in it.");
			break;

		case 'fix':
			price = prices['fix'];
			if (Gold.hasVip(user.userid)) price = 0;
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			processPurchase(price, parts[0]);
			alertStaff(Gold.nameColor(user.name, true) + ' has purchased a fix from the shop.', true);
			user.canFixItem = true;
			this.sendReply("You have purchased a fix from the shop.  You can use this to alter your trainer card, music box, or custom chat emoticon.  PM a leader or administrator to proceed.");
			break;
		/*
		case 'ad':
		case 'declare':
			price = prices['declare'];
			if (Gold.hasVip(user.userid)) price = 0;
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			processPurchase(price, parts[0]);
			alertStaff(Gold.nameColor(user.name, true) + ' has purchased the ability to declare from the shop.', true);
			this.sendReply("You have purchased an advertisement declare from the shop.  Please prepare an advertisement for your room; a leader or administrator will soon be PMing you to proceed.");
			break;
		*/
		case 'userlisticon':
		case 'icon':
			price = prices['icon'];
			if (Gold.hasVip(user.userid)) price = 0;
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			if (!parts[1] || parts[1].length < 3) return this.errorReply("Usage: /buy icon, [32x32 icon image]");
			let iconFilepaths = ['.png', '.jpg', '.gif'];
			if (!~iconFilepaths.indexOf(parts[1].substr(-4))) return this.errorReply("Your image for a custom userlist icon must be a PNG, JPG, or GIF.");
			processPurchase(price, parts[0], 'Image: ' + parts[1]);
			alertStaff(Gold.nameColor(user.name, true) + ' has purchased a custom userlist icon. Image: ' + link(parts[1].replace(' ', ''), 'desired icon'), true);
			alertStaff('<center><button name="send" value="/icon ' + user.userid + ', ' + parts[1] + '" target="_blank" title="Click this to set the above custom userlist icon.">Click2Set</button></center>', false);
			this.sendReply("You have purchased a custom userlist icon.  The staff have been notified and this will be added ASAP.");
			break;

		case 'vip':
		case 'vipstatus':
			price = prices['vip'];
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			processPurchase(price, parts[0]);
			Gold.modifyBadge(user.userid, 'vip', 'GIVE');
			alertStaff(Gold.nameColor(user.name, true) + " has purchased VIP Status from the shop and they have recieved it automatically from the server.", true);
			break;

		case 'mysterybox':
		case 'pack':
		case 'magicpack':
			price = prices['pack'];
			if (!moneyCheck(price)) return this.errorReply("You do not have enough bucks for this item at this time, sorry.");
			if (room.id !== 'lobby') return this.errorReply("You must buy this item in the Lobby!");
			processPurchase(price, parts[0]);
			let randomNumber = Math.floor((Math.random() * 100) + 1);
			let prize = '';
			let goodBad = '';
			let opts;
			if (randomNumber < 70) {
				goodBad = 'bad';
				opts = ['nothing', 'rick rolled', 'meme avatar', 'kick from Lobby', '2 minute mute'];
				prize = opts[Math.floor(Math.random() * opts.length)];
			} else if (randomNumber > 70) {
				goodBad = 'good';
				opts = ['100 bucks', '125 bucks', 'a custom symbol', 'a custom userlist icon', 'ability to get Dubtrack VIP', 'ability to set the PotD', 'custom color', 'the cost of the mystery box back', 'ability to have a leader/admin broadcast an image to Lobby', 'a kind, warm hearted thank you'];
				prize = opts[Math.floor(Math.random() * opts.length)];
			}
			switch (prize) {
			// good
			case '100 bucks':
				Gold.updateMoney(user.userid, 100);
				break;
			case '125 bucks':
				Gold.updateMoney(user.userid, 125);
				break;
			case 'the cost of the mystery box back':
				Gold.updateMoney(user.userid, prices['pack']);
				break;
			case 'ability to get Dubtrack VIP':
			case 'ability to have a leader/admin broadcast an image to Lobby':
			case 'custom color':
			case 'ability to set the PotD':
				alertStaff(Gold.nameColor(user.name, true) + " has won an " + prize + ". Please PM them to proceed with giving them this.", true);
				break;
			case 'a custom symbol':
				user.canCustomSymbol = true;
				this.sendReply("Do /customsymbol [symbol] to set a FREE custom symbol! (Do /rs to reset your custom symbol when you want to remove it later.)");
				break;
			case 'a kind, warm hearted thank you':
				this.sendReply("THANK U 8D!");
				break;
			case 'a custom userlist icon':
				this.sendReply("PM a leader or administrator to claim this prize!");
				break;
			// bad
			case 'nothing':
				break;
			case 'meme avatar':
				opts = ['notpawn.png', 'notpawn2.png'];
				user.avatar = opts[Math.floor(Math.random() * opts.length)];
				break;
			case 'kick from Lobby':
				try {
					user.leaveRoom('lobby');
					user.popup("You have been kicked from the Lobby by the Mystery Box!");
				} catch (e) {}
				break;
			case '2 minute mute':
				try {
					Rooms('lobby').mute(user, 2 * 60 * 1000, false);
				} catch (e) {}
				break;
			case 'rick rolled':
				Rooms('lobby').add("|raw|<blink>" +
						"Never gonna give you up<br />" +
						"Never gonna let you down<br />" +
						"Never gonna run around and desert you<br />" +
						"Never gonna make you cry<br />" +
						"Never gonna say goodbye<br />" +
						"Never gonna tell a lie and hurt you</blink>").update();
				break;
			default:
				this.sendReply("Oh oh... this shouldn't of happened.  Please message an Administrator and take a screencap of this. (Problem with mysterybox)");
				break;
			}
			Rooms('lobby').add("|raw|" + Gold.nameColor(user.name, true) + " has bought a Magic Pack from the shop! " + (goodBad === 'good' ? "They have won a(n) <b>" + prize + "</b>!" : "Oh no!  They got a " + prize + " from their pack :(")).update();
			break;

		default:
			this.errorReply("Shop item not found.  Check spelling?");
		}
	},

	awardbucks: 'givebucks',
	gb: 'givebucks',
	givebucks: function (target, room, user) {
		if (!user.can('pban')) return this.errorReply("You do not have enough authority to do this.");
		let parts = target.split(',');
		if (!parts[1]) return this.errorReply("Usage: /givebucks [user], [amount]");
		for (let u in parts) parts[u] = parts[u].trim();
		let targetUser = parts[0];
		if (targetUser.length < 1 || toId(targetUser).length > 18) return this.errorReply("Usernames cannot be this length.");
		let amount = Math.round(Number(toId(parts[1])));

		//checks
		if (isNaN(amount)) return this.errorReply("The amount you give must be a number.");
		if (amount < 1) return this.errorReply("You can't give less than one buck.");
		if (amount > 1000) return this.errorReply("You cannot give more than 1,000 bucks at once.");

		//give the bucks
		Gold.updateMoney(toId(targetUser), amount);

		//send replies
		let amountLbl = amount + " Gold buck" + Gold.pluralFormat(amount, 's');
		logTransaction(user.name + " has given " + amountLbl + " to " + targetUser + ".");
		this.sendReply("You have given " + amountLbl + " to " + targetUser + ".");
		if (Users(targetUser)) Users(targetUser).popup("|modal|" + user.name + " has given " + amountLbl + " to you.");
	},

	takebucks: 'removebucks',
	removebucks: function (target, room, user) {
		if (!user.can('pban')) return this.errorReply("You do not have enough authority to do this.");
		let parts = target.split(',');
		if (!parts[1]) return this.errorReply("Usage: /removebucks [user], [amount]");
		for (let u in parts) parts[u] = parts[u].trim();
		let targetUser = parts[0];
		if (targetUser.length < 1 || toId(targetUser).length > 18) return this.errorReply("Usernames cannot be this length.");
		let amount = Math.round(Number(toId(parts[1])));
		if (amount > Gold.readMoney(targetUser)) return this.errorReply("You cannot remove more bucks than the user has.");

		//checks
		if (isNaN(amount)) return this.errorReply("The amount you remove must be a number.");
		if (amount < 1) return this.errorReply("You can't remove less than one buck.");
		if (amount > 1000) return this.errorReply("You cannot remove more than 1,000 bucks at once.");

		//take the bucks
		Gold.updateMoney(toId(targetUser), -amount);

		//send replies
		let amountLbl = amount + " Gold buck" + Gold.pluralFormat(amount, 's');
		logTransaction(user.name + " has removed " + amountLbl + " from " + targetUser + ".");
		this.sendReply("You have removed " + amountLbl + " from " + targetUser + ".");
		if (Users(targetUser)) Users(targetUser).popup("|modal|" + user.name + " has removed " + amountLbl + " from you.");
	},

	tb: 'transferbucks',
	transferbucks: function (target, room, user) {
		let parts = target.split(',');
		if (!parts[1]) return this.errorReply("Usage: /transferbucks [user], [amount]");
		for (let u in parts) parts[u] = parts[u].trim();
		let targetUser = parts[0];
		if (targetUser.length < 1 || toId(targetUser).length > 18) return this.errorReply("Usernames cannot be this length.");

		let amount = Math.round(Number(parts[1]));

		//checks
		if (isNaN(amount)) return this.errorReply("The amount you transfer must be a number.");
		if (amount < 1) return this.errorReply("Cannot be less than 1.");
		if (toId(targetUser) === user.userid) return this.errorReply("You cannot transfer bucks to yourself.");
		if (Gold.readMoney(user.userid) < amount) return this.errorReply("You cannot transfer more than you have.");

		//finally, transfer the bucks
		Gold.updateMoney(user.userid, Number(-amount));
		Gold.updateMoney(targetUser, Number(amount));

		//log the transaction
		let amountLbl = amount + " Gold buck" + Gold.pluralFormat(amount, 's');
		logTransaction(user.name + " has transfered " + amountLbl + " to " + targetUser);

		//send return messages
		this.sendReply("You have transfered " + amountLbl + " to " + targetUser + ".");

		let targetUserConnected = Users(parts[0]);
		if (targetUserConnected) {
			targetUserConnected.popup("|modal|" + user.name + " has transferred " + amountLbl + " to you.");
			targetUserConnected.sendTo(room, "|raw|<b>" + Gold.nameColor(user.name, false) + " has transferred " + amountLbl + " to you.</b>");
		}
	},

	'!atm': true,
	balance: 'atm',
	wallet: 'atm',
	satchel: 'atm',
	fannypack: 'atm',
	purse: 'atm',
	bag: 'atm',
	bank: 'atm',
	atm: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) target = user.name;
		let output = "<u>Gold Wallet:</u><br />", bucks = Gold.readMoney(target);
		output += Gold.nameColor(target, true) + ' ' + (bucks === 0 ? "does not have any Gold bucks." : "has " + bucks + " Gold buck" + Gold.pluralFormat(bucks, 's') + ".");
		return this.sendReplyBox(output);
	},

	'!richestuser': true,
	whosgotthemoneyz: 'richestuser',
	richestusers: 'richestuser',
	richestuser: function (target, room, user) {
		if (!this.runBroadcast()) return;
		let number = (target && !~target.indexOf('.') && target > 1 && !isNaN(target) ? Number(target) : 10);
		if (this.broadcasting && number > 10) number = 10; // limit to 10 when broadcasting
		return this.sendReplyBox(Gold.richestUsers(number));
	},

	moneylog: function (target, room, user) {
		if (!this.can('hotpatch')) return false;
		if (!target) return this.errorReply("Usage: /moneylog [number] to view the last x lines OR /moneylog [text] to search for text.");
		let word = false;
		if (isNaN(Number(target))) word = true;
		let lines = fs.readFileSync('logs/transactions.log', 'utf8').split('\n').reverse();
		let output = '';
		let count = 0;
		let regex = new RegExp(target.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "gi");

		if (word) {
			output += `Displaying last 50 lines containing "${target}":\n`;
			for (let line in lines) {
				if (count >= 50) break;
				if (!~lines[line].search(regex)) continue;
				output += lines[line] + '\n';
				count++;
			}
		} else {
			if (target > 100) target = 100;
			output = lines.slice(0, (lines.length > target ? target : lines.length));
			output.unshift("Displaying the last " + (lines.length > target ? target : lines.length) + " lines:");
			output = output.join('\n');
		}
		user.popup(output);
	},

	cs: 'customsymbol',
	customsymbol: function (target, room, user) {
		if (!user.canCustomSymbol && !Gold.hasVip(user.userid)) return this.errorReply("You don't have the permission to use this command.");
		if (user.hasCustomSymbol) return this.errorReply("You currently have a custom symbol, use /resetsymbol if you would like to use this command again.");
		if (!this.canTalk()) return;
		if (!target || target.length > 1) return this.errorReply("/customsymbol [symbol] - changes your symbol (usergroup) to the specified symbol. The symbol can only be one character");
		if (~target.indexOf('\u202e')) return this.errorReply("nono riperino");
		let bannedSymbols = /[ +<>$%‽!★@&~#*卐|A-z0-9]/;
		if (target.match(bannedSymbols)) return this.errorReply("That symbol is banned.");

		user.getIdentity = function (roomid) {
			if (this.locked) return '‽' + this.name;
			if (roomid) {
				let room = Rooms(roomid);
				if (room.isMuted(this)) return '!' + this.name;
				if (room && room.auth) {
					if (room.auth[this.userid]) return room.auth[this.userid] + this.name;
					if (room.isPrivate === true) return ' ' + this.name;
				}
			}
			return target + this.name;
		};
		user.updateIdentity();
		user.canCustomSymbol = false;
		user.hasCustomSymbol = true;
		return this.sendReply("Your symbol has been set.");
	},

	rs: 'resetsymbol',
	resetsymbol: function (target, room, user) {
		if (!user.hasCustomSymbol) return this.errorReply("You don't have a custom symbol!");
		user.hasCustomSymbol = false;
		delete user.getIdentity;
		user.updateIdentity();
		this.sendReply('Your symbol has been reset.');
	},

	'!economy': true,
	economy: function (target, room, user) {
		if (!this.runBroadcast()) return;
		let econ = Gold.moneyCirculating();
		return this.sendReplyBox("<b>Total bucks in economy:</b> " + econ[0] + "<br /><b>The average user has:</b> " + econ[1] + " bucks.<br />At least " + econ[2] + " users have 1 buck.");
	},
};


// local functions

function logTransaction(message) {
	if (!message) return false;
	fs.appendFile('logs/transactions.log', '[' + new Date().toUTCString() + '] ' + message + '\n');
}

function updatePrices() {
	let avg = Gold.moneyCirculating()[1];
	prices = { // 'FREE' is now supported
		'symbol': Math.round(avg * 0.035),
		// 'declare': Math.round(avg * 0.19),
		'fix': Math.round(avg * 0.2),
		'custom': 'FREE', // Math.round(avg * 0.55),
		'animated': 'FREE', // Math.round(avg * 0.65),
		'room': Math.round(avg * 0.53),
		'musicbox': Math.round(avg * 0.4),
		'trainer': Math.round(avg * 0.4),
		'emote': Math.round(avg * 2.5),
		'color': Math.round(avg * 4.5),
		'icon': Math.round(avg * 4.5),
		'pack': Math.round(avg * 1),
		'vip': Math.round(avg * 25),
	};
}

function shopTable(item, desc, price) {
	let buttonStyle = 'border-radius: 5px; background: linear-gradient(-30deg, #fff493, #e8d95a, #fff493); color: black; text-shadow: 0px 0px 5px #d6b600; border-bottom: 2px solid #635b00; border-right: 2px solid #968900; width: 100%;';
	let descStyle = 'border-radius: 5px; border: 1px solid #635b00; background: #fff8b5; color: black;';
	let priceStyle = 'border-radius: 5px; border: 1px solid #635b00; background: #fff8b5; color: black; font-weight: bold; text-align: center;';
	return '<tr><td style="' + descStyle + '"><button title="Click this button to buy a(n) ' + item + ' from the shop." style="' + buttonStyle + '" name="send" value="/buy ' + item + '">' + item + '</button></td><td style="' + descStyle + '">' + desc + '</td><td style="' + priceStyle + '">' + price + '</td></tr>';
}
