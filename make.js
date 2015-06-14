
var _FS       = require('fs');
var _ZEROS    = Array.apply(null, new Array(128)).map(String.prototype.valueOf, '0').join('');
var _ONES     = Array.apply(null, new Array(128)).map(String.prototype.valueOf, '1').join('');


var _get_mask = function(ip, sn, type) {

	var mask = '';

	if (type === 'ipv4') {

		if (ip.length < 4) {
			ip.push.apply(ip, Array.apply(null, new Array(4 - ip.length)).map(Number.prototype.valueOf, 0));
		}


		mask = ip.map(function(val) {
			return (_ZEROS.substr(0, 8) + val.toString(2)).substr(-8);
		}).join('');


		return mask.substr(0, sn);

	} else if (type === 'ipv6') {

		if (ip.length < 8) {
			ip.push.apply(ip, Array.apply(null, new Array(8 - ip.length)).map(Number.prototype.valueOf, 0));
		}


		mask = ip.map(function(val) {
			return (_ZEROS.substr(0, 16) + val.toString(2)).substr(-16);
		}).join('');


		return mask.substr(0, sn);

	}


	return null;

};

var _parse_csv = function(buffer, names) {

	var lines   = buffer.toString().split('\n');
	var headers = lines.shift().split(',');
	var table   = [];


	for (var l = 0, ll = lines.length; l < ll; l++) {

		var object = {};
		var values = lines[l].split(',');
		if (values.length === headers.length) {

			for (var n = 0, nl = names.length; n < nl; n++) {

				var name  = names[n];
				var index = headers.indexOf(name);
				if (index !== -1) {

					var value = values[index];
					if (value.indexOf('"') !== -1) {

						value = value.replace(/"/g, '').trim();

					} else if (value.indexOf('/') === -1) {

						var tmp = parseFloat(value, 10);
						if (!isNaN(tmp)) {
							value = tmp;
						}

					} else if (name === 'network' && value.indexOf('.') !== -1) {

						var ipv4 = value.split('/').shift().split('.').map(function(val) { return parseInt(val, 10); });
						var snv4 = parseInt(value.split('/').pop(), 10);
						if (!isNaN(snv4)) {
							object['mask'] = _get_mask(ipv4, snv4, 'ipv4');
						}

					} else if (name === 'network' && value.indexOf(':') !== -1) {

						var ipv6 = value.split('/').shift().split(':').map(function(val) { return val === '' ? 0 : parseInt(val, 16); });
						var snv6 = parseInt(value.split('/').pop(), 10);
						if (!isNaN(snv6)) {
							object['mask'] = _get_mask(ipv6, snv6, 'ipv6');
						}

					}


					object[name] = value;

				}

			}

		}

		if (Object.keys(object).length > 0) {
			table.push(object);
		}

	}


	return table;

};

var _left_join = function(left, right, id1, id2) {

	id1 = typeof id1 === 'string' ? id1 : '__WOOP__';
	id2 = typeof id2 === 'string' ? id2 : '__WOOP__';


	for (var l = 0, ll = left.length; l < ll; l++) {

		var target = left[l];
		var found  = false;
		var key1   = target[id1] || null;
		var key2   = target[id2] || null;

		if (key1 !== null) {

			delete target[id1];


			for (var r1 = 0, r1l = right.length; r1 < r1l; r1++) {

				var source1 = right[r1];
				if (source1[id1] === key1) {

					for (var name1 in source1) {
						target[name1] = source1[name1];
					}

					found = true;
					break;

				}

			}

		}


		if (key2 !== null && found === false) {

			delete target[id2];


			for (var r2 = 0, r2l = right.length; r2 < r2l; r2++) {

				var source2 = right[r2];
				if (source2[id1] === key2) {

					for (var name2 in source2) {
						target[name2] = source2[name2];
					}

					found = true;
					break;

				}

			}

		}

	}

};



console.log('\n');
console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
console.log('~ GeoIP JSON Generator ~');
console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
console.log('\n');


console.log('\nPARSING DATA ... ');

	var csv_country_ipv4  = _parse_csv(_FS.readFileSync('./raw/country-ipv4.csv'),  [ 'network', 'geoname_id', 'country_geoname_id'                                    ]);
	var csv_country_ipv6  = _parse_csv(_FS.readFileSync('./raw/country-ipv6.csv'),  [ 'network', 'geoname_id', 'country_geoname_id'                                    ]);
	var csv_country_names = _parse_csv(_FS.readFileSync('./raw/country-names.csv'), [ 'geoname_id', 'continent_code', 'continent_name', 'country_code', 'country_name' ]);
	var csv_country_coord = _parse_csv(_FS.readFileSync('./raw/country-coord.csv'), [ 'country_code', 'latitude', 'longitude'                                          ]);


	console.log('> parsed ' + csv_country_ipv4.length + ' IPv4 entries.');
	console.log('> parsed ' + csv_country_ipv6.length + ' IPv6 entries.');

console.log('  DONE.');



console.log('\nCRUNCHING DATA ... ');

	_left_join(csv_country_ipv4, csv_country_names, 'geoname_id',   'country_geoname_id');
	_left_join(csv_country_ipv6, csv_country_names, 'geoname_id',   'country_geoname_id');
	_left_join(csv_country_ipv4, csv_country_coord, 'country_code', 'continent_code');
	_left_join(csv_country_ipv6, csv_country_coord, 'country_code', 'continent_code');

console.log('  DONE.');



console.log('\nFILTERING DATA ... ');

	var ipv4l = csv_country_ipv4.length;
	var ipv6l = csv_country_ipv6.length;


	var buggy_geonames = [];
	var buggy_networks = [];


	csv_country_ipv4 = csv_country_ipv4.filter(function(entry) {

		if (entry.latitude === undefined || entry.longitude === undefined) {

			var geoname = entry.geoname_id || entry.country_geoname_id || '';
			if (geoname !== '' && buggy_geonames.indexOf(entry) === -1) {
				buggy_geonames.push(entry);
			} else if (buggy_networks.indexOf(entry) === -1) {
				buggy_networks.push(entry);
			}


			return false;

		}

		return true;

	});

	csv_country_ipv6 = csv_country_ipv6.filter(function(entry) {

		if (entry.latitude === undefined || entry.longitude === undefined) {

			var geoname = entry.geoname_id || entry.country_geoname_id || '';
			if (geoname !== '' && buggy_geonames.indexOf(entry) === -1) {
				buggy_geonames.push(entry);
			} else if (buggy_networks.indexOf(entry) === -1) {
				buggy_networks.push(entry);
			}


			return false;

		}

		return true;

	});


	if (buggy_networks.length > 0) {

		console.log('\n> WARNING: COULD NOT FIX THE FOLLOWING NETWORK IDS:');
		console.log('\n> ' + buggy_networks.map(function(val) {
			return val.network + ' => ' + val.geoname_id + ' / ' + val.country_geoname_id;
		}).join('\n> ') + '\n');

	}


	if (buggy_geonames.length > 0) {

		console.log('\n> WARNING: COULD NOT FIX THE FOLLOWING GEONAME IDS:');
		console.log('\n> ' + buggy_geonames.map(function(val) {
			return val.geoname_id + ' => ' + val.country_name + ' / ' + val.continent_name;
		}).join('\n> ') + '\n');

	}


	console.log('> filtered ' + (ipv4l - csv_country_ipv4.length) + ' IPv4 entries.');
	console.log('> filtered ' + (ipv6l - csv_country_ipv6.length) + ' IPv6 entries.');

console.log('  DONE.');



console.log('\nMAPPING DATA ... ');

	var data_ipv4 = csv_country_ipv4.map(function(entry, index, self) {

		return {
			network:   entry.network,
			mask:      entry.mask,
			continent: entry.continent_name,
			country:   entry.country_name,
			location:  {
				latitude:  entry.latitude,
				longitude: entry.longitude
			}
		};

	});

	var data_ipv6 = csv_country_ipv6.map(function(entry, index, self) {

		return {
			network:   entry.network,
			mask:      entry.mask,
			continent: entry.continent_name,
			country:   entry.country_name,
			location:  {
				latitude:  entry.latitude,
				longitude: entry.longitude
			}
		};

	});

console.log('  DONE.');



console.log('\nSORTING DATA ... ');

	data_ipv4.sort(function(a, b) {
		if (a.network.length > b.network.length) return -1;
		if (b.network.length > a.network.length) return  1;
		if (a.network        > b.network)        return -1;
		if (b.network        > a.network)        return  1;
		return 0;
	});

	data_ipv6.sort(function(a, b) {
		if (a.network.length > b.network.length) return -1;
		if (b.network.length > a.network.length) return  1;
		if (a.network        > b.network)        return -1;
		if (b.network        > a.network)        return  1;
		return 0;
	});

console.log('  DONE.');



console.log('\nSTORING DATA ... ');

	if (_FS.isDirectory(__dirname + '/database') === false) {
		_FS.mkdirSync(__dirname + '/database');
	}

	_FS.writeFileSync(__dirname + '/database/ipv4.json', JSON.stringify(data_ipv4, null, '\t'));
	_FS.writeFileSync(__dirname + '/database/ipv6.json', JSON.stringify(data_ipv6, null, '\t'));


	console.log('> stored ' + csv_country_ipv4.length + ' IPv4 entries.');
	console.log('> stored ' + csv_country_ipv6.length + ' IPv6 entries.');

console.log('  DONE.');

