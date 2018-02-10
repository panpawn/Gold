/**
 * Pokemon Record
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * Keeps track of the state of the pokemon match records for
 * the [Gen 1] Random Auto Level Adjusted format.
 *
 * @license MIT
 */

'use strict';

const fs = require('fs');

// Once it's been loaded, this is an object taking species names to the
// number of wins and losses for random teams with that species.
global.pokemonRecord = {};

// Load the pokemon record initially.
loadPokemonRecord();

function loadPokemonRecord(initial) {
	let filename;
	if (initial) {
		// Static initial version of the pokmeon record - all pokemon at level 50.
		filename = 'config/pokemon-match-records-initial.tsv';
	} else {
		// Default version of the pokemon record - updated as matches are played.
		filename = 'config/pokemon-match-records.tsv';
	}

	fs.readFile(filename, (err, recordData) => {
		if (err && !initial) {
			// If the pokemon record doesn't exist yet, load the initial version.
			loadPokemonRecord(true);
		}
		if (!err) {
			let dataLines = ('' + recordData).split('\n');
			global.pokemonRecord = {};
			for (let i = 1; i < dataLines.length; i++) {
				let line = dataLines[i].trim();
				if (!line) continue;
				let row = line.split('\t');
				if (row.length === 4) {
					let species = row[0].toLowerCase();
					let wins = row[1];
					let losses = row[2];
					let level = row[3];
					global.pokemonRecord[species] = {
						wins: wins,
						losses: losses,
						level: level,
					};
				}
			}
		}
	});
}

module.exports = {
	loadPokemonRecord,
};
