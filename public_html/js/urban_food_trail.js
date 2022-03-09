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
 * @fileoverview Top level JS code for rendering the trail interactive map.
 *
 * @author https://github.com/richard-thomas
 */

// Suppress "undeclared" warnings for external globals in NetBeans IDE
/* global L */
/* global trailGeoJson */
/* global trailInfo */

/*
 * ---- Basemap and custom controls ----
 */
var trail = (function () {

    // Boundary of full trail
    // (specifically the coordinates of the furthest apart points on trail)
    var trailBounds = [[51.4486598, -2.6009005], [51.4493936, -2.5805962]];

    var map = L.map('map', {
        locateMeControl: true   // Add "Locate Me" button to pan to location
    }).fitBounds(trailBounds);
    var streetLayer = L.tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
        attribution: '&copy; <a href="http://openstreetmap.org/copyright">' +
                'OpenStreetMap contributors</a>' +
                ' &copy; <a href="http://mapbox.com/map-feedback/">Mapbox</a>',
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoicmljaGFyZHRob21hcyIsImEiOiJjbDBrNHl5NXMwM3cxM21xbjFqMzVhem1qIn0.0YdvjS234F7msVY8DwzT1g'
    }).addTo(map);
    var satelliteLayer = L.tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>' +
            'contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' +
            'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: 'mapbox/satellite-streets-v11',
        accessToken: 'pk.eyJ1IjoicmljaGFyZHRob21hcyIsImEiOiJjbDBrNHl5NXMwM3cxM21xbjFqMzVhem1qIn0.0YdvjS234F7msVY8DwzT1g'
    });
    var baseMaps = {
        "Map": streetLayer,
        "Satellite": satelliteLayer
    };

    // Add Layer switcher control (Map/Satellite selector).
    // Start with it expanded to show "Map/Satellite" to make it obvious.
    // This will collapse to a simple layers icon on first map click or hover.
    L.control.layers(baseMaps).addTo(map)._expand();

    // Add scale bar
    L.control.scale().addTo(map);

    // Add "Home" button to reset to the initial extent (i.e. the full trail)
    L.control.defaultExtent().addTo(map);

    // Publicly visible methods and properties
    return {
        map: map
    };
}());


/*
 * ---- Left Sidebar (Introduction/Site Information Pane) ----
 */
trail.leftSidebar = (function () {
    var _map = trail.map;

    var _sidebar = L.control.sidebar('sidebarL', {
        position: 'left',
        autoPan: false
    });
    _map.addControl(_sidebar);

    // Add menu button to re-open introduction (via left sidebar)
    L.control.button({
        position: 'topleft',
        text: 'Intro',
        title: 'View Introduction',
        className: 'leaflet-button-intro',
        callback: showIntro
    }).addTo(_map);

    // Get various pointers to DOM elements of this sidebar
    var leftSidebarEl = _sidebar.getContainer();
    var infoPaneTitleEl = document.getElementById("info-pane-title");
    var infoPaneDivs = leftSidebarEl.getElementsByTagName("div");
    var siteSpecificLinkEl = document.getElementById("site-specific-link");
    var siteLinkEl = document.getElementById("site-link");

    /**
     * Hide sidebar if visible & "auto-hide" box (in other sidebar) is ticked
     */
    function hideOnAuto() {
        if (_sidebar.isVisible() &&
                document.getElementById("auto-hide-info-pane").checked) {
            _sidebar.hide();
        }
    }

    /**
     * Ensure all info pane content is hidden
     */
    function hideInfoPaneContent() {
        for (var i = 0; i < infoPaneDivs.length; i++) {
            infoPaneDivs[i].style.display="none";
        }
    }

    /**
     * Hide any other content and make "Introduction" content visible
     */
    function showIntro() {
        infoPaneTitleEl.innerHTML = "";
        hideInfoPaneContent();
        document.getElementById("intro-info").style.display="inline";
        _sidebar.show();
    }

    // Now able to show intro... as a startup splash screen
    // (doesn't require markers or right sidebar to be set up yet)
    showIntro();

    // Create callback for "GET STARTED" button
    var getStartedEl = document.getElementById("get-started-button");
    getStartedEl.onclick = function() {
        _sidebar.hide();
    };

    /**
     * Update sidebar content to that relevant to selected growing site
     * @param {string} locationID growing site identifier used in trailInfo
     */
    function showSiteDetails(locationID) {
        hideInfoPaneContent();

        // Set Info pane heading
        infoPaneTitleEl.innerHTML = trailInfo[locationID].fullname;

        // Get site-specific details element (if it exists in DOM)
        var siteDetailsDomEl = document.getElementById(locationID + "-info");

        // Show details specific to this site
        if (siteDetailsDomEl) {
            siteDetailsDomEl.style.display="inline";
        }

        // Display link to site-specific trail page (if it exists)
        var siteLink = trailInfo[locationID].link;
        if (siteLink) {
            siteLinkEl.href =
                    "http://ediblebristol.org.uk/urban-food-growing-trail-a-bristol-2015-project/" +
                    siteLink;
            siteSpecificLinkEl.style.display="inline";
        }
    }

    /**
     * Wrapper function required as show() references private sidebar methods
     */
    function show() {
        _sidebar.show();
    }

    // Publicly visible methods and properties
    return {
        hideOnAuto: hideOnAuto,
        show: show,
        showSiteDetails: showSiteDetails
    };
}());


/*
 * ---- Right Sidebar (Site selector) ----
 */
trail.rightSidebar = (function () {
    var _map = trail.map;

    // Add menu button to select site (via right sidebar)
    L.control.button({
        position: 'topright',
        text: 'Nav Icon',
        title: 'Select growing site',
        className: 'leaflet-button-sitelist',
        callback: toggleSiteMenu
    }).addTo(_map);

    var _sidebar = L.control.sidebar('sidebarR', {
        position: 'right',
        autoPan: false
    });
    _map.addControl(_sidebar);

    /**
     * Hide sidebar if visible and "auto-hide" box (in this sidebar) is ticked
     */
    function hideOnAuto() {
        if (_sidebar.isVisible() &&
                document.getElementById("auto-hide-site-selector").checked) {
            _sidebar.hide();
        }
    }

    /**
     * Open/Close right sidebar to show selector for garden sites
     */
    function toggleSiteMenu() {
        if (_sidebar.isVisible()) {
            _sidebar.hide();
        } else {
            trail.leftSidebar.hideOnAuto();
            _sidebar.show();
        }
    }

    // Safe to make sidebar contents visible now without them getting flashed
    // across the display
    document.getElementById("sidebarR").style.display="inline";

    /**
     * Callback function for all buttons in site selection menu
     *
     * @param {type} ev     button event
     */
    function selectLocation(ev) {
        _map.closePopup();
        var target = null;
        // Support IE6-8 which lacks event "target"
        try {
            target = ev.target;
        } catch(e) {
            target = event.srcElement;
        }
        var locId = target.getAttribute('data-loc-id');
        trailInfo[locId].marker.openPopup();
    }

    // Add buttons to Right Sidebar
    var sidebarButtonsContainer = document.getElementById("sidebarButtons");
    for (var locationID in trailInfo) {
        var btnText = document.createTextNode(trailInfo[locationID].fullname);
        var btn = document.createElement("button");
        btn.setAttribute('data-loc-id', locationID);
        btn.className = "site-button";
        btn.onclick=selectLocation;
        btn.appendChild(btnText);
        var buttonPara = document.createElement("p");
        buttonPara.appendChild(btn);
        sidebarButtonsContainer.appendChild(buttonPara);
    }

    // Publicly visible methods and properties
    return {
        hideOnAuto: hideOnAuto
    };
}());


/*
 * ---- Map Markers ----
 */
(function () {
    var _map = trail.map;

    // Circle marker object indicating selected garden
    var _siteCircleMarker = null;

    /**
     * Move location of a circle marker (create it first if not present)
     * @param {latlng} latLng New centre of circle
     */
    function setCircleMarker(latLng) {
        if (_siteCircleMarker) {
            _siteCircleMarker.setLatLng(latLng);
        } else {
            _siteCircleMarker = L.circleMarker(latLng, {
                fillOpacity: 0.1,
                color: 'red',
                weight: 2,
                radius: 30,
                clickable: false
            });
            _siteCircleMarker.addTo(_map);
        }
    }

    // Create custom icon for garden markers (the Leaflet green leaf)
    var greenIcon = L.icon({
        iconUrl: 'img/leaf-green-wide.png',
        shadowUrl: 'img/leaf-shadow.png',
        iconSize:     [67, 67], // size of the icon
        shadowSize:   [35, 40], // size of the shadow
        iconAnchor:   [41, 43], // point of icon which corresponds to marker location
        shadowAnchor: [3, 39],  // the same for the shadow
        popupAnchor:  [-1, -38] // point from which popup opens relative to iconAnchor
    });

    // Style for recommended walking route (polyline vector)
    var trailStyle = {
        "color": "#008000",
        "dashArray": "5, 5",
        "weight": 3,
        "opacity": 0.65,
        "title": "Recommended walking route"
    };

    // Popup sizing: Pad from window edge and limit max width so popup doesn't
    // hide under buttons. Subtract extra width (40) to take account of MaxWidth
    // being of text, but margins added in popup. Allow for larger buttons on
    // retina displays too.
    var paddingL = 45;
    var paddingR = 60;
    var winWidth = window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
    var popupMaxWidth = winWidth - paddingL -paddingR - 40;
    popupMaxWidth = (popupMaxWidth > 300) ? 300 : popupMaxWidth;

    // Create site markers (and walking trail route) from GeoJSON data
    // (which was exported from Google as KML & converted to JSON)
    var markerLayer = L.geoJson(trailGeoJson, {

        // Style for recommended walking route (polyline vector)
        style: trailStyle,

        // Add markers for each site location
        pointToLayer: function (feature, latlng) {
            var siteName = feature.properties.name;
            var siteLatLng = latlng;
            var siteInfo = trailInfo[siteName];
            var newMarker = L.marker(latlng, {
                icon: greenIcon,
                title: siteInfo.fullname
            });

            // Export pointer to current marker to allow site list generation
            // later (but not in the random order from the GeoJSON data)
            siteInfo.marker = newMarker;

            // Handle other map objects when a popup opens
            function sitePopupOpen(site) {
                trail.leftSidebar.hideOnAuto();
                trail.rightSidebar.hideOnAuto();
                setCircleMarker(siteLatLng);
                trail.leftSidebar.showSiteDetails(site);
            }
            newMarker.addEventListener('popupopen', function() {
                sitePopupOpen(siteName);
            });

            // Try to get site-specific details to see if they exist in DOM
            var siteDetailsDomEl = document.getElementById(siteName + "-info");

            var popupContent = "<strong>" + siteInfo.fullname +
                    "</strong><br>" + siteInfo.summary;

            // Only prompt for more info if info-pane content exists
            if (siteDetailsDomEl) {
                popupContent += "<div class='more-info-div'>" +
                        "<button type='button' onclick='trail.moreInfo();')>" +
                        "More Information</button></div>";
            }

            newMarker.bindPopup(popupContent, {
                autoPanPaddingTopLeft: L.point(paddingL, 5),
                autoPanPaddingBottomRight: L.point(paddingR, 75),
                maxWidth: popupMaxWidth
            });

            return newMarker;
        }
    });
    markerLayer.addTo(_map);

    // Publicly visible methods and properties
    // (none
}());


/**
 * Switch from showing summary in popup to details in infopane left sidebar
 * (Click callback from Pop-up "More Information" buttons)
 */
trail.moreInfo = function() {
    trail.map.closePopup();
    trail.leftSidebar.show();
    trail.rightSidebar.hideOnAuto();
};

// Auto-hide sidebars if map is clicked other than on markers
trail.map.on('click', function() {
    trail.rightSidebar.hideOnAuto();
    trail.leftSidebar.hideOnAuto();
});