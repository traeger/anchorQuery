anchorQuery
===========

anchorQuery is a simple way to remember complex states in the url using anchors.

In the following anchorQuery is used to remember the current map position and zoom-level in the url.
If no position and zoomlevel is stored in the url, it is panned to `(52.4834, 13.4066)`.

```
var map = new google.maps.Map(...)

$(function() {
  anchorQuery.google.maps.init(map, function() { // declare to use anchorQuery pan and zoom for this map
    map.panTo(new google.maps.LatLng(52.4834, 13.4066)) // default location
  })
  anchorQuery.load() // load all informations from the anchortag of the url
})
```

## Productive Examples

* http://doenervote.de/. http://doenervote.de/#aQ.gmFocus/52.48207036976735/13.433930559411/20 pans to one of the best Kebab's in Berlin.
* http://www.gerabo.de/. http://www.gerabo.de/de/lounge uses anchorQuery to store the scroll position and various filter options for a better user experience when using the 'back'-button on subsites.

For further informations check out other artifical [examples](example).
