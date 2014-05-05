//extend jQuery with function to query Parameterstring
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

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}


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