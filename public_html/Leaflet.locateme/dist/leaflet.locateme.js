
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(["leaflet"], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('leaflet'));
  } else {
    root.L.Control.LocateMe = factory(root.L);
  }
}(this, function(L) {

return (function () {
  /* global L */
  'use strict';
  L.Control.LocateMe = L.Control.extend({
    options: {
      position: 'topleft',
      text: 'Locate Me',
      title: 'Pan to current location',
      className: 'leaflet-control-locateme'
    },
    onAdd: function (map) {
      this._map = map;
      return this._initLayout();
    },
    _initLayout: function () {
        this._meMarkerExists = false;
        var container = L.DomUtil.create('div', 'leaflet-bar ' +
                this.options.className);
        this._container = container;
        this._locateMeButton = this._createLocateButton(container);

        L.DomEvent.disableClickPropagation(container);

        this._map.whenReady(this._whenReady, this);

        return this._container;
    },
    _createLocateButton: function () {
        var link = L.DomUtil.create('a', this.options.className + '-toggle',
                this._container);
        link.href = '#';
        link.innerHTML = this.options.text;
        link.title = this.options.title;

        L.DomEvent
            .on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', this._panToMe, this);
        return link;
    },
    
    // On event "location found", add a marker and a circle showing accuracy + pop-up
    _onLocationFound: function (e) {
        var radius = e.accuracy / 2;
        
        // Save location for if locator icon is pressed
        this._myLatlng = e.latlng;

        // On first successful geolocation, create marker and accuracy circle
        if (this._meMarkerExists === false) {
            // FIXME: "this" is not locate_me when fn called!
            this._meMarker = L.marker(e.latlng).addTo(this._map)
                .bindPopup("You are within " + radius + " metres of this point");
            this._meCircle = L.circle(e.latlng, radius).addTo(this._map);
            this._meMarkerExists = true;
        } else {
            this._meMarker.setLatLng(e.latlng).update;
            this._meMarker.setPopupContent("You have moved to within " + radius + " metres of this point");
            this._meCircle.setLatLng(e.latlng);
            this._meCircle.setRadius(radius);
        }
    },
    
    // Show an error message if the geolocation failed
    _onLocationError: function (e) {
        alert(e.message);
    },
    _whenReady: function () {
        
        this._map.on('locationfound', this._onLocationFound, this);
        this._map.on('locationerror', this._onLocationError);

        // Turn on device location detection
        this._map.locate({
            enableHighAccuracy: true,   // Use GPS if available
            watch: true,        // Continuous watching of location
            maximumAge: 5000    // milliseconds within which a cached location used
            });
        
        return this;
    },
    _panToMe: function () {
        if (typeof this._myLatlng !== 'undefined') {
            this._map.setView(this._myLatlng);
        }
    }
  });

  L.Map.addInitHook(function () {
    if (this.options.locateMeControl) {
      this.addControl(new L.Control.LocateMe());
    }
  });

  L.control.locateMe = function (options) {
    return new L.Control.LocateMe(options);
  };

  return L.Control.LocateMe;

}());
;

}));
