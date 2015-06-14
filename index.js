
var _FS    = require('fs');
var _ZEROS = Array.apply(null, new Array(96)).map(String.prototype.valueOf, '0').join('');
var _IPv4  = JSON.parse(_FS.readFileSync(__dirname + '/database/ipv4.json'));
var _IPv6  = JSON.parse(_FS.readFileSync(__dirname + '/database/ipv6.json'));


var _BERMUDA = {
	network:   null,
	mask:      null,
	country:   "Bermuda Triangle",
	continent: "Anonymous",
	location:  {
		latitude:   25,
		longitude: -71
	}
};



(function(global) {

	/*
	 * HELPERS
	 */

	var _get_mask = function(ip, type) {

		var mask = '';

		if (type === 'ipv4') {

			if (ip.length < 4) {
				ip.push.apply(ip, Array.apply(null, new Array(4 - ip.length)).map(Number.prototype.valueOf, 0));
			}


			mask = ip.map(function(val) {
				return (_ZEROS.substr(0, 8) + val.toString(2)).substr(-8);
			}).join('');


			return mask;

		} else if (type === 'ipv6') {

			if (ip.length < 8) {
				ip.push.apply(ip, Array.apply(null, new Array(8 - ip.length)).map(Number.prototype.valueOf, 0));
			}


			mask = ip.map(function(val) {
				return (_ZEROS.substr(0, 16) + val.toString(2)).substr(-16);
			}).join('');


			return mask;

		}


		return null;

	};

	var _lookup = function(ip, type) {

		var found = _BERMUDA;

		var i, il, item;

		if (type === 'ipv4') {

			for (i = 0, il = _IPv4.length; i < il; i++) {

				item = _IPv4[i];

				if (ip.substr(0, item.mask.length) === item.mask) {
					found = item;
					break;
				}

			}

		} else if (type === 'ipv6') {

			for (i = 0, il = _IPv6.length; i < il; i++) {

				item = _IPv6[i];

				if (ip.substr(0, item.mask.length) === item.mask) {
					found = item;
					break;
				}

			}

		}


		return found;

	};



	/*
	 * IMPLEMENTATION
	 */

	module.exports = Module = {

		mask: function(ip, type) {

			ip = typeof ip === 'string' ? ip : '';


			if (type === 'ipv4') {

				var ipv4 = ip.split('/').shift().split('.').map(function(val) { return parseInt(val, 10); });
				if (ipv4.length > 0) {
					return _get_mask(ipv4, 'ipv4');
				}

			} else if (type === 'ipv6') {

				var ipv6 = ip.split('/').shift().split(':').map(function(val) { return val === '' ? 0 : parseInt(val, 16); });
				if (ipv6.length > 0) {
					return _get_mask(ipv6, 'ipv6');
				}

			}


			return null;

		},

		lookup: function(ip, type) {

			ip = typeof ip === 'string' ? ip : '';


			if (type === 'ipv4') {

				var ipv4 = ip.split('/').shift().split('.').map(function(val) { return parseInt(val, 10); });
				if (ipv4.length > 0) {

					var snv4 = _get_mask(ipv4, 'ipv4');
					if (snv4 !== null) {
						return _lookup(snv4, 'ipv4');
					}

				}

			} else if (type === 'ipv6') {

				var ipv6 = ip.split('/').shift().split(':').map(function(val) { return val === '' ? 0 : parseInt(val, 16); });
				if (ipv6.length > 0) {

					var snv6 = _get_mask(ipv6, 'ipv6');
					if (snv6 !== null) {
						return _lookup(snv6, 'ipv6');
					}

				}

			}


			return _BERMUDA;

		}

	};

})(this);

