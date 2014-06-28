/*
 *
 * Licensed under The MIT License (MIT)
 * https://github.com/traeger/anchorQuery
 * Copyright (c) 2014 Marco Träger <marco.traeger at googlemail.com>
 *
 */

new function() { // helper scope
  if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
      return this.substring(0, str.length) === str;
    };
  }
}

var anchorQuery = function(name, callback) { var lib = anchorQuery._lib
  lib.bindQuery(name, callback)
  
  return function() {
    var args = []
    /* we have to convert the function argument to an array
     * to be able to use array helper functions later on */
    for(var i = 0, len = arguments.length; i < len; ++i) {
      args[i] = arguments[i]
    }
    
    lib.setAnchor([name].concat(args))
    lib.callCallback(callback, args)
  }
}

anchorQuery._lib = new function() { var lib = this
  lib._init = function() {
    lib._prefix = 'aQ.'
    lib._callbacks = {}
    lib._debugEnabled = false
  }
  
  lib._onload = function() {
    lib._refreshWithAnchor()
  }
  
  lib._refreshWithAnchor = function() {
    var anchorData = lib.getAnchor()
    lib.log(anchorData)
    if(anchorData) {
      var args = anchorData
      var name = args.shift()
      var callback = lib._callbacks[name]
      if(!callback) {
        lib.log('triggered query "' + name + '" not found')
        return
      }
      lib.callCallback(callback, args)
    }
  }
  
  lib.log = function(msg) {
    if(lib._debugEnabled) {
      console.log('[anchorQuery] ' +  msg)
    }
  }

  lib.bindQuery = function(name, query) {
    lib.log('binding: ' + name)
    lib._callbacks[name] = query
  }
  
  lib.callCallback = function(callback, args) {
    callback.apply(lib, args)
  }

  lib.setAnchor = function(array) {
    var saveValues = array.map(encodeURIComponent)
    /* we use / to delimited the entries.
     * this is a valid encoding as stated in http://www.w3.org/Addressing/rfc1630.txt
     */
    var uriHash = saveValues.join('/')
    var uriHashPrefixed = lib._prefix + uriHash
    location.hash = uriHashPrefixed
  }
  
  lib.getAnchor = function() {
    var uriHashPrefixed = location.hash.replace('#','');
    if(!uriHashPrefixed.startsWith(lib._prefix))
      return false
    var uriHash = uriHashPrefixed.substring(lib._prefix.length)
    var saveValues = uriHash.split('/')
    var array = saveValues.map(decodeURIComponent)
    return array
  }
  
  /* init */
  lib._init()
  
  /* onload hooks */
  if(jQuery) { // jQuery is supported
    jQuery(lib._onload)
  } else {
    if(typeof(window.onload) == 'function') {
      var f = window.onload
      window.onload = function() {
        f()
        lib._onload()
      }
    } else {
      window.onload = lib._onload()
    }
    
    window.onload
  }
  
  /* interface */
  anchorQuery.debug = function(enableDebug) {
    lib._debugEnabled = enableDebug
  }
}