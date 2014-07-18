/*
 *
 * Licensed under The MIT License (MIT)  (see http://opensource.org/licenses/MIT)
 * https://github.com/traeger/anchorQuery
 * Copyright (c) 2014 Marco Träger <marco.traeger at googlemail.com>
 *
 */

new function() { /* scope */
  if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
      return this.substring(0, str.length) === str;
    };
  }
}

var anchorQuery = function(name, callback) { var lib = anchorQuery._lib
  /* interface */
  
  lib.bindQuery(name, callback)
  
  return function() { // query
    var args = []
    /* we have to convert the function argument to an array
     * to be able to use array helper functions later on */
    for(var i = 0, len = arguments.length; i < len; ++i) {
      args[i] = arguments[i]
    }
    
    lib.setAnchor([name].concat(args))
    return new function() { // run of the parameterized query
      this.run = function() {
        lib.callCallback(callback, args)
      }
    }
  }
}

anchorQuery._lib = new function() { var lib = this
  lib._init = function() {
    lib._prefix = 'aQ.'
    lib._callbacks = {}
    lib._debugEnabled = false
    lib._onLoadHandler = []
    lib._onInitHandler = []
    lib._defaultCallbacks = []
  }
  
  lib._load = function() {
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
    } else {
      for(var i = 0, len = lib._defaultCallbacks.length; i < len; ++i) {
        lib.callCallback(lib._defaultCallbacks[i])
      }
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
  
  /* interface */
  anchorQuery.debug = function(enableDebug) {
    /* enable/disable debug */
    lib._debugEnabled = enableDebug
  }
  anchorQuery.defaultCallback = function(callback) {
    lib._defaultCallbacks.push(callback)
  }
  anchorQuery.load = lib._load
}

/* google.maps plugin */
anchorQuery.google = new function() {}
anchorQuery.google.maps = new function() { var lib = this;
  lib.init = function(map, initDefaultFocus) {
    if(!!initDefaultFocus) {
      anchorQuery.defaultCallback(initDefaultFocus)
    }
    
    lib._map = map
    
    lib.setFocus = anchorQuery('gmFocus', function(lat, lng, zoom) {
      lib._map.panTo(new google.maps.LatLng(lat, lng))
      lib._map.setZoom(parseInt(zoom))
    })
    
    lib._onchange = function() {
      var center = lib._map.getCenter()
      var zoom = lib._map.getZoom()
      
      lib.setFocus(center.lat(), center.lng(), zoom)
    }
    
    google.maps.event.addListener(lib._map, 'center_changed', lib._onchange)
    google.maps.event.addListener(lib._map, 'zoom_changed', lib._onchange)
  }
}
