//extend jQuery with function to get QueryStrig
$.extend({
  requestParameters: function () {
    var vars = [], hash, hashes;
    hashes = window.location.href.slice(window.location.href.indexOf('?') + 1);
    if (hashes.indexOf('#') >= 0) hashes = hashes.slice(0, hashes.indexOf('#'));
    hashes = hashes.split('&');

    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(decodeURIComponent(hash[0]));
      vars[hash[0]] = decodeURIComponent(hash[1]);
    }
    return vars;
  }
  //,requestParameters: function (name) {
  //  return $.requestParameters()[name];
  //}
});

//Parse QueryStrig and offer it as a global variable
var QueryString = function () {
	// This function is anonymous, is executed immediately and 
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
			// If second entry with this name create array with values
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [query_string[pair[0]], pair[1]];
			query_string[pair[0]] = arr;
			// If third or later entry with this name push value to array
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
}();

//TODO: choose one (jQuery extension or global variable), currently prefering variable

//ToDo: make jQuery Extension or better use durandal
//dynamically load css or js files
var _filesadded = []; //list of files already added
function _loadAppFile(filename, filetype) {
  var fileref;
  if (filetype === "js") { //if filename is a external JavaScript file
    fileref = document.createElement('script');
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("src", filename);
  }
  else if (filetype === "css") { //if filename is an external CSS file
    fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
  }
  if (typeof fileref !== "undefined")
    document.getElementsByTagName("head")[0].appendChild(fileref);
}
function loadAppFile(filename, filetype) {
  if (_filesadded.indexOf(filename) === -1) {
    _loadAppFile(filename, filetype);
    _filesadded.push(filename); //List of files already added
  }
  //else
  //  alert("file already added!")
}


//Create a Guid (TODO: choose one)
function newGuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}
function newUuid() { // (from Breese.js)
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		//noinspection NonShortCircuitBooleanExpressionJS
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}


// string functions (from Breese.js)

function stringStartsWith(str, prefix) {
	// returns false for empty strings too
	if ((!str) || !prefix) return false;
	return str.indexOf(prefix, 0) === 0;
}

function stringEndsWith(str, suffix) {
	// returns false for empty strings too
	if ((!str) || !suffix) return false;
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

// Based on fragment from Dean Edwards' Base 2 library
// format("a %1 and a %2", "cat", "dog") -> "a cat and a dog"
function formatString(string) {
	var args = arguments;
	var pattern = RegExp("%([1-" + (arguments.length - 1) + "])", "g");
	return string.replace(pattern, function (match, index) {
		return args[index];
	});
}

// end of string functions

// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
function uncurry(f) {
	var call = Function.call;
	return function () {
		return call.apply(f, arguments);
	};
}

// is functions (from Breese.js)

function __classof(o) {
	if (o === null) {
		return "null";
	}
	if (o === undefined) {
		return "undefined";
	}
	return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
}

var hasOwnProperty = uncurry(Object.prototype.hasOwnProperty);  //hasOwnProperty(obj, key)

function isDate(o) {
	return __classof(o) === "date" && !isNaN(o.getTime());
}

function isFunction(o) {
	return __classof(o) === "function";
}

function isGuid(value) {
	return (typeof value === "string") && /[a-fA-F\d]{8}-(?:[a-fA-F\d]{4}-){3}[a-fA-F\d]{12}/.test(value);
}

function isDuration(value) {
	return (typeof value === "string") && /^(-|)?P[T]?[\d\.,\-]+[YMDTHS]/.test(value);
}

function isEmpty(obj) {
	if (obj === null || obj === undefined) {
		return true;
	}
	for (var key in obj) {
		if (hasOwnProperty(obj, key)) {
			return false;
		}
	}
	return true;
}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

//mav (for consistency)
function isArray(item) {
	return Array.isArray(item);
}

function isString(value) {
	return (typeof value === "string")
}

// end of is Functions

