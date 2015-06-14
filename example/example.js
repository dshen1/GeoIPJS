
// Change this path to 'geoip' if installed via NPM
var geoip = require('../index.js');

// This will create binary strings for direct comparison with subnet masks in correct network-byte order
var mask4 = geoip.mask('1.3.3.7', 'ipv4');
var mask6 = geoip.mask('2a02:8071:a8d:4800:8c71:e281:23d9:ff93', 'ipv6');

var geo4  = geoip.lookup('1.3.3.7', 'ipv4');
var geo6  = geoip.lookup('2a02:8071:a8d:4800:8c71:e281:23d9:ff93', 'ipv6');


console.log(geo4);
console.log(geo6);

console.log(mask4);
console.log(mask6);

