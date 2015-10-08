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

var trail = (function () {
    /* global L */
    /* global trailGeoJson */
    /* global trailInfo */

    /*
     * ---- Basemap and custom controls
     */
    
    // Boundary of full trail
    // (specifically the coordinates of the furthest apart points on trail)
    var trailBounds = [[51.4486598, -2.5899263], [51.4493936, -2.5805962]];
    
    var map = L.map('map', {
        navIcon3BarControl: true,     // Add "NavIcon(3 bar)" button for menu
        locateMeControl: true        // Add "Locate Me" button to pan to location
    }).fitBounds(trailBounds);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>' +
            'contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' +
            'Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'richardthomas.2e651224',
        accessToken: 'pk.eyJ1IjoicmljaGFyZHRob21hcyIsImEiOiIxYWMwNTMyMjMzYzRlNWU0NWY4ODYyNDQzYWVkMjQzNSJ9.VAF-W-QsoepmXOZyvoXzxw'
    }).addTo(map);
    L.control.scale().addTo(map);

    // Add "Home" button to reset to the initial extent (i.e. the full trail)
    L.control.defaultExtent().addTo(map);
    
/*
 * ---- Left Sidebar (Intro/Site Information Pane) ----
 */
    var leftSidebar = L.control.sidebar('sidebarL', {
        closeButton: true,
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

    // Now able to show startup splash screen (before markers and right sidebar
    // are set up)
    showIntro();

    function showSiteDetails(locationID) {
        hideInfoPaneContent();

        // Set Info pane heading
        infoPaneTitleEl.innerHTML = trailInfo[locationID].fullname;

        // Show details specific to this site
        document.getElementById(locationID + "-info").style.display="inline";
        
        // TODO: add link at bottom (how?)
        //       better to do in original HTML? (as done for 1st site)
//        var mainLink = trailInfo[locationID]["link"];
//        if (mainLink !== undefined) {
//            infoStr += "<p><a href='" + mainLink + "' target='_blank'>" +
//                    "(Further location info on main website)</a></p>";
//        }
        //document.getElementById("sidebarL").innerHTML = infoStr;
    }

    // Delay initial showing of intro text to work around some CSS quirks
    // with 'sidebar' plugin
//    setTimeout(function () {
//        showIntro();
//    }, 500);

/*
 * ---- Right Sidebar (Site selector) ----
 */ 
    var rightSidebar = L.control.sidebar('sidebarR', {
        closeButton: true,
        position: 'right',
        autoPan: false
    });
    map.addControl(rightSidebar);

    // Allow auto-hiding of right info pane on new map popup
    rightSidebar.hideOnAuto = function() {
        if (document.getElementById("auto-hide-site-selector").checked) {
            rightSidebar.hide();
        }
    };

    // Safe to make sidebar contents visible now without them getting flashed
    // across the display
    document.getElementById("sidebarR").style.display="inline";

    /**
     * Callback function for all buttons in site selection menu
     * 
     * @param {type} ev     button event
     */
    function selectLocation(ev) {
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
        // btn.className = "site-button";  // TODO: to Add styling information
        btn.onclick=selectLocation;
        btn.appendChild(btnText);
        var buttonPara = document.createElement("p");
        buttonPara.appendChild(btn);
        sidebarButtonsContainer.appendChild(buttonPara);
    }

/*
 * ---- Map Markers ----
 */

    // TODO: why doesn't this ** generate fn documentation in NetBeans?
    /**
     * Move location of a circle marker (create it first if not present)
     */
    map.setCircleMarker = (function() {
        var _siteMarker = null;

        var selectSite = function(latLng) {
            if (_siteMarker) {
                _siteMarker.setLatLng(latLng);
            } else {
                _siteMarker = L.circleMarker(latLng, {
                    fillOpacity: 0.1,
                    color: 'red',
                    weight: 2,
                    radius: 30,
                    clickable: false
                });
                _siteMarker.addTo(map);
            }
        };
        return selectSite;
    })();

    // Create a custom icon (the Leaflet green leaf)
    var greenIcon = L.icon({
        iconUrl: 'img/leaf-green.png',
        shadowUrl: 'img/leaf-shadow.png',
        iconSize:     [38, 95], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    // Style for recommended walking route (polyline vector)
    var trailStyle = {
        "color": "#008000",
        "dashArray": "5, 5",
        "weight": 3,
        "opacity": 0.65,
        "title": "Recommended walking route"
    };

    // Create site markers (and walking trail route) from GeoJSON data
    // (which was exported from Google as KML & converted to JSON)
    var markerLayer = L.geoJson(trailGeoJson, {

        // Style for recommended walking route (polyline vector)
        style: trailStyle,

        // Add markers for each site location
        pointToLayer: function (feature, latlng) {
            var siteName = feature.properties.name;
            var siteLatLng = latlng;
            // TODO: Handle case if siteInfo not defined
            var siteInfo = trailInfo[siteName];
            var newMarker = L.marker(latlng, {
                icon: greenIcon,
                title: siteInfo.fullname
            });

            // Export pointer to current marker to allow site list generation
            // later (but not in the random order from the GeoJSON data)
            siteInfo.marker = newMarker;

            // Handle other map objects when a popup opens
            // TODO: addEventListener() not supported in IE8
            var sitePopupOpen = function(site) {
                leftSidebar.hideOnAuto();
                rightSidebar.hideOnAuto();
                map.setCircleMarker(siteLatLng);
                showSiteDetails(site);
            };
            newMarker.addEventListener('popupopen', function() {
                sitePopupOpen(siteName);
            });

            // TODO: only prompt for more info if info-pane content exists
            if (true) {
                var popupContent = "<strong>" + siteInfo.fullname +
                        "</strong><br>" + siteInfo.summary +
                        "<br><button type='button'" +
                        " onclick='trail.moreInfo();')>" +
                        "More Info</button>";
                newMarker.bindPopup(popupContent);
            }

            return newMarker;
        }
    });
    markerLayer.addTo(map);

/*
 * ---- Callbacks for non-site-specific buttons
 */
    /**
     * Open right sidebar to show selector for garden sites
     */
    function openSiteMenu() {
        leftSidebar.hideOnAuto();
        rightSidebar.show();
    }
    // TODO: could I override map.navicon3Bar._navmenu() here so not having to
    // make the function public? Something like...
    //map.navIcon3Bar._navEvent = openSiteMenu;
    //map.navIcon3Bar.setNavEvent(openSiteMenu);
    
    /**
     * Switch from showing summary in popup to details in infopane left sidebar
     * 
     * @param {String} locationNameStr garden location as a string
     */ 
    function moreInfo(locationNameStr) {
        map.closePopup();
        leftSidebar.show();
    }

    // Publicly visible functions
    return {
        moreInfo: moreInfo,
        openSiteMenu: openSiteMenu
    };

}());