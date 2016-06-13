//Anime and Manga search by SilverTactic (Siiilver)
//This script searches for an anime/manga based on a given query and displays (usually relevant) results
//It uses the database/api of anilist
'use strict';

//DO NOT CHANGE THESE
const ID = "silvy-46dh7";
const SECRET_ID = "Mhz6vrcHF8qPS8v2mA7j3vaXl";

let nani = require('nani').init(ID, SECRET_ID);

if (!global.amCache) global.amCache = {anime:{}, manga:{}};
let amCache = global.amCache;

function format(text) {
	return text.toLowerCase().replace(/ /g, '');
}

function search(type, query) {
	let formattedQuery = format(query);
	if (amCache[type][formattedQuery]) return Promise.resolve(amCache[type][formattedQuery]);
	return nani.get(type + '/search/' + query).then(results => {
		//improve anime matching in some cases
		let match;
		if (type === 'anime') {
			for (let i in results) {
				if (format(results[i].title_romaji).match(/\(tv\)$/)) {
					match = i;
					break;
				}
			}
		}
		return nani.get(type + '/' + results[match || 0].id).then(data => {
			if (results.length > 1) {
				data.others = [];
				results.splice((match || 0), 1);
				for (let i = 0; i < (results.length > 6 ? 6 : results.length); i++) {
					let details = results[i];
					data.others.push('<button style = "display:inline; max-width:300px; outline: none;cursor: pointer; background: none; border: none; padding: 0; margin: 0; color:#224488;"' +
						'name = "send" value = "/' + type + ' ' + details.title_romaji + '">' + details.title_romaji + '</button>'
					);
				}
			}
			return Promise.resolve(data);
		});
	});
}

exports.commands = {
	animesearch: 'anime',
	as: 'anime',
	anime: function (target, room, user, connection, cmd) {
		if (!this.runBroadcast()) return;
		if (this.broadcasting && room.id === 'lobby') return this.errorReply("This command cannot be broadcasted in the Lobby.");
		if (!target || !target.trim()) return this.parse('/help anime');

		search('anime', target).then(data => {
			amCache.anime[format(target)] = data;
			if (data.genres.includes('Hentai') || data.genres.includes('Ecchi')) return this.errorReply("Yea... no.  You can't use this command to look up this particular anime.");
			this.sendReplyBox('<div style = "padding: 5px;min-height: 360px; text-shadow: 1px 1px 1px #777;">' +
				'<center style = "font-size: 12pt"><b>' + data.title_romaji + '</b></center>' +
				'<div style = "padding: 2px">' +
				'<div style = "float: right; margin: 10px; height: 290px;"><img src = "' + data.image_url_lge + '" style = "max-height: 290px; box-shadow: 4px 4px 8px black; border-radius: 8px;"></div>' +
				'<br><b>Status: </b>' + data.airing_status + '<br>' +
				(data.type !== 'TV' ? '<b>Show Type: </b>' + data.type + '<br>' : '') +
				(data.total_episodes ? '<b>Episode Count: </b>' + data.total_episodes + '<br>' : '') +
				'<b>Episode Duration: </b>' + (data.duration ? data.duration + ' minutes' : 'N/A') + '<br>' +
				'<b>Air Date: </b>' + (data.start_date ? data.start_date.split('T')[0] : 'Unknown') + (data.end_date && data.start_date !== data.end_date ? ' to ' + data.end_date.split('T')[0] : '') + '<br>' +
				'<b>Rating: </b>' + (Math.round(data.average_score) ? Math.round(data.average_score * 10) / 100 + ' on 10' : 'N/A') + '<br>' +
				'<b>Genre(s): </b>' + data.genres.join(', ') + '<br>' +
				'<br><details style = "outline: none">' +
				'<summary><b>Description</b> (Click to view)</summary>' +
				data.description.replace(/\n/g, '').split('<br><br>').join('<br>') +
				'</details><br>' +
				(data.others ? '<b>Similar Results:</b> ' + data.others.join(', ') : '') +
				'</div></div>'
			);
			room.update();
		}).catch(error => {
			this.errorReply("Anime results for '" + target + "' were not found.");
			room.update();
		});
	},
	animehelp: ['/anime [query] - Searches for an anime series based on the given search query.'],

	mangasearch: 'manga',
	ms: 'manga',
	manga: function (target, room, user, connection, cmd) {
		if (!this.runBroadcast()) return;
		if (this.broadcasting && room.id === 'lobby') return this.errorReply("This command cannot be broadcasted in the Lobby.");
		if (!target || !target.trim()) return this.parse('/help manga');

		search('manga', target).then(data => {
			amCache.manga[format(target)] = data;
			if (this.broadcasting && data.genres.includes('Hentai')) return this.errorReply("Hentai manga cannot be broadcasted.");
			this.sendReplyBox('<div style = "padding: 5px;min-height: 360px; text-shadow: 1px 1px 1px #777;">' +
				'<center style = "font-size: 14pt"><b>' + data.title_romaji + '</b></center>' +
				'<div style = "padding: 2px">' +
				'<div style = "float: right; margin: 10px; height: 290px;"><img src = "' + data.image_url_lge + '" style = "max-height: 290px; box-shadow: 4px 4px 8px black; border-radius: 8px;"></div>' +
				'<br><b>Status: </b>' + data.publishing_status + '<br>' +
				(data.type !== 'Manga' ? '<b>Type: </b>' + data.type + '<br>' : '') +
				(data.total_volumes ? '<b>Volume Count: </b>' + data.total_volumes + '<br>' : '') +
				(data.total_chapters ? '<b>Chapter Count: </b>' + data.total_chapters + '<br>' : '') +
				'<b>Air Date: </b>' + (data.start_date ? data.start_date.split('T')[0] : 'Unknown') + (data.end_date && data.start_date !== data.end_date ? ' to ' + data.end_date.split('T')[0] : '') + '<br>' +
				'<b>Rating: </b>' + (Math.round(data.average_score) ? Math.round(data.average_score * 10) / 100 + ' on 10' : 'N/A') + '<br>' +
				'<b>Genre(s): </b>' + data.genres.join(', ') + '<br>' +
				'<br><details style = "outline: none">' +
				'<summary><b>Description</b> (Click to view)</summary>' +
				data.description.replace(/\n/g, '').split('<br><br>').join('<br>') +
				'</details><br>' +
				(data.others ? '<b>Similar Results:</b> ' + data.others.join(', ') : '') +
				'</div></div>'
			);
			room.update();
		}).catch(error => {
			this.errorReply("Manga results for '" + target + "' were not found.");
			room.update();
		});
	},
	mangahelp: ['/manga [query] - Searches for a manga series based on the given search query.'],
};
