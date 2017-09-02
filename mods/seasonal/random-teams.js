'use strict';

const RandomTeams = require('../../data/random-teams');

class RandomStaffBrosTeams extends RandomTeams {
	randomStaffBrosTeam() {
		let team = [];
		let variant = (this.random(2) === 1);
		let sets = {
			'Beowulf': {
				species: 'Beedrill', ability: 'Download', item: 'Beedrillite', gender: 'M',
				moves: ['spikyshield', 'gunkshot', ['sacredfire', 'boltstrike', 'diamondstorm'][this.random(3)]],
				signatureMove: "Buzzing of the Storm",
				evs: {def:4, atk:252, spe:252}, nature: 'Jolly',
			},
			'EV': {
				species: 'Muk-Alola', ability: 'Unaware', item: 'Black Sludge', gender: 'M', // ask gender
				moves: [['Gunk Shot', 'Poison Jab'][this.random(2)], 'Recover', 'Coil'],
				signatureMove: 'Dark Aggro',
				evs: {hp: 252, spa: 252, spd: 4}, nature: 'Adamant',
			},
			'kamikaze': {
				species: 'Staraptor', ability: 'Flash Feather', item: 'Choice Band', gender: 'M',
				moves: ['Brave Bird', 'Close Combat', ['Double Edge', 'U-Turn'][this.random(2)]],
				signatureMove: 'Kamikaze Rebirth',
				evs: {hp: 172, atk: 228, spe: 108}, nature: 'Adamant',
			},
			'Level 51': {
				species: 'Porygon2', ability: 'Parental Bond', item: 'Eviolite',
				moves: ['Recover', ['Night Shade', 'Seismic Toss'][this.random(2)], ['Nature\'s Madness', 'Cosmic Power', 'Cotton Guard'][this.random(3)]],
				signatureMove: 'Next Level Strats',
				evs: {hp: 236, def: 220, spd: 48, spe: 4}, nature: 'Calm',
			},
			'panpawn': {
				species: 'Cyndaquil', ability: 'Flash Fire', item: 'Leftovers', gender: 'M',
				moves: ['Eruption', 'Extrasensory', 'Facade'],
				signatureMove: 'LaFireBlaze420',
				nature: 'Adamant',
			},
			'Scotteh': {
				species: 'Suicune', ability: 'Fur Coat', item: 'Leftovers', gender: 'N',
				moves: ['Slack Off', 'Amnesia', 'Steam Eruption'],
				signatureMove: 'Geomagnetic Storm',
				evs: {def: 252, spa: 4, spe: 252}, nature: 'Bold',
			},
			/*'Temporaryanonymous': {
				species: 'Doublade', ability: 'Tough Claws', item: 'Eviolite',
				gender: 'M',
				moves: ['Swords Dance', 'Gear Grind', ['Sacred Sword', 'X-Scissor', 'Knock off'][this.random(3)]],
				signatureMove: 'SPOOPY EDGE CUT',
				evs: {atk: 252, hp: 252, def: 4}, nature: 'Adamant',
			},*/
			'Trickster': {
				species: 'Hoopa', ability: 'Shadow Shield', item: 'Figy Berry',
				gender: 'M',
				moves: ['Inferno', 'Zap cannon', ['Dynamic Punch', 'Grass Whistle'][this.random(2)]],
				signatureMove: '3 Freeze',
				evs: {atk: 4, spa: 252, spe: 252}, nature: 'Hasty',
			},
			'xfix': {
				species: 'Xatu', ability: ['Magic Bounce', 'Prankster'][this.random(2)], item: 'Pomeg Berry', gender: 'M',
				moves: ['Substitute', ['Roost', 'Strength Sap'][this.random(2)], 'Thunder Wave'],
				signatureMove: 'glitzer popping',
				evs: {hp: 4, def: 252, spd: 252}, nature: 'Calm',
			},
		};

		// Generate the team randomly.
		let pool = Object.keys(sets);
		while (team.length < 6 && pool.length) {
			let name = this.sampleNoReplace(pool);
			let set = sets[name];
			set.level = 100;
			set.name = name;
			if (!set.ivs) {
				set.ivs = {hp:31, atk:31, def:31, spa:31, spd:31, spe:31};
			} else {
				for (let iv in {hp:31, atk:31, def:31, spa:31, spd:31, spe:31}) {
					set.ivs[iv] = iv in set.ivs ? set.ivs[iv] : 31;
				}
			}
			// Assuming the hardcoded set evs are all legal.
			if (!set.evs) set.evs = {hp:84, atk:84, def:84, spa:84, spd:84, spe:84};
			set.moves = [this.sampleNoReplace(set.moves), this.sampleNoReplace(set.moves), this.sampleNoReplace(set.moves)].concat(set.signatureMove);
			team.push(set);
		}

		return team;
	}
}

module.exports = RandomStaffBrosTeams;
