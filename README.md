
# GeoIPJS (0.0.1)

This project has the goal to ease up working with
GeoIP data and doesn't require any kind of internet
connection to work.

It uses an offline cache based on the GeoLite2 data
offered by MaxMind, Inc.

As this datasets get to big data problems pretty easy,
this repository only ships Country-based GeoIP data.

You can migrate to the City-Block GeoIP data, too.
Just make sure you use the same CSV headers as the CSV
files in the `./raw` folder do.


This repository also contains several fixes that are
necessary to do on the raw dataset, such as support
for Oceanian islands or countries that were not traced
via geoname id already.


## 1. Generation of JSON database

If you modified the CSV files, you can create a new
JSON database via the make file:

```bash
cd ./geoipjs;
nodejs ./make.js;
```


## 2. Installation

This package has absolutely no dependencies and doesn't need to
be compiled against any library. It is standalone, but therefore
caching all entries in local memory for faster access.

```bash
npm install geoipjs;
```


## 3. API Usage

This example shows the API of GeoIPJS. If any IP can not be traced;
due to either using unregistered subnets or a private IP, the API
will return the `Bermuda Triangle` as the location.

If you don't want that gimmick, you can simply check for the
returned `continent` property, which has then the value `Anonymous`.


```javascript

var geoip = require('geoipjs');


// This will create binary strings for direct comparison with subnet masks in correct network-byte order
var mask4 = geoip.mask('1.3.3.7', 'ipv4');
var mask6 = geoip.mask('2a02:8071:a8d:4800:8c71:e281:23d9:ff93', 'ipv6');
var geo4  = geoip.lookup('1.3.3.7', 'ipv4');
var geo6  = geoip.lookup('2a02:8071:a8d:4800:8c71:e281:23d9:ff93', 'ipv6');


console.log(mask4);

// 00000001000000110000001100000111



console.log(mask6);

// 00101010000000101000000001110001000010101000110101001000000000001000110001110001111000101000000100100011110110011111111110010011



console.log(geo4);

/*
 * {
 *   network:   '1.3.0.0/16',
 *   mask:      '0000000100000011',
 *   continent: 'Asia',
 *   country:   'China',
 *   location:  { latitude: 35, longitude: 105 }
 * }
 */



console.log(geo6);

/*
 * {
 *   network:   '2a02:8071:a8c::/47',
 *   mask:      '00101010000000101000000001110001000010101000110',
 *   continent: 'Europe',
 *   country:   'Germany',
 *   location:  { latitude: 51, longitude: 9 }
 * }
 */
```


# License

GeoIPJS is (c) 2015 LazerUnicorns and released under MIT license.
The database from MaxMind, Inc. is released and used via [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

Take a look at the [LICENSE.txt](./LICENSE.txt) file.
