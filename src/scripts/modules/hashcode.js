/*
 * Hashcode.js 1.0.2
 * https://github.com/stuartbannerman/hashcode
 *
 * Copyright 2013 Stuart Bannerman (me@stuartbannerman.com)
 * Released under the MIT license
 *
 * Date: 07-04-2013
 *
 * packaged as npm module by
 * A. Siebert, ask@touchableheroes.com
 *
 * usage:
 * ------------------------------------
 * var encode = require( 'hashcode' ).hashCode;
 * var hash = encode().value( "my string value" );
 */
// Hashes a string
var hash = function (string) {
  var string = string.toString(),
    hash = 0,
    i;
  for (i = 0; i < string.length; i++) {
    hash = ((hash << 5) - hash + string.charCodeAt(i)) & 0xffffffff;
  }

  return hash;
};
// Deep hashes an object
var object = function (obj) {
  var result = 0;
  for (var property in obj) {
    if (obj.hasOwnProperty(property)) {
      result += hash(property + value(obj[property]));
    }
  }

  return result;
};
// Does a type check on the passed in value and calls the appropriate hash method
var value = (module.exports.value = function (value) {
  var types = {
    string: hash,
    number: hash,
    boolean: hash,
    object: object,
    // functions are excluded because they are not representative of the state of an object
    // types 'undefined' or 'null' will have a hash of 0
  };
  var type = typeof value;

  return Math.abs(
    value != null && types[type] ? types[type](value) + hash(type) : 0
  );
});
