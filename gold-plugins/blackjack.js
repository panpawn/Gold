/**
 * Blackjack Game
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * This allows users to play the classic blackjack card game.
 * Credits: jd, panpawn
 * Card images by Byron Knoll (released into public domain)
 *
 * @license MIT license
 */
'use strict';

const CARD_IMAGE_PATH = 'http://ps-dev-panpawn1.c9users.io/cards/'; // image dir here pliz

class Blackjack extends Rooms.RoomGame {
	constructor(room, user, target) {
		super(room);
		this.room = room;

		this.turnTimeoutMinutes = 1;
		this.timerTickSeconds = 5;

		this.blackjackNumber = 0;
		this.createdBy = user.name;
		this.startedBy = '';
		this.allowRenames = true;

		this.playerCap = 16;
		this.minimumPlayers = 2;
		this.playerScrollWheel = 4;

		this.spectators = Object.create(null);
		this.dealer = new BlackjackDealer();

		this.symbols = {
			'♥': 'H',
			'♦': 'D',
			'♣': 'S',
			'♠': 'C',
		};
		this.deck = new BlackjackDeck().shuffle();

		this.id = this.room.id;
		this.title = 'Blackjack';
		this.started = false;
		this.state = 'signups';
		this.lastMessage = '';
		this.uhtmlChange = '';
		this.curUser = '';
		this.infoboxLimited = '';

		this.joinButton = '<button class="button" name="send" value="/joingame" title="Join Blackjack">Join Blackjack</button>';
		this.spectateButton = '<button class="button" name="send" value="/blackjack spectate" title="Spectate Blackjack">Spectate</button>';
		this.atLeastOneJoin = false;

		this.madeGame(target);
	}

	/**
	 * Game Setup
	 * makeGame - announces to room that a game has been made
	 * makePlayer - adds blackjack-specific properties to player object
	 */
	madeGame(target) {
		if (target) target = parseFloat(target);
		if (isNaN(target) || target <= 0) target = '';
		if (target !== '') {
			this.autostart = setTimeout(() => this.start(), (target * 60000));
		}
		if (!this.room.blackjack) this.room.blackjack = 1;
		this.blackjackNumber = this.room.blackjack;
		const createdBy = Chat.escapeHTML(this.createdBy);

		this.add(`${createdBy} has created a game of Blackjack. ${(target !== '' ? `(automatically starting in ${target} minute${Chat.plural(target)}.)` : '')} ${this.joinButton}<br />`, null, true);
		this.room.add(`|notify|Blackjack (${this.room.title})|${this.createdBy} created a game of Blackjack!`);
	}
	makePlayer(user) {
		return new BlackjackPlayer(user, this);
	}

	/**
	 * Joining/Leaving/Viewing
	 * joinGame - joins the game
	 * leaveGame - leaves the game
	 * spectate - spectates the game
	 * unspectate - stops spectating the game
	 */
	joinGame(user) {
		if (!user.named) return this.errorMessage(user, `You must first choose a name to play Blackjack.`);
		if (this.started) return this.errorMessage(user, `Blackjack has already started.`);
		const joined = this.addPlayer(user, this.players);
		if (!joined) {
			this.errorMessage(user, `You are already in this game.`);
			return false;
		}
		const comma = (this.atLeastOneJoin ? ', ' : '');
		this.add(Chat.html`${comma}${user.name} joined`);

		if (Object.keys(this.players).length === this.playerCap) {
			this.start();
		}
		if (this.spectators[user]) delete this.spectators[user]; // prevent player from spectating
		this.atLeastOneJoin = true;
		return true;
	}
	leaveGame(user) {
		if (this.started) return this.errorMessage(user, `You cannot leave this game; it has already started.`);
		const left = this.removePlayer(user);
		if (!left) return this.errorMessage(user, `You are not in this game to leave it.`);

		this.add(Chat.html`, ${user.name} left`);
	}
	spectate(user) {
		if (this.spectators[user]) return this.errorMessage(user, `You are already spectating this game.`);
		if (this.players[user]) return this.errorMessage(user, `You don't need to spectate the game; you're playing the game.`);
		this.spectators[user.userid] = user.userid;
		user.sendTo(this.id, `You are now spectating this game.`);
	}
	unspectate(user) {
		if (!this.spectators[user.userid]) return this.errorMessage(user, `You are already not spectating this game.`);
		delete this.spectators[user.userid];
		user.sendTo(this.id, `You are no longer spectating this game.`);
	}

	/**
	 * Utility
	 * errorMessage - sends a user an error message
	 * add - adds/sends text to room
	 * display - displays gameplay to players and spectators
	 * clear - clears a user's gameplay screen
	 * clearAllTimers - clears all possible existing timers pertaining to blackjack
	 */
	errorMessage(user, message) {
		user.sendTo(this.room, Chat.html`|html|<div class="message-error">${message}</div>`);
	}
	add(message, clean, add, endingMessage) {
		const change = this.uhtmlChange;
		if (add) {
			this.room.add(`|uhtml${change}|blackjack-${this.blackjackNumber}|<div class="infobox${this.infoboxLimited}">${(clean ? message : this.lastMessage + message)}</div>`).update();
		} else if (!add) {
			this.room.send(`|uhtml${change}|blackjack-${this.blackjackNumber}|<div class="infobox${this.infoboxLimited}">${(clean ? message : this.lastMessage + message)}</div>`);
		}
		if (!endingMessage) this.lastMessage = this.lastMessage + message;
		this.uhtmlChange = 'change';
	}
	display(text, clean, playerName) {
		const change = this.uhtmlChange;
		if (clean) this.lastMessage = '';
		const message = `|uhtml${change}|blackjack-${this.blackjackNumber}|<div class="infobox${this.infoboxLimited}">`;
		this.lastMessage += text;

		for (let i in this.players) {
			if (playerName && this.players[i].name === playerName) { // turn highlighting
				this.players[i].lastMessage += `<span class="highlighted">${text}</span>`;
				this.players[i].sendRoom(`${message}${this.players[i].lastMessage}</div>`);
			} else {
				this.players[i].lastMessage += text;
				this.players[i].sendRoom(`${message}${this.players[i].lastMessage}</div>`);
			}
		}
		for (let i in this.spectators) {
			let user = Users(this.spectators[i]);
			if (user) user.sendTo(this.id, `${message}${this.lastMessage + text}</div>`);
		}
	}
	clear() {
		const player = this.players[this.curUser];
		if (!player) return; // this should never happen
		player.sendRoom(`|uhtmlchange|user-blackjack-${this.blackjackNumber}|`);
	}
	clearAllTimers() {
		if (this.autostand) {
			clearTimeout(this.autostand);
			this.autostand = null;
		}
		if (this.dqTimer) {
			clearTimeout(this.dqTimer);
			this.dqTimer = null;
		}
		if (this.timerTick) {
			clearInterval(this.timerTick);
			this.timerTick = null;
		}
		if (this.autostart) {
			clearTimeout(this.autostart);
			this.autostart = null;
		}
	}

	/**
	 * Game State Changes
	 * start - starts the game
	 * end - ends the game
	 * destroy - destroys the game
	 */
	start(user) {
		const numberOfPlayers = Object.keys(this.players).length;
		if (numberOfPlayers < this.minimumPlayers) {
			if (this.autostart) {
				clearTimeout(this.autostart);
				this.autostart = null;
			}
			this.add("<br />Not enough players to start; game canceled.");
			this.destroy();
			return;
		}
		if (user) this.startedBy = user.name;
		this.infoboxLimited = (numberOfPlayers >= this.playerScrollWheel ? ' infobox-limited' : '');
		this.add(`[Blackjack has started. ${this.spectateButton}]`, true, true);

		this.curUser = Object.keys(this.players)[0];

		let output = `The game of blackjack has started${(this.startedBy !== '' ? ` (started by ${this.startedBy})` : ``)}.<br />`;
		this.started = true;
		this.state = 'started';
		for (let player in this.players) {
			this.giveCard(this.players[player]);
			this.giveCard(this.players[player]);
			output += Chat.html`<strong>${this.players[player].name}</strong>: [${this.players[player].cards[0]}] [${this.players[player].cards[1]}] (${this.players[player].points})<br />`;
		}

		this.giveCard('dealer');
		this.giveCard('dealer');
		output += `<strong>${this.dealer.name}</strong>: [${this.dealer.cards[0]}]`;

		this.display(output, true);
		this.next();
	}
	end(user, cmd) {
		const force = (cmd && cmd === 'forceend');
		if (cmd && !force) return this.errorMessage(user, `You can only end this game by using /blackjack forceend.`);
		if (force) {
			this.add(Chat.html`(Blackjack was forcibly ended by ${user.name}.)`, true);
			if (this.curUser !== '') this.clear();
		}
		let winners = [];

		if (!force) {
			if (this.dealer.points > 21) {
				for (let u in this.players) {
					if (this.players[u].status === 'bust') continue;
					winners.push(this.players[u].name);
				}
			} else if (this.dealer.points !== 21) {
				for (let u in this.players) {
					if (this.players[u].status === 'bust' || this.players[u].points <= this.dealer.points) continue;
					winners.push(this.players[u].name);
				}
			} else if (this.dealer.points === 21) {
				winners.push(this.dealer.name);
			}
			this.add(`[Blackjack has ended.]`, true, true, true);
			if (winners.length < 1) {
				this.display(`<br />There are no winners this time.`);
			} else {
				this.display(Chat.html`<br />Winner${Chat.plural(winners.length)}: ${winners.join(', ')}`);
			}
		}

		if (this.autostart) {
			clearTimeout(this.autostart);
			this.autostart = null;
		}
		this.state = 'ended';

		this.destroy();
	}
	destroy() {
		for (let i in this.players) {
			this.players[i].destroy();
		}
		this.room.blackjack++;
		this.clearAllTimers();
		delete this.room.game;
	}

	/**
	 * Gameplay
	 * hit - player decides to get a new card
	 * stand - player decides to keep current cards
	 * giveCard - gives a player a card from the deck
	 * getCardPoints - returns the point value of a user's cards
	 * next - game goes on to the next turn
	 */
	hit(user) {
		if (!this.started) return this.errorMessage(user, `Blackjack hasn't started yet.`);
		if (!this.players[user]) return this.errorMessage(user, `You aren't a player in this game.`);
		if (this.curUser !== user.userid) return this.errorMessage(user, `It's not your turn.`);
		this.players[user].selfUhtml = 'change';
		this.players[user].resetTimerTicks();

		this.giveCard(user);
	}
	stand(user) {
		const player = this.players[user];
		if (!this.started) return this.errorMessage(user, `Blackjack hasn't started yet.`);
		if (!player) return this.errorMessage(user, `You aren't a player in this game.`);
		if (this.curUser !== user.userid) return this.errorMessage(user, `It's not your turn.`);
		player.status = 'stand';
		let cards = '';
		for (let u in player.cards) cards += `[${player.cards[u]}] `;
		this.display(Chat.html`<br /><strong>${player.name}</strong> <u>stands</u> with ${cards} (${player.points})`, null, player.name);
		this.clear();

		this.next();
	}
	giveCard(user) {
		if (this.deck.length < 1) this.deck = Dex.shuffle(this.deck);
		const player = (user === 'dealer' ? this.dealer : this.players[user]);
		if (!player) return; // this should never happen
		player.cards.push(this.deck[0]);

		this.deck.shift();

		if (this.deck.length === 0) {
			this.display(`<br />${this.dealer.name} has ran out of cards in the deck; shuffling a new deck...`);
			this.deck = new BlackjackDeck().shuffle();
		}

		player.points = this.getCardPoints(player);

		if (player.cards.length < 3) return;

		if (player.cards.length > 2) this.display(Chat.html`<br /><strong>${player.name}</strong> <u>hit</u> and received [${player.cards[player.cards.length - 1]}] (${player.points})`, null, player.name);

		if (user === 'dealer') {
			if (player.points > 21) {
				let cards = '';
				for (let u in player.cards) cards += `[${player.cards[u]}] `;
				this.display(Chat.html`<br /><strong>${this.dealer.name}</strong> has <u>busted</u> with ${cards} (${player.points})`);
				this.end();
				return;
			} else if (player.points === 21) {
				this.display(`<br /><strong>${this.dealer.name}</strong> has blackjack!`);
				this.end();
				return;
			}
		}

		if (player.points > 21) {
			player.status = 'bust';
			let cards = '';
			for (let u in player.cards) cards += `[${player.cards[u]}] `;
			this.display(Chat.html`<br /><strong>${player.name}</strong> has <u>busted</u> with ${cards} (${player.points})`, null, player.name);
			this.clear();
		}
		if (player.points === 21) {
			player.status = 'stand';
			this.display(Chat.html`<br /><strong>${player.name}</strong> has blackjack!`, null, player.name);
			this.clear();
		}
		if (user !== 'dealer') this.players[user].cards = player.cards;
		this.next();
	}
	getCardPoints(player) {
		let points = 0;
		let aceCount = 0;
		for (let i in player.cards) {
			let card = toId(player.cards[i]).toUpperCase();
			if (!isNaN(Number(card))) {
				points += Number(card);
			} else if (['K', 'Q', 'J'].includes(card)) {
				points += 10;
			} else if (card === 'A') {
				points += 11;
				aceCount++;
			}
		}

		// At first, we value aces as 11, however, we will change their value
		// to be 1 if having them as 11 would cause an unnecessary bust. We will
		// do this by subtracting 10 for each ace that would otherwise cause a bust.
		while (points > 21 && aceCount > 0) {
			points -= 10;
			aceCount--;
		}

		return points;
	}
	next() {
		this.clearAllTimers();
		if (Object.keys(this.players)[Object.keys(this.players).length - 1] === this.curUser && this.players[this.curUser].status !== 'playing') {
			if (this.dealer.points < 17) {
				this.giveCard('dealer');
			} else if (this.dealer.points >= 17) {
				let cards = '';
				for (let u in this.dealer.cards) cards += `[${this.dealer.cards[u]}] `;
				this.display(`<br /><strong>${this.dealer.name}</strong> <u>stands</u> with ${cards} (${this.dealer.points})`);
				this.end();
			}
			return;
		}
		if (this.players[this.curUser].status !== 'playing') {
			let number = 0;
			while (this.players[Object.keys(this.players)[number]].status !== 'playing') number++;
			this.curUser = Object.keys(this.players)[number];
		}
		let output = `|uhtml${this.players[this.curUser].selfUhtml}|user-blackjack-${this.blackjackNumber}|<div class="infobox">`;
		output += `It's your turn to move, ${this.players[this.curUser].name}<br />`;
		for (let u in this.players[this.curUser].cards) {
			let card = this.players[this.curUser].cards[u];
			output += `<img src="${CARD_IMAGE_PATH}${toId(card).toUpperCase() + this.symbols[card.substr(-1)]}.png" title="${card}" height="100"/>' `;
		}
		output += `<br />Score: ${this.players[this.curUser].points}${(this.players[this.curUser].points === 21 ? ` (you have blackjack!)` : ``)}`;
		output += `<br /><button class="button" name="send" value="/blackjack hit" title="Hit (get another card)">Hit</button> | <button class="button" name="send" value="/blackjack stand" title="Stand (just keep these cards)">Stand</button>`;

		this.players[this.curUser].sendRoom(`|notify|Blackjack (${this.room.title})|It's your turn to play!`);
		this.players[this.curUser].sendRoom(output);
		this.players[this.curUser].playScreen = output.replace('|uhtml|', '|uhtmlchange|');
		this.dqTimer = setTimeout(() => {
			let cards = '';
			for (let u in this.players[this.curUser].cards) cards += `[${this.players[this.curUser].cards[u]}] `;
			this.players[this.curUser].status = 'stand';
			this.display(Chat.html`<br /><strong>${this.players[this.curUser].name}</strong> <u>stands</u> with ${cards} (${this.players[this.curUser].points}) (Auto-stand: took too long to move)`, null, this.players[this.curUser].name);
			this.clear();
			this.next();
		}, this.turnTimeoutMinutes * 60 * 1000);
		this.timerTick = setInterval(() => {
			let display = this.players[this.curUser].playScreen;
			if (display !== '') {
				let timeLeft = this.players[this.curUser].timerTicksLeft - 5;
				let buffer = (String(timeLeft).length === 1 ? '0' : '');
				let half = (timeLeft <= ((this.turnTimeoutMinutes * 60) / 2));
				this.players[this.curUser].sendRoom(`${display} | <span${half ? ` class="message-error"` : ``}>[<i class="fa fa-hourglass-${half ? 2 : 1}" aria-hidden="true"></i> 0:${buffer}${timeLeft}]</span>`);
				this.players[this.curUser].timerTicksLeft -= this.timerTickSeconds;
			}
		}, this.timerTickSeconds * 1000);
	}
}

class BlackjackPlayer extends Rooms.RoomGamePlayer {
	constructor(user, game) {
		super(user, game);
		this.game = game;

		this.cards = [];
		this.points = 0;
		this.status = 'playing';

		this.selfUhtml = '';
		this.lastMessage = '';
		this.playScreen = '';
		this.timerTicksLeft = this.game.turnTimeoutMinutes * 60; // to get into seconds-format
	}
	resetTimerTicks() {
		this.timerTicksLeft = this.game.turnTimeoutMinutes * 60;
	}
}

class BlackjackDealer {
	constructor() {
		this.cards = [];
		this.points = 0;
		this.name = 'The Dealer';
	}
}

class BlackjackDeck {
	constructor() {
		this.deck = [
			'A♥', 'A♦', 'A♣', 'A♠', '2♥', '2♦', '2♣', '2♠', '3♥', '3♦', '3♣',
			'3♠', '4♥', '4♦', '4♣', '4♠', '5♥', '5♦', '5♣', '5♠', '6♥', '6♦', '6♣', '6♠',
			'7♥', '7♦', '7♣', '7♠', '8♥', '8♦', '8♣', '8♠', '9♥', '9♦', '9♣', '9♠', '10♥',
			'10♦', '10♣', '10♠', 'J♥', 'J♦', 'J♣', 'J♠', 'Q♥', 'Q♦', 'Q♣', 'Q♠', 'K♥', 'K♦',
			'K♣', 'K♠',
		];
	}
	shuffle() {
		return Dex.shuffle(this.deck);
	}
}

exports.commands = {
	bj: 'blackjack',
	blackjack: {
		new: 'create',
		create: function (target, room, user) {
			if (!this.can('gamemanagement', null, room)) return;
			if (room.game) return this.errorReply("There is already a game running in this room.");
			if (room.blackjackDisabled) return this.errorReply("Blackjack is currently disabled in this room.");

			room.game = new Blackjack(room, user, target);
		},
		start: function (target, room, user) {
			if (!this.can('gamemanagement', null, room)) return;
			if (!room.game || room.game.title !== 'Blackjack') return this.errorReply("There is no game of blackjack currently ongoing in this room.");

			room.game.start(user);
		},
		forceend: 'end',
		end: function (target, room, user, connection, cmd) {
			if (!this.can('gamemanagement', null, room)) return;
			if (!room.game || room.game.title !== 'Blackjack') return this.errorReply("There is no game of blackjack currently ongoing in this room.");

			room.game.end(user, cmd);
		},
		hit: function (target, room, user) {
			if (!room.game || room.game.title !== 'Blackjack') return this.errorReply("There is no game of blackjack currently ongoing in this room.");

			room.game.hit(user);
		},
		stand: function (target, room, user) {
			if (!room.game || room.game.title !== 'Blackjack') return this.errorReply("There is no game of blackjack currently ongoing in this room.");

			room.game.stand(user);
		},
		j: 'join',
		join: function (target, room, user) {
			return this.parse('/joingame');
		},
		l: 'leave',
		leave: function (target, room, user) {
			return this.parse('/leavegame');
		},
		unspectate: 'spectate',
		spectate: function (target, room, user, connection, cmd) {
			if (!room.game || room.game.title !== 'Blackjack') return this.errorReply("There is no game of blackjack currently ongoing in this room.");

			if (cmd === 'spectate') {
				room.game.spectate(user);
			} else if (cmd === 'unspectate') {
				room.game.unspectate(user);
			}
		},
		disable: function (target, room, user) {
			if (!this.can('declare', null, room)) return;
			if (room.blackjackDisabled) return this.errorReply("Blackjack is already disabled in this room.");
			room.blackjackDisabled = true;
			this.privateModCommand(`(${user.name} disabled games of blackjack in this room.)`);

			if (room.chatRoomData) {
				room.chatRoomData.blackjackDisabled = room.blackjackDisabled;
				Rooms.global.writeChatRoomData();
			}
		},
		enable: function (target, room, user) {
			if (!this.can('declare', null, room)) return;
			if (!room.blackjackDisabled) return this.errorReply("Blackjack is already enabled in this room.");
			room.blackjackDisabled = false;
			this.privateModCommand(`(${user.name} enabled games of blackjack in this room.)`);

			if (room.chatRoomData) {
				room.chatRoomData.blackjackDisabled = room.blackjackDisabled;
				Rooms.global.writeChatRoomData();
			}
		},
		'': 'help',
		help: function (target, room, user) {
			return this.parse('/help blackjack');
		},
	},
	blackjackhelp: [
		"/blackjack create - Creates a game of blackjack. Requires: % @ # & ~",
		"/blackjack create [autostart] - Automatically creates a game of blackjack in [autostart] minutes. Requiers: % @ # & ~",
		"/blackjack join - Joins a game of blackjack.",
		"/blackjack leave - Leaves a game of blackjack.",
		"/blackjack spectate - Spectates a game of blackjack.",
		"/blackjack unspectate - Stops spectating a game of blackjack.",
		"/blackjack end - Ends a game of blackjack. Requires: % @ # & ~",
		"/blackjack disable - Prevents games of blackjack from being made in the room. Requires: # & ~",
		"/blackjack enable - Allows games of blackjack from being made in the room. Requires: # & ~",
	],
};
