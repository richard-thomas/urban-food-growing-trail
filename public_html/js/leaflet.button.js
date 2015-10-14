/* 
 * Copyright 2015 Richard Thomas
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Artistic License 2.0 as published by the
 * Open Source Initiative (http://opensource.org/licenses/Artistic-2.0)
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

/*
 * Create generic Leaflet button with a callback function on clicking
 */
(function () {
    /* global L */
    'use strict';
    L.Control.Button = L.Control.extend({
        options: {
            position: 'topright',
            text: 'Icon Alt Text',
            title: '(Hover description)',
            className: 'class-for-css-image-selection',
            callback: function() {}
        },
        onAdd: function (map) {
            this._map = map;
            var container = L.DomUtil.create('div', 'leaflet-bar ' +
                    this.options.className);
            this._container = container;
            var link = L.DomUtil.create('a', this.options.className,
                    this._container);
            link.href = '#';
            link.innerHTML = this.options.text;
            link.title = this.options.title;

            L.DomEvent
                .on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
                .on(link, 'click', L.DomEvent.stop)
                .on(link, 'click', this.options.callback, this);
            L.DomEvent.disableClickPropagation(container);

            return this._container;
        }
    });

    // Function to create new instance of "class"
    L.control.button = function (options) {
        return new L.Control.Button(options);
    };
}());
