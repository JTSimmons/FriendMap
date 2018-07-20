'use strict'; (function() {
	// Prepare arrays for loaded data
	FriendMap.config = null;
	FriendMap.points = null;
	FriendMap.towns = null;
	FriendMap.url = 'http://friendmap.chickenkiller.com';
	// Keep track of whether or not the window is focused and active
	var windowIsFocused = true;
	window.onblur = function(){ windowIsFocused = false; }
	window.onfocus = function(){ windowIsFocused = true; }
	function setRealtimeTimer() {
		var time = 30000;
		// If the window is not focused, use 60s refresh timeout instead of 30s
		if (!windowIsFocused) {
			time = 60000;
		}
		FriendMap.realtimeTimer = setTimeout(function() {
			// TODO update points here
			// Add points
			FriendMap.map.addPoints();
		}, time);
	}
	// Prepare promises to load data
	var promises = [
		FriendMap.util.fetchData('config', 'config.json'),
		FriendMap.util.fetchDataOnline('points', 'Point'),
		FriendMap.util.fetchDataOnline('towns', 'Town')
	];
	if (document.body.getAttribute('data-realtime') === 'true') {
		promises.push(fetchData('players', 'players.php'));
	}
	// Start loading
	Promise.all(promises) .catch(function(err) {
		console.error('Could not load data');
		console.error(err);
		document.write('Something went wrong, map data could not be loaded'); // TODO add better error handling
	})
	.then(function() {
		// Add computed config values
		FriendMap.config.xyMulitiplier = (FriendMap.config.actualMapSize / FriendMap.config.mapTileSize);
		// Create the map
		FriendMap.map.createMap();
		// Add points
		FriendMap.map.addPoints();
		// Initialise the GUI
		FriendMap.gui.init();
		// Set interval to refresh realtime data
		if (FriendMap.config.realTime) {
			setRealtimeTimer();
		}
	});
	// End IIFE
})();
