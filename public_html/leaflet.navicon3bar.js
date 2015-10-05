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

(function () {
  /* global L */
  /* global trail */
  'use strict';
  L.Control.NavIcon3Bar = L.Control.extend({
    options: {
      position: 'topright',
      text: 'Nav Icon',
      title: 'Open Navigation Sidebar',
      className: 'leaflet-control-navicon3bar'
    },
    onAdd: function (map) {
      this._map = map;
      return this._initLayout();
    },
    _initLayout: function () {
      var container = L.DomUtil.create('div', 'leaflet-bar ' +
        this.options.className);
      this._container = container;
      this._navIconButton = this._createNavIconButton(container);

      L.DomEvent.disableClickPropagation(container);

      return this._container;
    },
    _createNavIconButton: function () {
      var link = L.DomUtil.create('a', this.options.className + '-toggle',
        this._container);
      link.href = '#';
      link.innerHTML = this.options.text;
      link.title = this.options.title;

      L.DomEvent
        .on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
        .on(link, 'click', L.DomEvent.stop)
        .on(link, 'click', this._navEvent, this);
      return link;
    },
    _navEvent: function () {
        // TODO: need to hide this control when menu is open (or stop sliding),
        //       or make it change to a menu hide icon (say '>
        // TODO: nasty fn call. Too tightly coupled as well
        trail.openSiteMenu();
    }
  });

  L.Map.addInitHook(function () {
    if (this.options.navIcon3BarControl) {
      this.addControl(new L.Control.NavIcon3Bar());
    }
  });

  L.control.navIcon3Bar = function (options) {
    return new L.Control.NavIcon3Bar(options);
  };

  return L.Control.NavIcon3Bar;

}());
