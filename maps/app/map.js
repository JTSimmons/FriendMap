'use strict'; FriendMap.map = {
	layers: {},
	/**
	 * Initialises and creates the map interface
	 */
	createMap: function() {
		var config = FriendMap.config;
		var xy = FriendMap.util.xy;
		var localxy = FriendMap.util.localxy;
		var escapeHtml = FriendMap.util.escapeHtml;
		// Set up the map
		var map = FriendMap.map.map = L.map('map', {
			maxBounds: [xy(0,0), xy(config.actualMapSize,config.actualMapSize)],
			maxBoundsViscosity: 1.0,
			maxZoom: config.mapMaxZoom,
			minZoom: config.mapMinZoom,
			crs: L.CRS.Simple,
			zoomControl: false,
			attributionControl: false
		});
		FriendMap.map.layers.townMarkers = L.layerGroup();
		FriendMap.map.layers.pointMarkers = L.layerGroup();
		new L.Control.Zoom({position: 'bottomright'}).addTo(map);
		var mapBounds = new L.LatLngBounds(
			map.unproject([0, config.maxMapSize], config.mapMaxZoom),
			map.unproject([config.maxMapSize, 0], config.mapMaxZoom));
		map.fitBounds(mapBounds);
        map.setZoom(Math.ceil((config.mapMinZoom + config.mapMaxZoom) / 2) - 1);
		var wurmMapLayer = L.tileLayer('http://wurm-map.gamecoma.ru/images/{x}-{y}.png', {
			tileSize: config.mapTileSize,
			maxNativeZoom: config.nativeZoom,
			minNativeZoom: config.nativeZoom,
			minZoom: config.mapMinZoom,
			maxZoom: config.mapMaxZoom,
			maxBounds: mapBounds,
			maxBoundsViscosity: 1.0,
			inertia: false,
			noWrap: true,
			tms: false
		}).addTo(map);
		// Add coordinates display
		L.control.coordinates({
			position:"bottomleft",
			labelFormatterLng : function(e){
				if (e < 0) {
					e = ((180 + e) + 180);
				}
				return Math.floor(e * config.xyMulitiplier) + ' x,';
			},
			labelFormatterLat : function(e){
				return Math.floor((-e) * config.xyMulitiplier) + ' y';
			}
		}).addTo(map);
		//add event handle for right click that send coordinates to popup
		map.on('contextmenu',function(e) {
			var tlatlng=e.latlng;
			var test = localxy(e.latlng);
			/* making a popup*/
			var tpopup = L.popup()
			.setLatLng(e.latlng)
			.setContent('<br> New Marker <br>' + 'Name <br><input type="text" id="Name" value="name"><br>' + '<br><select name="Type"> <option value="Town">Town</option><option value="Point">Point</option></select><br>' +
		    '<br/><button type="button" class="editPoint" dataX = "' + test.x + '" dataY = "' + test.y + '" dataName = "' + name.value + '" ' + '>Click to Add</button>')
			.openOn(map);
		});
		//handle for popup from right click. Calls function to add new point
		map.on('popupopen', function() {
			var clickEvent = document.getElementsByClassName("editPoint")[0];
			if (clickEvent !== undefined){
				clickEvent.addEventListener("click",function(e){
					var name = document.getElementById("Name").value;
					var type = document.getElementsByName("Type")[0].value;
					var x = document.getElementsByClassName("editPoint")[0].attributes[2].value;
					var y = document.getElementsByClassName("editPoint")[0].attributes[3].value;
					FriendMap.map.addPoint(type, name, parseInt(x), parseInt(y));
					map.closePopup();
				},false);
			}
		});
	},
	/**
	 * Initialises and creates the point data
	 */
	addPoints: function() {
		var map = FriendMap.map.map;
		var config = FriendMap.config;
		var xy = FriendMap.util.xy;
		var localxy = FriendMap.util.localxy;
		var escapeHtml = FriendMap.util.escapeHtml;
		// Create layer groups;
		FriendMap.map.layers.townMarkers.remove();
		FriendMap.map.layers.pointMarkers.remove();
		var townMarkers = L.layerGroup();
		var pointMarkers = L.layerGroup();
		// Add towns
		if (FriendMap.towns){
			for (var i = 0; i < FriendMap.towns.length; i++) {
				var town = FriendMap.towns[i];
				var marker = L.marker(xy(town.x, town.y),
					{icon: FriendMap.markers.getMarker('town')}
				);
				marker.on('contextmenu',function(e) {
					/* making a popup*/
					var tpopup = L.popup()
					.setLatLng(e.latlng)
					.setContent('<br> New Marker <br>' + 'Name <br><input type="text" id="Name" value="' + town.name + '"><br>' + '<br><select name="Type"> <option value="Town">Town</option><option value="Point">Point</option></select><br>'+
					'<br/><button type="button" class="editPoint" dataX = "' + town.x + '" dataY = "' + town.y + '" dataName = "' + name.value + '" ' + '>Click to Add</button>')
					.openOn(map);
				});
				marker.bindPopup([
					'<div align="center"><b>' + escapeHtml(town.name) + '</b>',
					'<i>Town</i></div>'
					].join('<br>'));
				townMarkers.addLayer(marker);
			}
		}
        // Add points
		if (FriendMap.points){
			for (var i = 0; i < FriendMap.points.length; i++) {
				var point = FriendMap.points[i];
				var marker = L.marker(xy(point.x, point.y),
					{icon: FriendMap.markers.getMarker('point')}
				);
				marker.bindPopup([
					'<div align="center"><b>' + escapeHtml(point.name) + '</b>',
					'<i>Point</i></div>'
					].join('<br>'));
				pointMarkers.addLayer(marker);
			}
		}
		FriendMap.map.layers.townMarkers = townMarkers;
		FriendMap.map.layers.pointMarkers = pointMarkers;
		// Add layers to map
		FriendMap.map.layers.townMarkers.addTo(map);
		FriendMap.map.layers.townMarkers.addTo(map);
	},
	/**
	 * Add point to DB then re update data type from DB
	 */
	addPoint: function(type, name, x, y) {
		var getData = FriendMap.util.fetchDataOnline;
		fetch(FriendMap.url + '/setData/?type=' + type + '&x=' + x + '&y=' + y + '&name=' + name)
		.then(function() {
			var promises = [
				getData('towns', 'Town')
			];
			 Promise.all(promises) .catch(function(err) {
				console.error('Could not load data');
				console.error(err);
				document.write('Something went wrong, map data could not be loaded'); // TODO add better error handling
			})
			.then(function() {
				FriendMap.map.addPoints();
			});
		});
	},
	/**
	 * Opens the popup for a map marker
	 * @param {L.marker} marker The marker
	 */
	openMarker: function(marker) {
		marker.openPopup();
	}
};
