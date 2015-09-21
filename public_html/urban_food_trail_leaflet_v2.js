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

/* global L */
/* global trail_data */

// Set up map
var mapCenter = [51.4493, -2.5806];
var map = L.map('map', {
  defaultExtentControl: true,   // Add "Home" button to reset extent
  locateMeControl: true,        // Add "Locate Me" button to pan to location
  center: mapCenter,
  zoom: 16
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>' +
        'contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' +
        'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'richardthomas.2e651224',
    accessToken: 'pk.eyJ1IjoicmljaGFyZHRob21hcyIsImEiOiIxYWMwNTMyMjMzYzRlNWU0NWY4ODYyNDQzYWVkMjQzNSJ9.VAF-W-QsoepmXOZyvoXzxw'
}).addTo(map);

// Create a custom icon (the Leaflet green leaf)
var greenIcon = L.icon({
    iconUrl: 'leaf-green.png',
    shadowUrl: 'leaf-shadow.png',
    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

// Load GeoJSON data (exported from Google as KML & converted to JSON, hacked to JSON-P)
trail_layer = L.geoJson(trail_data, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: greenIcon});
    },
    onEachFeature: function onEachFeature(feature, layer) {
        var popupContent = "<strong>" + feature.properties.name +
                "</strong><br>" + feature.properties.description +
                "<br><button type='button' onclick=leftSidebar.show()>" +
                "More Info</button>";
        layer.bindPopup(popupContent);
    }
});

trail_layer.addTo(map);

var leftSidebar = L.control.sidebar('sidebarL', {
    closeButton: true,
    position: 'left',
    autoPan: false
});
map.addControl(leftSidebar);
leftSidebar.show();

var rightSidebar = L.control.sidebar('sidebarR', {
    closeButton: true,
    position: 'right',
    autoPan: false
});
map.addControl(rightSidebar);
