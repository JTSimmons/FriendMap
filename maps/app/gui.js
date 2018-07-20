'use strict'; (function() { FriendMap.gui = new Vue({
	el: '#gui',
	data: {
		sidebarVisible: (window.innerWidth > 1200),
		sidebarToggled: 0,
		mapResizeInterval: null,
		loaded: false,
		searchQuery: '',
		showTowns: true,
		showPoints: true
	},
	computed: {
		playerCountLabel: function() {
			return (this.playerCount === 1 ? '1 player online' : this.playerCount + ' players online');
		},
		searchResultsOpen: function() {
			return (this.searchResults.length > 0);
		},
		searchResults: function() {
			// Return empty results if no search query is given
			if (this.searchQuery.length < 1) {
				return [];
			}
			var escapeHtml = FriendMap.util.escapeHtml;
			var query = this.searchQuery.toLowerCase();
			var results = [];
			var i, index;
			//find result from towns
			if (FriendMap.towns && this.showTowns) {
				for (i = 0; i < FriendMap.towns.length; i++) {
					var town = FriendMap.towns[i];
					var name = escapeHtml(town.name);
					if ((index = name.toLowerCase().indexOf(query)) > -1) {
						results.push({
							type: 'village',
							x: town.x,
							y: town.y,
							label: '<p>' + name + '</p><p class="small">Town</p>'
						});
					}
					if (results.length >= 8) return results;
				}
			}
			// find results from points
			if (FriendMap.points && this.showPoints) {
				for (i = 0; i < FriendMap.points.length; i++) {
					var point = FriendMap.points[i];
					var name = escapeHtml(point.name);
					if ((index = name.toLowerCase().indexOf(query)) > -1) {
						results.push({
							type: 'point',
							x: point.x,
							y: point.y,
							label: '<p>' + name + '</p><p class="small">Point</p>'
						});
					}
					if (results.length >= 8) return results;
				}
			}
			return results;
		}
	},
	watch: {
		// When the sidebar is toggled, update the map
		sidebarVisible: function() {
			this.sidebarToggled = Date.now();
			this.mapResizeInterval = window.setInterval(function() {
				FriendMap.map.map.invalidateSize({debounceMoveend: true});
				if (FriendMap.gui.sidebarToggled < Date.now() - 150) {
					clearInterval(FriendMap.gui.mapResizeInterval);
				}
			}, 10);
		},
		showStructures: function(value) {
        	this._setMapLayer('structureBorders', value);
        },
		showTowns: function(value) {
        	this._setMapLayer('townMarkers', value);
        },
		showPlayers: function(value) {
        	this._setMapLayer('playerMarkers', value);
        },
		showPoints: function(value) {
        	this._setMapLayer('pointMarkers', value);
        },
		showVillages: function(value) {
			this._setMapLayer('villageMarkers', value);
			if (value === false) {
				this._setMapLayer('villageBorders', false);
			} else {
				this._setMapLayer('villageBorders', this.showVillageBorders);
			}
		},
		showVillageBorders: function(value) {
			if (this.showVillages === true) {
				this._setMapLayer('villageBorders', value);
			} else {
				// Don't show the map layer but still save the setting
				FriendMap.util.setConfig('villageBorders', value);
			}
		},
		showTowers: function(value) {
			this._setMapLayer('guardtowerMarkers', value);
			if (value === false) {
				this._setMapLayer('guardtowerBorders', false);
			} else {
				this._setMapLayer('guardtowerBorders', this.showTowerBorders);
			}
		},
		showTowerBorders: function(value) {
			if (this.showTowers === true) {
				this._setMapLayer('guardtowerBorders', value);
			} else {
				// Don't show the map layer but still save the setting
				FriendMap.util.setConfig('guardtowerBorders', value);
			}
		}
	},
	methods: {
		/**
		 * Initialises the GUI. Should be called once when the rest of the
		 * application has been loaded and initialised.
		 */
		init: function() {
			this.showTowns = FriendMap.util.getConfig('townMarkers', true);
			this.showPoints = FriendMap.util.getConfig('pointMarkers', true);
			this.loaded = true;
		},
		/**
		 * Focuses the map on coordinates
		 *
		 * @param {number} x The x coordinate
		 * @param {number} y The y coordinate
		 */
		focusMap: function(x, y) {
			FriendMap.map.map.setView(FriendMap.util.xy(x, y), FriendMap.config.mapMaxZoom - 1);
		},
		/**
		 * Enables or disables a map layer
		 *
		 * @param {string} name The name of the map layer (key in the `FriendMap.map.layers` object)
		 * @param {boolean} value True to enable the layer
		 *
		 * @private
		 */
		_setMapLayer: function(name, value) {
			var layer = FriendMap.map.layers[name];
			// If the layer is already set to the wanted value, then we
			// shouldn't change anything
			if (FriendMap.map.map.hasLayer(layer) == value) { return; }
			// Apply the changes to the map
			if (value === false) {
				FriendMap.map.map.removeLayer(layer);
			} else {
				FriendMap.map.map.addLayer(layer);
			}
			// Persist the user settings in a config cookie
			FriendMap.util.setConfig(name, value);
		}
	}
});
// End IIFE
})();
