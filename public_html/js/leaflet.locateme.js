/*
 * Copyright (C) 2015 Richard Thomas
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Artistic License 2.0 as published by the
 * Open Source Initiative (http://opensource.org/licenses/Artistic-2.0)
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

/**
 * @fileoverview Leaflet plugin of minimal code to produce a locator marker
 * plus an associated button for panning to currently detected location.
 *
 * @author https://github.com/richard-thomas
 */

(function () {
  /* global L */
  'use strict';
  L.Control.LocateMe = L.Control.extend({
    options: {
      position: 'topleft',
      text: 'Locate Me!',
      title: 'Pan to current location',
      className: 'leaflet-control-locateme'
    },
    onAdd: function (map) {
      this._map = map;
      return this._initLayout();
    },
    _initLayout: function () {
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
    
    // On event "location found", add a marker and a circle showing accuracy
    _onLocationFound: function (e) {
        var radius = Math.floor(e.accuracy / 2);
        
        // Save location for panning if locator icon is later pressed
        this._myLatlng = e.latlng;

        // Update marker (if it exists).
        if (this._meMarker) {
            this._meMarker.setLatLng(e.latlng).update();
            this._meCircle.setLatLng(e.latlng);
            this._meCircle.setRadius(radius);
            
        // First successful geolocation, create marker and accuracy circle
        } else {
            this._meMarker = L.marker(e.latlng, {
                clickable: false,
                title: "Current Location"
            }).addTo(this._map);
            this._meCircle = L.circle(e.latlng, radius, {
                clickable: false
            }).addTo(this._map);
        }
    },
    
    // Show raw error message if geolocation fails
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
            maximumAge: 5000    // milliseconds persistence for cached location
            });
        
        return this;
    },
    _panToMe: function () {
        if (typeof this._myLatlng !== 'undefined') {
            this._map.setView(this._myLatlng);
        }
    }
  });

  // Automatically load if "locateMeControl: true" included in map options
  L.Map.addInitHook(function () {
    if (this.options.locateMeControl) {
      this.addControl(new L.Control.LocateMe());
    }
  });

}());
