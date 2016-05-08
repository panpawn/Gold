//Anime search by SilverTactic (Siiilver)
//This script searches for an anime based on a given query and displays results.
//it uses the anime database of hummingbird.me btw
"use strict";

const request = require('request');

if (!global.animeCache) global.animeCache = {queries: {}, results: {}};
let animeCache = global.animeCache;

function formatQuery(query) {
	return query.toLowerCase().replace(/ /g, '');
}

function viewInfo(data) {
	let info = '<div style = "min-height: 250px">' +
		'<div style = "float: left; height: 250px; margin-right: 2px;"><img src = "' + data.cover_image + '" style = "max-height: 250px;"></div>' +
		'<div style = "padding: 2px">' +
		'<b style = "font-size: 11pt">' + data.title + '</b><br>' +
		'<b>Status: </b>' + data.status + '<br>' +
		(data.show_type !== 'TV' ? '<b>Show Type: </b>' + data.show_type + '<br>' : '') +
		(data.episode_count ? '<b>Episode Count: </b>' + data.episode_count + '<br>' : '') +
		'<b>Episode Duration: </b>' + (data.episode_length ? data.episode_length + ' minutes' : 'N/A') + '<br>' +
		'<b>Air Date: </b>' + (data.started_airing || 'Unknown') + '<br>' +
		'<b>Rating: </b>' + (data.community_rating ? Math.round(data.community_rating * 100) / 100 + ' on 5' : 'N/A') + '<br>' +
		'<b>Genre(s): </b>' + data.genres.map(genre => genre.name).join(', ') + '<br>' +
		'<details style = "outline: 0px">' +
		'<summary><b>Synopsis</b> (Click to view)</summary>' +
		data.synopsis.split('\n')[0] +
		'</details></div></div>';
	return info;
}

function searchAnime(query) {
	let formattedQuery = formatQuery(query);
	return new Promise((resolve, reject) => {
		if (animeCache.queries[formattedQuery]) return resolve(animeCache.queries[formattedQuery]);
		let link = 'https://hummingbird.me/search.json?query=' + query;
		request(link, function (err, response, data) {
			if (err || response.statusCode !== 200) return reject('Anime results for "' + query + '" were not found...');
			data = JSON.parse(data);
			//displays exact match if found, displays first match otherwise
			let firstMatch, exactMatch;
			for (let i in data.search) {
				let info = data.search[i];
				if (info.type === 'anime') {
					if (info.link === formattedQuery || toId(info.title) === formattedQuery) {
						exactMatch = i;
						break;
					}
					if (!firstMatch) firstMatch = i;
				}
			}
			if (!firstMatch && !exactMatch) return reject('Anime results for "' + query + '" were not found...');
			let info = data.search[exactMatch || firstMatch];
			resolve(info.link);
		});
	})
	.then(name => {
		return new Promise((resolve, reject) => {
			if (animeCache.results[name]) return resolve(animeCache.results[name]);
			animeCache.queries[formattedQuery] = name;
			let link = 'http://hummingbird.me/api/v1/anime/' + name;
			request(link, (err, response, data) => {
				console.log('2');
				let info = JSON.parse(data);
				animeCache.results[name] = info;
				resolve(info);
			});
		});
	});
}

exports.commands = {
	animesearch: 'anime',
	as: 'anime',
	anime: function (target, room, user, connection, cmd) {
		if (!this.runBroadcast()) return;
		if (this.broadcasting && room.id === 'lobby') return this.errorReply("This command cannot be broadcasted in the Lobby.");
		if (!target || !target.trim()) return this.sendReply('/' + cmd + ' [query] - Searches for an anime based on the given search query.');

		searchAnime(target.trim()).then(anime => {
			let genres = anime.genres.map(genre => toId(genre.name));
			if ((genres.indexOf('hentai') > -1 || (genres.indexOf('yaoi') > -1 && anime.title.match(/pico/ig))) && this.broadcasting) {
				this.errorReply('Hentai anime cannot be broadcasted.'); //explicitly detect boku no pico
			} else {
				this.sendReplyBox(viewInfo(anime));
			}
			room.update();
		}).catch(error => {
			this.errorReply(error);
			room.update();
		});
	},
};
