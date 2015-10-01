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

    // Set up map
    var mapCenter = [51.4493, -2.5806];
    var map = L.map('map', {
      defaultExtentControl: true,   // Add "Home" button to reset extent
      navIcon3BarControl: true,     // Add "NavIcon(3 bar)" button for menu
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
        "opacity": 0.65
    };

    var leftSidebar = L.control.sidebar('sidebarL', {
        closeButton: true,
        position: 'left',
        autoPan: false
    });
    map.addControl(leftSidebar);    // TODO: Breaks IE8
    
    // Get a copy of the introduction text
    //trailInfo.intro.details = document.getElementById("sidebarL").innerHTML;
    // TODO: different method so this isn't overwritten!
    
    var rightSidebar = L.control.sidebar('sidebarR', {
        closeButton: true,
        position: 'right',
        autoPan: false
    });
    map.addControl(rightSidebar);
    
    // Safe to make sidebar contents visible now without them getting flashed
    // across the display
    document.getElementById("sidebarR").style.display="inline";
    
    showIntro();
    
    // Switch from showing summary in popup to details in left sidebar
    function moreInfo(locationNameStr) {
        trailInfo[locationNameStr]["marker"].closePopup();
        updatesidebarL(locationNameStr);
        leftSidebar.show();
    }

    // Load GeoJSON data (exported from Google as KML & converted to JSON)
    trailLayer = L.geoJson(trailGeoJson, {
        style: trailStyle,
        pointToLayer: function (feature, latlng) {
            var newMarker = L.marker(latlng, {
                icon: greenIcon,
                title: trailInfo[feature.properties.name]["fullname"]
            });  

            // Pass pointer to current marker and its popup
            trailInfo[feature.properties.name]["marker"] = newMarker;

            // Ensure that if we open a popup left sidebar is closed (if open)
            // TODO: addEventListener not supported in IE8
            newMarker.addEventListener('click', function() {leftSidebar.hide();});

            return newMarker;
        },
        onEachFeature: function onEachFeature(feature, layer) {
            var info = trailInfo[feature.properties.name];
            // TBD: only prompt for more info if info-pane content exists
            if (info !== undefined && info !== null) {
                var popupContent = "<strong>" + info.fullname +
                        "</strong><br>" + info.summary +
                        "<br><button type='button' onclick=trail.moreInfo(\"" +
                        feature.properties.name + "\")>More Info</button>";
                layer.bindPopup(popupContent);

                // Pass pointer to current marker and its popup
                //trailInfo["layer"] = layer;
            }
        }
    });
    trailLayer.addTo(map);

    function updatesidebarL(locationID) {
        document.getElementById("info-pane-title").innerHTML =
                trailInfo[locationID]["fullname"];
               
        // Ensure all info pane content is hidden
        var divList = document.getElementById("sidebarL")
                .getElementsByTagName("div");
        for (var i = 0; i < divList.length; i++) {
            divList[i].style.display="none";
        }
        
        // TODO: add link at bottom (how?)
//        var mainLink = trailInfo[locationID]["link"];
//        if (mainLink !== undefined) {
//            infoStr += "<p><a href='" + mainLink + "' target='_blank'>" +
//                    "(Further location info on main website)</a></p>";
//        }
        //document.getElementById("sidebarL").innerHTML = infoStr;
 
        document.getElementById(locationID + "-info").style.display="inline"; 
    }

    // TODO: need to reload intro text into left sidebar
    function showIntro() {
        rightSidebar.hide();
        document.getElementById("info-pane-title").innerHTML = "";
        document.getElementById("intro-info").style.display="inline";
        // TODO: need to hide any other info pane divs
        leftSidebar.show();
    };

    function selectLocation(locationID) {
        // TODO: this isn't the right place to be hiding R sidebar
        if (document.getElementById("auto-hide-checkbox").checked) {
            rightSidebar.hide();
        }
        updatesidebarL(locationID);
        trailInfo[locationID].marker.openPopup();
    }

    // Add buttons to Right Sidebar
    document.getElementById("intro-button").onclick=showIntro;
    var sidebarButtonsContainer = document.getElementById("sidebarButtons");

    for (var locationID in trailInfo) {
        var btnText = document.createTextNode(trailInfo[locationID]["fullname"]);
        var btn = document.createElement("button");
        // btn.className = "site-button";  // TODO: to Add styling information
        btn.onclick=(function(){            // TODO: overly complex?
            var _loc = locationID;
            return function() { selectLocation(_loc); };
        })();
        btn.appendChild(btnText);           
        var buttonPara = document.createElement("p");
        buttonPara.appendChild(btn);
        sidebarButtonsContainer.appendChild(buttonPara);
    }
    
    // TODO: show-site-labels checkbox drives map labelling
       
    function shiftLeftToRightSidebar() {
        leftSidebar.hide();
        rightSidebar.show();
    }

    // Publicly-visible functions
    return {
        moreInfo: moreInfo,
        shiftLeftToRightSidebar: shiftLeftToRightSidebar
    };

}());