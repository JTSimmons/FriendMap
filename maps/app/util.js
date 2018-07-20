'use strict'; FriendMap.util = {
	/**
	 * Function to convert integer x y coordinates to LatLng coordinates on map
	 */
	yx: L.latLng,
	xy: function(x, y) {
		return FriendMap.util.yx(-(y / FriendMap.config.xyMulitiplier), (x / FriendMap.config.xyMulitiplier));
	},
	/**
	 * Function to convert LatLng coordinates from map to integer x y coordinates
	 */
	localxy : function(latLng) {
		var y = -(latLng.lat * FriendMap.config.xyMulitiplier);
		var x = latLng.lng * FriendMap.config.xyMulitiplier;
		return {
        x: x,
        y: y
		};
    },
	/**
	 * Function to update point data from DB
	 */
	fetchDataOnline : function(key, type) {
	return fetch(FriendMap.url + '/getData/?type=' + type)
		.then(function(response) { return response.json() })
		.then(function(responseData) {
			FriendMap[key] = responseData[type];
			return Promise.resolve();
		});
	},
	/**
	 * Function to get data from local JSON file
	 */
	fetchData : function(key, path) {
	return fetch('data/' + path)
		.then(function(response) { return response.json() })
		.then(function(responseData) {
			FriendMap[key] = responseData[key];
			return Promise.resolve();
		});
	},
	/**
	 * Replaces HTML open & close tags with their corresponding entities, to avoid HTML code injection through names
	 * @param {string} unescaped The unescaped string
	 * @returns {string} The escaped string
	 */
	escapeHtml: function(unescaped) {
		if (typeof unescaped !== 'string') { return unescaped; }
		return unescaped.replace(/(<)/g, '&lt;').replace(/(>)/g, '&gt');
	},
	/**
	 * Gets a boolean value from a settings cookie
	 * @param {string} key The key of the setting
	 * @param {boolean} defaultValue Value to return if there is no setting of this name
	 *
	 * @returns {boolean} The boolean value associated with the cookie
	 */
	getConfig: function(key, defaultValue) {
		var val = Cookies.get('wmg_setting_' + key);
		if (val === undefined) { return defaultValue; }
		return (val === 'true'); // Cookies are stored as strings
	},
	/**
	 * Sets a settings cookie with a boolean value
	 * @param {string} key The key of the setting
	 * @param {boolean} value The value to set the cookie to
	 */
	setConfig: function(key, value) {
		Cookies.set('wmg_setting_' + key, value, {expires: Infinity});
	}
};
