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

var trail = (function () {
    /* global L */
    /* global trailInfo */

    /*
     * ---- Basemap and custom controls ----
     */
    
    // Boundary of full trail
    // (specifically the coordinates of the furthest apart points on trail)
    var trailBounds = [[51.4486598, -2.6009005], [51.4493936, -2.5805962]];

    var map = L.map('map', {
        locateMeControl: true   // Add "Locate Me" button to pan to location
    }).fitBounds(trailBounds);
    var streetLayer = L.tileLayer(
        'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    {
        attribution: '&copy; <a href="http://openstreetmap.org/copyright">' +
                'OpenStreetMap contributors</a>' +
                ' &copy; <a href="http://mapbox.com/map-feedback/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoicmljaGFyZHRob21hcyIsImEiOiJjaWZ1c2ZtZGUwMjA1dDZtN2t6amZ4cnRkIn0.2fVjrwFijZV-R6scDpeUQA'
    }).addTo(map);
    var satelliteLayer = L.tileLayer(
        'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>' +
            'contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' +
            'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets-satellite',
        accessToken: 'pk.eyJ1IjoicmljaGFyZHRob21hcyIsImEiOiJjaWZ1c2ZtZGUwMjA1dDZtN2t6amZ4cnRkIn0.2fVjrwFijZV-R6scDpeUQA'
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
    
/*
 * ---- Left Sidebar (Intro/Site Information Pane) ----
 */
    var leftSidebar = L.control.sidebar('sidebarL', {
        closeButton: false,
        position: 'left',
        autoPan: false
    });
    map.addControl(leftSidebar);    // TODO: Breaks IE8

    // Allow auto-hiding of left info pane on new map popup
    leftSidebar.hideOnAuto = function() {
        if (document.getElementById("auto-hide-info-pane").checked) {
            leftSidebar.hide();
        }
    };

    var leftSidebarEl = leftSidebar.getContainer();
    var infoPaneTitleEl = document.getElementById("info-pane-title");
    var infoPaneDivs = leftSidebarEl.getElementsByTagName("div");
    var siteSpecificLinkEl = document.getElementById("site-specific-link");
    var siteLinkEl = document.getElementById("site-link");
    
    // TODO: make this just an icon that gets loaded conditional on @media
    // for screens where full width is used for info bar / site selector
    //leftSidebarEl.getElementsByTagName("a").innerHTML = 'Go to map';

    // Ensure all info pane content is hidden
    function hideInfoPaneContent() {
        for (var i = 0; i < infoPaneDivs.length; i++) {
            infoPaneDivs[i].style.display="none";
        }        
    }
    
    function showIntro() {
        infoPaneTitleEl.innerHTML = "";
        hideInfoPaneContent();
        document.getElementById("intro-info").style.display="inline";
        leftSidebar.show();
    }

    // Home made sidebar closer (mainly for mobile devices)
    showMapEl = document.getElementById("go-to-map-icon-l");
    showMapEl.onclick=function() {
        leftSidebar.hide();
    };
    
    // Create callback popup for contact details (at end of  Intro)
    // Attempt to avoid email address being web-scraped..
    contactEl = document.getElementById("contact-details");
    contactDomEl = document.getElementById("contact-domain");
    var showingEmail = false;
    contactEl.onclick=function() {
        if (showingEmail) {
            contactEl.innerHTML = 'Richard Thomas'; 
            contactDomEl.innerHTML = '';
        } else {
            contactEl.innerHTML = 'Richard.Thomas';
            contactDomEl.innerHTML = '@yahoo.co.uk<br>';
        }
        showingEmail = !showingEmail;
    };
    
    // Now able to show startup splash screen (before markers and right sidebar
    // are set up)
    showIntro();

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

/*
 * ---- Right Sidebar (Site selector) ----
 */   
    // Add menu button to select site (via right sidebar)
    var siteSelButton = L.control.button({
        position: 'topright',
        text: 'Nav Icon',
        title: 'Select growing site',
        className: 'leaflet-button-sitelist',
        callback: toggleSiteMenu
    }).addTo(map);

    var rightSidebar = L.control.sidebar('sidebarR', {
        closeButton: false,
        position: 'right',
        autoPan: false
    });
    map.addControl(rightSidebar);
   
    // Auto-hide sidebar if map is clicked (anywhere)
    map.on('click', function() {
        rightSidebar.hideOnAuto();
    });

    // Hide sidebar if visible and auto-hide box checked
    rightSidebar.hideOnAuto = function() {
        if (rightSidebar.isVisible() &&
                document.getElementById("auto-hide-site-selector").checked) {
            rightSidebar.hide();
        }
    };

    // Home made sidebar closer (mainly for mobile devices)
    showMapEl = document.getElementById("go-to-map-icon-r");
    showMapEl.onclick=function() {
        rightSidebar.hide();
    };
    
    /**
     * Open/Close right sidebar to show selector for garden sites
     */
    function toggleSiteMenu() {
        if (rightSidebar.isVisible()) {
            rightSidebar.hide();
        } else {
            leftSidebar.hideOnAuto();
            rightSidebar.show();
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
        map.closePopup();
        var locId = ev.target.getAttribute('data-loc-id');
        trailInfo[locId].marker.openPopup();
    }

    // Add buttons to Right Sidebar
    document.getElementById("intro-button").onclick=function() {
        rightSidebar.hide();
        showIntro();
    };
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

/*
 * ---- Callbacks for non-site-specific buttons
 */

    /**
     * Switch from showing summary in popup to details in infopane left sidebar
     * 
     * @param {String} locationNameStr garden location as a string
     */ 
    function moreInfo(locationNameStr) {
        map.closePopup();
        leftSidebar.show();
        rightSidebar.hideOnAuto();
    }

    // Publicly visible functions
    return {
        map: map,
        leftSidebarHideOnAuto: leftSidebar.hideOnAuto,
        rightSidebarHideOnAuto: rightSidebar.hideOnAuto,
        showSiteDetails: showSiteDetails,
        moreInfo: moreInfo
    };

}());

/*
 * ---- Map Markers ----
 */
trail.markers = (function (map) {
    /* global L */
    /* global trailGeoJson */
    /* global trailInfo */

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
            _siteCircleMarker.addTo(map);
        }
    }

    // Create custom icon for garden markers (the Leaflet green leaf)
    var greenIcon = L.icon({
        iconUrl: 'img/leaf-green.png',
        shadowUrl: 'img/leaf-shadow.png',
        iconSize:     [19, 48], // size of the icon
        shadowSize:   [25, 32], // size of the shadow
        iconAnchor:   [11, 47], // point of icon which corresponds to marker location
        shadowAnchor: [2, 31],  // the same for the shadow
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
            var sitePopupOpen = function(site) {
                trail.leftSidebarHideOnAuto();
                trail.rightSidebarHideOnAuto();
                setCircleMarker(siteLatLng);
                trail.showSiteDetails(site);
            };
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
    markerLayer.addTo(map);
    
    // Publicly visible functions (none)

}(trail.map));
