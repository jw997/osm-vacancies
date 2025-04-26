import { getJson } from "./utils_helper.js";

// touch or mouse?
let mql = window.matchMedia("(pointer: fine)");
const pointerFine = mql.matches;

// set default chart font color to black
Chart.defaults.color = '#000';
Chart.defaults.font.size = 14;


const checkShop = document.querySelector('#checkShop');
const checkAmenity = document.querySelector('#checkAmenity');

const checkDisusedShop = document.querySelector('#checkDisusedShop');
const checkDisusedAmenity = document.querySelector('#checkDisusedAmenity');

const checkOtherAmenity = document.querySelector('#checkOtherAmenity');


const summary = document.querySelector('#summary');

const saveanchor = document.getElementById('saveanchor')

function getIcon(name) {
	const icon = new L.Icon({
		//	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/' + name,
		iconUrl: './images/' + name,
		//	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		shadowUrl: './images/marker-shadow.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowSize: [41, 41]
	});
	return icon;

}

const greenIcon = getIcon('marker-highway-green.png');
const redIcon = getIcon('marker-highway-red.png');
const orangeIcon = getIcon('marker-highway-orange.png');
const yellowIcon = getIcon('marker-highway-yellow.png');
const goldIcon = getIcon('marker-highway-brown.png');
const blueIcon = getIcon('marker-highway-blue.png');
const violetIcon = getIcon('marker-icon-violet.png');



const w3_highway_brown = '#633517';
const w3_highway_red = '#a6001a';
const w3_highway_orange = '#e06000';
const w3_highway_schoolbus = '#ee9600';
const w3_highway_yellow = '#ffab00';
const w3_highway_green = '#004d33';
const w3_highway_blue = '#00477e';

const violet = "#9400d3";//"#EE82EE";

const black = "#000000";

const grey = "#101010";


function getOptionsForSeverity(sev) {
	var colorValue;
	var rad = 3;
	var opa = 0.5;

	switch (sev) {
		case 'Fatal':
			colorValue = w3_highway_red;
			rad = 3;
			opa = 1;
			break;
		case "Serious Injury":
			colorValue = w3_highway_orange;
			rad = 3;
			opa = 1;
			break;
		case "Minor Injury":
			colorValue = w3_highway_brown;
			opa = 1;
			break;
		case "Possible Injury":
			colorValue = w3_highway_yellow;
			break;
		case "No Injury":
			colorValue = w3_highway_blue;
			break;
		case "Unspecified Injury":
			colorValue = violet;
			break;
		default:
			console.error("Unexpected Injury severity ", sev);
	}
	if (!pointerFine) {
		rad *= 1.5;
	}
	const retval = {
		color: colorValue,
		radius: rad,
		fill: true,
		fillOpacity: opa
	};
	return retval;

}



// todo make a severity class with the icons and text wrapped together
function getIconForSeverity(sev) {
	var icon;
	switch (sev) {
		case 'Fatal':
			icon = redIcon;
			break;
		case "Serious Injury":
			icon = orangeIcon;
			break;
		case "Minor Injury":
			icon = goldIcon;
			break;
		case "Possible Injury":
			icon = yellowIcon;
			break;
		case "No Injury":
			icon = blueIcon;
			break;
		case "Unspecified Injury":
			icon = violetIcon;
			break;
		default:
			console.error("Unexpected Injury severity ", sev);
	}
	return icon;
}

function getIconForStop(Result_of_Stop) {
	var icon;
	switch (Result_of_Stop) {
		case 3:
			icon = redIcon; // warning
			break;
		case 2:
			icon = orangeIcon;  // warning
			break;

		default:
			icon = violetIcon; // field interview / other??
			console.error("Unexpected stop results ", Result_of_Stop);
	}
	return icon;
}

async function getCityBoundary() {
	const file = './data/cityboundary/Land_Boundary.geojson';
	const cityGeoJson = await getJson(file);
	return cityGeoJson;
}

const cityGeoJson = await getCityBoundary();


async function getDowntown() {
	const file = './data/downtown.geojson';
	const cityGeoJson = await getJson(file);
	return cityGeoJson;
}

const downtownGeoJson = await getDowntown();

// make a turf polygon for the downtown busines district so we can clip points to it

var point1 = turf.point([-73.988214, 40.749128]);
var downtownTurfPolygon = turf.polygon(downtownGeoJson.features[0].geometry.coordinates);
var inside = turf.booleanPointInPolygon(point1, downtownTurfPolygon);


/*
async function getShopData() {
	const file = './data/shops.json';
	const retval = await getJson(file);
	return retval;
}


//const shopJson = await getShopData();

async function getVacantData() {
	const file = './data/vacantshops.json';
	const retval = await getJson(file);
	return retval;
}

//const vacantJson = await getVacantData();


async function getOsmShopData() {
	const file = './data/osm_shop_data.json';
	const retval = await getJson(file);
	return retval;
}

*/
//const osmShopJson = await getOsmShopData();


async function getOsmGeoJsonData() {
	const file = './data/osm.geojson';
	const retval = await getJson(file);
	return retval;
}


const osmGeoJson = await getOsmGeoJsonData();

//console.log("Read ", osmShopJson.elements.length);

const popupFields = [
	'name',
	'addr:housenumber',
	'addr:street',
	'amenity',
	'shop',
	'building',
	'office',
	'disused:amenity',

];
function nodePopup(tags) {


	var msg = "";


	for (const k of popupFields) {
		const v = tags[k];
		if (v) {
			msg += (k + ': ' + v + '<br>');
		}
	}
	return msg;
}

var map;

function createMap() {
	// Where you want to render the map.
	var element = document.getElementById('osm-map');
	// Height has to be set. You can do this in CSS too.
	//element.style = 'height:100vh;';
	// Create Leaflet map on map element.
	map = L.map(element, {
		preferCanvas: true
	});
	// Add OSM tile layer to the Leaflet map.
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	// Target's GPS coordinates.
	var target = L.latLng('37.87', '-122.27'); // berkeley 37°52′18″N 122°16′22″W
	// Set map's center to target with zoom 14.
	map.setView(target, 14);
	// add geojson precincts to map
}


/*
const greenIcon = getIcon('marker-highway-green.png');
const redIcon = getIcon('marker-highway-red.png');
const orangeIcon = getIcon('marker-highway-orange.png');
const yellowIcon = getIcon('marker-highway-yellow.png');
const goldIcon = getIcon('marker-highway-brown.png');
const blueIcon = getIcon('marker-highway-blue.png');
const violetIcon = getIcon('marker-icon-violet.png');

	case 'Fatal':
			icon = redIcon;
			break;
		case "Serious Injury":
			icon = orangeIcon;
			break;
		case "Minor Injury":
			icon = goldIcon;
			break;
		case "Possible Injury":
			icon = yellowIcon;
			break;
		case "No Injury":
			icon = blueIcon;
			break;
		case "Unspecified Injury":
			icon = violetIcon;
			break;

*/

/*
{
				label: "Circle",
				type: "circle",
				radius: 6,
				color: "blue",
				fillColor: "#FF0000",
				fillOpacity: 0.6,
				weight: 2,
				layers: [marker],
				inactive: true,
			}


			const greenIcon = getIcon('marker-highway-green.png');
const redIcon = getIcon('marker-highway-red.png');
const orangeIcon = getIcon('marker-highway-orange.png');
const yellowIcon = getIcon('marker-highway-yellow.png');
const goldIcon = getIcon('marker-highway-brown.png');
const blueIcon = getIcon('marker-highway-blue.png');
const violetIcon = getIcon('marker-icon-violet.png');



const w3_highway_brown = '#633517';
const w3_highway_red = '#a6001a';
const w3_highway_orange = '#e06000';
const w3_highway_schoolbus = '#ee9600';
const w3_highway_yellow = '#ffab00';
const w3_highway_green = '#004d33';
const w3_highway_blue = '#00477e';

const violet = "#9400d3";//"#EE82EE";

const black = "#000000";

const grey = "#101010";


*/
function createLegend() {
	const legend = L.control.Legend({
		position: "bottomleft",
		title: 'Open street map shops and vacancies',
		collapsed: false,
		symbolWidth: 24,
		opacity: 0.8,
		column: 1,

		legends: [{
			label: "Vacant",
			type: "circle",
			color: w3_highway_red,
			fillColor: w3_highway_red

			//url: "./images/marker-highway-red.png",
		},
		/*	{
				label: "Serious",
				type: "circle",
	
				color: w3_highway_orange,
				fillColor: w3_highway_orange
				//url: "./images/marker-highway-orange.png",
			}, {
				label: "Minor",
				type: "circle",
				color: w3_highway_brown,
				fillColor: w3_highway_brown
				//url: "./images/marker-highway-brown.png"
			}, {
				label: "Possible",
				type: "circle",
				color: w3_highway_yellow,
				fillColor: w3_highway_yellow
	
				//url: "./images/marker-highway-yellow.png",
			}, 
			*/
		{
			label: "Shop",
			type: "circle",
			color: w3_highway_blue,
			fillColor: w3_highway_blue
			//url: "./images/marker-highway-blue.png"
		}
			/*, {
				label: "Unspecified",
				type: "circle",
				color: violet,
				fillColor: violet
				//url: "./images/marker-icon-violet.png",
	
			}, {
				label: "Stop: Arrest",
				type: "circle",
				color: w3_highway_red,
				fillColor: w3_highway_red,
				fillOpacity: 1
				//url: "./images/marker-icon-violet.png",
	
			},
			{
				label: "Stop: Citation",
				type: "circle",
				color: w3_highway_blue,
				fillColor: w3_highway_blue,
				fillOpacity: 1
				//url: "./images/marker-icon-violet.png",
	
			}, {
				label: "Stop: Warning",
				type: "circle",
				color: w3_highway_schoolbus,
				fillColor: w3_highway_schoolbus,
				fillOpacity: 0.5
				//url: "./images/marker-icon-violet.png",
	
			}, {
				label: "Stop: No Action",
				type: "circle",
				color: w3_highway_green,
				fillColor: w3_highway_green,
				fillOpacity: 0.5
				//url: "./images/marker-icon-violet.png",
			}
			*/
		]



		/*
		legends: [{
			label: "Fatal",
			type: "image",
			url: "./images/marker-highway-red.png",
		}, {
			label: "Serious",
			type: "image",
			url: "./images/marker-highway-orange.png",
		}, {
			label: "Minor",
			type: "image",
			url: "./images/marker-highway-brown.png"
		}, {
			label: "Possible",
			type: "image",
			url: "./images/marker-highway-yellow.png",
		}, {
			label: "No Injury",
			type: "image",
			url: "./images/marker-highway-blue.png"
		}, {
			label: "Unspecified",
			type: "image",
			url: "./images/marker-icon-violet.png",

		}]*/
	})
		.addTo(map);
}

createMap();

if (pointerFine) { // skip the legend for the mobile case.  maybe make a smaller legend?
	createLegend();
}

// add city boundary to map
L.geoJSON(cityGeoJson, { fillOpacity: 0.05 }).addTo(map);

// add downtown to map
L.geoJSON(downtownGeoJson, { fillOpacity: 0.05 }).addTo(map);

const resizeObserver = new ResizeObserver(() => {
	console.log("resize observer fired");
	map.invalidateSize();
});

resizeObserver.observe(document.getElementById('osm-map'));


// keep track of markers for removal
const markers = [];

function removeAllMakers() {
	for (const m of markers) {
		m.remove();
	}
}

function checkFilter(coll, tsSet, vehTypeRegExp,
	filter2024, filter2023,
	filter2022, filter2021, filter2020,
	filter2019,
	filter2018,
	filter2017,
	filter2016,
	filter2015,

	selectStreet, severity, selectStopResult
) {

	// for traffic stops, just return true
	//if (coll.attributes.Stop_GlobalID) {
	//	return true;
	//}
	const attr = coll.attributes;

	if (!tsSet.has(attr.DateTime)) {
		return false;
	}

	const year = attr.Year;
	if ((year == 2024) && !filter2024) {
		return false;

	}
	if ((year == 2023) && !filter2023) {
		return false;

	}
	if ((year == 2022) && !filter2022) {
		return false;

	}
	if ((year == 2021) && !filter2021) {
		return false;

	}
	if ((year == 2020) && !filter2020) {
		return false;

	}
	if ((year == 2019) && !filter2019) {
		return false;

	}
	if ((year == 2018) && !filter2018) {
		return false;

	}
	if ((year == 2017) && !filter2017) {
		return false;

	}
	if ((year == 2016) && !filter2016) {
		return false;

	}
	if ((year == 2015) && !filter2015) {
		return false;

	}
	if ((year < 2015) || (year > 2024)) {
		return false;
	}

	if (coll.attributes.Stop_GlobalID) {
		const loc = attr.Stop_Location;

		if (selectStreet != "Any") {

			if (selectStreet.includes('|')) {
				const re = new RegExp(selectStreet, 'i');

				if (!loc.match(re)) {
					return false;
				}
			} else {
				const m = loc.toUpperCase().includes(selectStreet.toUpperCase());
				if (!m) {
					return false;
				}
			}
		}
		if (selectStopResult != "Any") {

			const res = getStopResultCategory(attr.Result_of_Stop);
			if (res != selectStopResult) {
				return false;
			}
		}

		/*
			if (coll.attributes.Result_of_Stop != 3) {

			return false;
		}

				const hour = parseInt(coll.attributes.Time);
				//if (hour >= 6 &&  hour <= 10) {
				if ((hour <= 5) || (hour >= 21 && hour <= 23)) {
					return true;
				}*/

		return true;
	}

	const involved = attr.Involved_Objects;
	const m = involved.match(vehTypeRegExp);

	if (!m) {
		return false;
	}

	const loc = attr.Accident_Location;

	if (selectStreet != "Any") {

		if (selectStreet.includes('|')) {
			const re = new RegExp(selectStreet, 'i');

			if (!loc.match(re)) {
				return false;
			}
		} else {
			const m = loc.toUpperCase().includes(selectStreet.toUpperCase());
			if (!m) {
				return false;
			}
		}
	}
	var acceptableSeverities = [];
	// if coll has unspecifed severity, but switrs gives a severity use that instead
	var coll_severity = attr.Injury_Severity;

	if (coll_severity == 'Unspecified Injury') {
		if (coll.switrsRecord) {
			coll_severity = coll.switrsRecord.attributes.Injury_Severity
		}
	}

	acceptableSeverities.push('Fatal');

	if (severity == 'Fatal') {
		if (acceptableSeverities.indexOf(coll_severity) == -1) {
			return false;
		}
	}
	acceptableSeverities.push('Serious Injury');

	if (severity == 'Serious Injury') {
		if (acceptableSeverities.indexOf(coll_severity) == -1) {
			return false;
		}
	}

	acceptableSeverities.push('Minor Injury');

	if (severity == 'Minor Injury') {
		if (acceptableSeverities.indexOf(coll_severity) == -1) {
			return false;
		}
	}

	acceptableSeverities.push('Possible Injury');

	if (severity == 'Possible Injury') {
		if (acceptableSeverities.indexOf(coll_severity) == -1) {
			return false;
		}
	}

	if (severity == 'No Injury') {
		if (coll_severity != 'No Injury') {
			return false;
		}
		/*if ((attr.Number_of_Injuries != 0) || (attr.Number_of_Fatalities != 0)) {
			return false;
		}*/
	}
	return true;
}

const LatitudeDefault = 37.868412;
const LongitudeDefault = -122.349938;

function isStopAttr(a) {
	if (a.Stop_GlobalID) {
		return true;
	}
	return false;

}
function incrementMapKey(m, k) {
	m.set(k, m.get(k) + 1);
}

/*
Some amenties are not shops
*/
const nonShopAmenityValues = [
	'atm',
	'bench',
	'bicycle_parking',
	'bicycle_rental',
	'car_sharing',
	'clock',
	'drinking_water',
	'fountain',
	'motorcycle_parking',
	'parking',
	'parking_entrance',
	'post_box',
	'public_bookcase',
	'recycling',
	'taxi',
	'telephone',
	'toilets',
	'vending_machine',
	'waste_basket'

];
function isShopLikeAmenity(amenityTag) {
	const bNonShop = nonShopAmenityValues.includes(amenityTag);

	const retval = !bNonShop;
	return retval
}

function isShop(tags) {
	var bRetval = false;
	if (tags.shop || (tags.leisure) || (tags.office)) {
		bRetval = true;
	}
	if (tags.amenity && isShopLikeAmenity(tags.amenity)) {
		bRetval = true;
	}
	return bRetval;
}

function isVacant(tags) {
	var bRetval = false;
	// include shops
	if (tags['disused:shop']) {
		bRetval = true;
	}

	if (tags['disused:amenity']) {
		bRetval = true;
	}
	if (tags['disused:leisure']) {
		bRetval = true;
	}
	if (tags['disused:office']) {
		bRetval = true;
	}
	if (tags.vacant == 'yes') {
		bRetval = true;
	}
	if (tags.abandoned == 'yes') {
		bRetval = true;
	}
	return bRetval;
}

function getPointFromeature(feature) {
	const geom = feature.geometry;
	const fType = geom.type;
	var retval = null;

	if (fType == 'Point') {
		retval = geom.coordinates;
	} else if (fType == 'Polygon') {
		retval = geom.coordinates[0][0];
	} else if (fType == 'LineString') {
		retval = geom.coordinates[0][0];
	} else if (fType == 'MultiPolygon') {
		retval = geom.coordinates[0][0][0];
	}
	if (!retval) {
		console.log("no point for feature", feature)
	}
	return retval;
}
var nCountVacant = 0;
var nCountShop = 0;

function addMarkers(osmJson, bVacant,
	filterShop,
	filterAmenity,

	filterDisusedShop,
	filterDisusedAmenity,

	filterOtherAmenity
	/*, tsSet, histYearData, histHourData, histFaultData, histAgeInjuryData,
	vehTypeRegExp,
	filter2024, filter2023, filter2022, filter2021, filter2020,
	filter2019, filter2018, filter2017, filter2016, filter2015,
	selectStreet, selectSeverity, selectStopResult*/

) {
	//removeAllMakers();
	const markersAtLocation = new Map();
	// add collisions to map
	var markerCount = 0
	var skipped = 0, plotted = 0;

	var arrMappedCollisions = [];

	for (const osmItem of osmJson.features) {
		//const attr = osmItem.elements; 
		//const tags = osmItem.tags;
		//	console.log(tags)

		const tags = osmItem.properties.tags;

		if (!tags) {
			//console.log("no tags")
			//	incrementMapKey(histShopData, arrShopKeys[2]);
			continue;
		}

		var bInclude = false;
		const bShop = isShop(tags);
		const bVacant = isVacant(tags);
		//	console.log("Name:", tags.name, " shop:", bShop, " vacant:", bVacant);

		if (filterShop) {
			if (bShop) {
				bInclude = true;
			}
		}

		if (filterDisusedShop) {
			if (bVacant) {
				bInclude = true;
			}
		}
	
		if (!bInclude) {
			//	console.log("Filtered out ", tags.name);
			incrementMapKey(histShopData, arrShopKeys[2]);
			continue;
		}

		plotted++;

		//	arrMappedCollisions.push(attr); // add to array for export function

		// ADD NEW CHART
		//histData.set(attr.Year, histData.get(attr.Year) + 1);
		//incrementMapKey(histYearData, attr.Year);
		/*
				if (!attr.Hour) {
					//console.log("Undefined hour " , attr.Case_Number);
					// try to set it from time
					attr.Hour = parseInt(attr.Time.substr(0, 2));
				}
				const hour = 3 * Math.floor(attr.Hour / 3);
				//console.log ( "Hour is " , attr.Hour, ' ' , attr.Case_Number);
				incrementMapKey(histHourData, hour);
		
				if (isStopAttr(attr)) {
					incrementMapKey(histStopResultData, getStopResultCategory(attr.Result_of_Stop));
				}
		
				if (!isStopAttr(attr)) {
					//histFaultData.set(attr.Party_at_Fault, histFaultData.get(attr.Party_at_Fault) + 1);
					incrementMapKey(histFaultData, attr.Party_at_Fault);
					//histSeverityData.set(attr.Injury_Severity, histSeverityData.get(attr.Injury_Severity) + 1);
					incrementMapKey(histSeverityData, attr.Injury_Severity);
					for (const v of arrObjectKeys) {
						if (attr.Involved_Objects.includes(v)) {
		
							histObjectData.set(v, histObjectData.get(v) + 1);
						}
					}
		
					//histAgeInjuryData
					const ageStr = attr.Injury_Ages;
					if (ageStr) {
						// split 
						const ages = ageStr.split("/");
						for (const a of ages) {
							const k = 10 * Math.floor(a / 10);
							incrementMapKey(histAgeInjuryData, k);
						}
					}
				}
				/*
						if (!(attr.Latitude && attr.Longitude)) {
							// try to get it from the map
							const matchingLocalReport = mapLocalCaseIDToAttr.get(attr.Local_Report_Number);
							if (matchingLocalReport) {
								attr.Latitude = matchingLocalReport.Latitude;
								attr.Longitude = matchingLocalReport.Longitude;
								//console.log("Fixed GPS for ", attr.Local_Report_Number);
							} else {
								console.log("Failed to fix GPS for ", attr.Local_Report_Number);
							}
						}*/
		// if lat  or long is missing, try the linked coll record
		//var lat = osmItem.lat;
		const point = getPointFromeature(osmItem);

		const lat = point[1];		
		const long = point[0]

		if (lat && long) {
			const loc = [lat, long];
			const tp = turf.point([long, lat]);
		
		/*	if (!turf.booleanPointInPolygon(tp, downtownTurfPolygon)) {
				//console.log("Skipping item not in district ", tags)
				incrementMapKey(histShopData, arrShopKeys[2]);
				continue;
			}*/

			// make sure we are in the downtown boundary
			if (bVacant) {
				nCountVacant++;
				incrementMapKey(histShopData, arrShopKeys[1]);
			}
			if (bShop) {
				incrementMapKey(histShopData, arrShopKeys[0]);
				nCountShop++;
			} else {
				incrementMapKey(histShopData, arrShopKeys[2]);
			}


			const opt = getOptionsForSeverity(bVacant ? 'Fatal' : 'No Injury');

			var marker = L.circleMarker([lat, long], opt);


			var msg = nodePopup(tags)


			if (pointerFine) {

				//marker.bindTooltip(msg).openTooltip(); can copy from tooltip!
				marker.bindPopup(msg).openPopup();
			} else {
				marker.bindPopup(msg).openPopup();
			}

			marker.addTo(map);
			markers.push(marker);
			markerCount++;
		} else {
			//histMissingGPSData.set(attr.Year, histMissingGPSData.get(attr.Year) + 1);
			//incrementMapKey(histMissingGPSData, attr.Year);
			incrementMapKey(histShopData, arrShopKeys[2]);
			skipped++;
		}
	}
	console.log('Skipped', skipped);
	console.log('Plotted', plotted);
	console.log("markerCount ", markerCount)

	const summaryMsg = '<br>Vacant Shops: ' + nCountVacant + '<br>' + 'Non-vacant shops: ' + nCountShop + '<br>';
	summary.innerHTML = summaryMsg;

	/*	// set array for download
		const json = JSON.stringify(arrMappedCollisions, null, 2);
		const inputblob = new Blob([json], {
			type: "application/json",
		});
		const u = URL.createObjectURL(inputblob);
		saveanchor.href = u;
	*/
}

// chart data variables
// ADD NEW CHART
var histShopData = new Map();  // bars Shop, Vacant
const arrShopKeys = ['Shops', 'Vacant', 'Other'];

/*
const histYearData = new Map();
const histHourData = new Map();
const arrHourKeys = [0, 3, 6, 9, 12, 15, 18, 21];

const histMissingGPSData = new Map();
var histFaultData = new Map();

var histSeverityData = new Map();
var histObjectData = new Map();


var histAgeInjuryData = new Map();  // bars 0-9, 10-19, 20-, 30, 40, 50, 60, 70, 80+
const arrAgeKeys = [0, 10, 20, 30, 40, 50, 60, 70, 80];
/
var histStopResultData = new Map();
const arrStopResultKeys = [stopArrest, stopCitation, stopWarning, stopNoAction, stopUnkown];


const arrSeverityKeys = [
	"Unspecified Injury",
	"No Injury",

	"Possible Injury",
	"Minor Injury",

	"Serious Injury",
	"Fatal"


];

const arrObjectKeys = [
	"Car", "Motorcycle", "Bicycle", "Pedestrian", "Truck", "Bus", "Parked Car", "Object", "Electric Bike", "Electric Scooter", "Electric Skateboard"
];
*/
/* histogram data */
function clearHistData(keys, data) {
	for (const f of keys) {
		data.set(f, 0);
	}
}

// ADD NEW CHART
clearHistData(arrShopKeys, histShopData);
/*
clearHistData(arrObjectKeys, histObjectData);
clearHistData(arrSeverityKeys, histSeverityData);
clearHistData(arrAgeKeys, histAgeInjuryData);
clearHistData(arrStopResultKeys, histStopResultData);
clearHistData(arrHourKeys, histHourData);


// clear data functions
function clearHistYearData() {
	for (var y = 2015; y < 2025; y++) {
		histYearData.set(y, 0);
		histMissingGPSData.set(y, 0);
	}
}
clearHistYearData();
*/
/*
const faultKeys = [
	"Bicyclist",
	"Driver",
	"Object",
	"Other",
	"Pedestrian"
];

function clearFaultData() {
	for (const f of faultKeys) {
		histFaultData.set(f, 0);
	}
}
clearFaultData();
*/

// chart variables
// ADD NEW CHART
var histShopChart;

var histYearChart;
var histHourChart;

var histChartGPS;
var histFaultChart;

var histObjectChart;
var histSeverityChart;
var histAgeInjuryChart;

var histStopResultChart;



function createOrUpdateChart(data, chartVar, element, labelText) {
	// data should be an array of objects with members bar and count
	if (chartVar == undefined) {
		chartVar = new Chart(element
			,
			{
				type: 'bar',
				data: {
					labels: data.map(row => row.bar),
					datasets: [
						{
							label: labelText,
							data: data.map(row => row.count)
						}
					]
				}
			}
		);
	} else {
		//const newData = data.map(row => row.count);
		// update data

		const newData = {
			label: labelText,
			data: data.map(row => row.count)
		}

		chartVar.data.datasets.pop();
		chartVar.data.datasets.push(newData);
		//	console.log(newData);
		chartVar.update();
	}
	return chartVar;
}


function handleFilterClick() {
	// ADD NEW CHART
	clearHistData(arrShopKeys, histShopData);

	/*	clearHistYearData();
		clearHistData(arrHourKeys, histHourData);
		clearFaultData();
		clearHistData(arrObjectKeys, histObjectData);
		clearHistData(arrSeverityKeys, histSeverityData);
		clearHistData(arrAgeKeys, histAgeInjuryData);
		clearHistData(arrStopResultKeys, histStopResultData);
	
		const dataSpec = selectData.value;
		var tsSet;
		var collData = shopJson;
	*/
	
	// reset summary counts 
	nCountVacant = 0

	nCountShop = 0

	removeAllMakers();
	addMarkers(osmGeoJson, false,
		checkShop.checked,
		checkAmenity.checked,
		checkDisusedShop.checked,
		checkDisusedAmenity.checked,
		checkOtherAmenity.checked /*, histYearData, histHourData, histFaultData, histAgeInjuryData,

		selectVehicleTypes.value,

		check2024.checked,
		check2023.checked,
		check2022.checked,
		check2021.checked,
		check2020.checked,

		check2019.checked,
		check2018.checked,
		check2017.checked,
		check2016.checked,
		check2015.checked,

		selectStreet.value,
		selectSeverity.value,
		selectStopResult.value*/
	);
	/*
		addMarkers(vacantJson, true,
	
			checkShop.checked,
			checkAmenity.checked,
	
			checkDisusedShop.checked,
			checkDisusedAmenity.checked,
	
			checkOtherAmenity.checked
		);*/

	// ADD NEW CHART
	const dataShops = [];

	for (const k of arrShopKeys) {
		dataShops.push({ bar: k, count: histShopData.get(k) })
	}

	/*	const dataFault = [];
		for (const k of faultKeys) {
			dataFault.push({ bar: k, count: histFaultData.get(k) })
		}
	
		const dataObject = [];
		for (const k of arrObjectKeys) {
			dataObject.push({ bar: k, count: histObjectData.get(k) })
		}
	
		const dataSeverity = [];
		for (const k of arrSeverityKeys) {
			dataSeverity.push({ bar: k, count: histSeverityData.get(k) })
		}
	
		const dataStopResult = [];
		for (const k of arrStopResultKeys) {
			dataStopResult.push({ bar: k, count: histStopResultData.get(k) })
		}
	
	*/
	// ADD NEW CHART
	histShopChart = createOrUpdateChart(dataShops, histShopChart, document.getElementById('shopHist'), 'Shop / Vacancies counts');

	/*	histFaultChart = createOrUpdateChart(dataFault, histFaultChart, document.getElementById('crashFaultHist'), 'Collisions by Fault');
	
		histObjectChart = createOrUpdateChart(dataObject, histObjectChart, document.getElementById('involvedObjectHist'), 'Crash Particpants');
	
		histSeverityChart = createOrUpdateChart(dataSeverity, histSeverityChart, document.getElementById('severityHist'), 'Injury Severity');
	
		const dataByYear = [];
		for (var bar = 2015; bar <= 2024; bar++) {
			dataByYear.push({ bar: bar, count: histYearData.get(bar) });
		}
	
		histYearChart = createOrUpdateChart(dataByYear, histYearChart, document.getElementById('yearHist'), 'Collisions or Stops by Year');
	
		const dataByHour = [];
		for (const k of arrHourKeys) {
			dataByHour.push({ bar: k, count: histHourData.get(k) })
		}
	
		histHourChart = createOrUpdateChart(dataByHour, histHourChart, document.getElementById('hourHist'), 'Collisions or Stops by Hour');
	
		const dataGPSByYear = [];
		for (var bar = 2015; bar <= 2024; bar++) {
			dataGPSByYear.push({ bar: bar, count: histMissingGPSData.get(bar) });
		}
	
		histChartGPS = createOrUpdateChart(dataGPSByYear, histChartGPS, document.getElementById('gpsHist'), 'Missing GPS by Year');
		//ageInjuryHist
	
		const dataInjurybyAge = [];
		for (const k of arrAgeKeys) {
			dataInjurybyAge.push({ bar: k, count: histAgeInjuryData.get(k) })
		}
	
		histAgeInjuryChart = createOrUpdateChart(dataInjurybyAge, histAgeInjuryChart, document.getElementById('ageInjuryHist'), 'Injury by Age');
	
		histStopResultChart = createOrUpdateChart(dataStopResult, histStopResultChart, document.getElementById('stopResultHist'), 'Stop Results');
	*/
}
/*
function handleExportClick() {
	handleFilterClick();
}


saveanchor.addEventListener(
	"click", handleExportClick
	// (event) => (event.target.href = canvas.toDataURL()),
);
*/

/* unused stuff

	
*/




export {
	greenIcon, goldIcon, redIcon,

	map, handleFilterClick
};