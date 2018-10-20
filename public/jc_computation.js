var total_distance = 0.0;
var input_target = 0.0;
var map, infoWindow;
var distance_string = "";
var waypoints = [];
var coord_previous;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.0902, lng: -95.7129 },
        zoom: 5
    });
    infoWindow = new google.maps.InfoWindow;
    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var labelIndex = 0;
    var current_route = 0;
    var number_of_responses = 0;
    var markerArray = [];
    var pos = {
        lat: 0,
        lng: 0
    };
    var trice_pos = {
        lat: 42.0140,
        lng: -93.6358
    }
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var contentString = 'Current Location'
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            var marker = new google.maps.Marker({
                position: pos,
                map: map,
                title: 'Current Location'
            });

            map.zoom = 15;
            map.setCenter(pos);

        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
    stepDisplay = new google.maps.InfoWindow();
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);

    var clearRouteNumber = function(){
        var current_route = 0;
        console.log(current_route);
        onChangeHandler();
    }
    var onChangeHandler = function () { //When The run button is clicked
        if (document.getElementById('north_radio').checked == true) {
            trice_pos = {
                lat: pos.lat + 1.0,
                lng: pos.lng
            }
        }
        else if (document.getElementById('south_radio').checked == true) {
            trice_pos = {
                lat: pos.lat - 1.0,
                lng: pos.lng
            }
        }
        else if (document.getElementById('east_radio').checked == true) {
            trice_pos = {
                lat: pos.lat,
                lng: pos.lng + 1.0
            }
        }
        else if (document.getElementById('west_radio').checked == true) {
            trice_pos = {
                lat: pos.lat,
                lng: pos.lng - 1.0
            }
        }
        calculateAndDisplayRoute(directionsService, directionsDisplay, false, pos, trice_pos);
        input_target = document.getElementById('mile_input_box').value;
        if (document.getElementById('loop_radio').checked == true) {
            input_target = input_target / 2.0;
        }
    };

    var getAlternate = function () {
        console.log("here");
        if (current_route < number_of_responses - 1) {
            current_route = current_route + 1;
        }
        else {
            current_route = 0;
        }
        document.getElementById('cur_alt_text').innerHTML = "Current path: " + current_route;
        onChangeHandler();
    }

    document.getElementById('testbutton').addEventListener('click', clearRouteNumber);
    document.getElementById('alternate_button').addEventListener('click', getAlternate);
    function calculateAndDisplayRoute(directionsService, directionsDisplay, display_bool, start, finish) {
        total_distance = 0;
        directionsService.route({
            origin: start,
            destination: finish,
            travelMode: 'WALKING',
            avoidTolls: true,
            avoidHighways: true,
            provideRouteAlternatives: true
        }, function (response, status) {
            if (status === 'OK') {
                if (display_bool == true) {
                    directionsDisplay.setDirections(response);
                    if (document.getElementById('loop_radio').checked == true) {
                        temp_distance = parseFloat(distance_string.replace(/[^\d.-]/g, ''));
                        temp_distance = temp_distance * 2.0;
                        distance_string = temp_distance.toString().replace(/[^\d.-]/g, '');
                    }
                    document.getElementById('total_mile_counter').innerHTML = distance_string.replace(/[^\d.-]/g, '');
                }
                else {
                    showSteps(response, markerArray, stepDisplay, map);
                }
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
    function showSteps(directionResult, markerArray, stepDisplay, map) {
        // For each step, place a marker, and add the text to the marker's infowindow.
        // Also attach the marker to an array so we can keep track of it and remove it
        // when calculating new routes.
        var myRoute = directionResult.routes[current_route].overview_path;
        number_of_responses = directionResult.routes.length;
        document.getElementById('num_alt_text').innerHTML = "Number of alternates: " + (number_of_responses - 1);
        console.log(directionResult.routes);
        for (var i = 0; i < myRoute.length; i++) {
            console.log(current_route);
            if ((parseFloat(total_distance) > parseFloat(input_target)) || (i == myRoute.length - 1)) {
                calculateAndDisplayRoute(directionsService, directionsDisplay, true, pos, myRoute[i - 1]);
                break;
            }
            var marker = markerArray[i] || new google.maps.Marker;
            if (i > 0) {
                var temp_coord_array_1 = myRoute[i].toString().replace(/[^\d\s.-]/g, '').split(" ");
                var past_coord_array_1 = coord_previous.toString().replace(/[^\d\s.-]/g, '').split(" ");
                var tempDist = calcCrow(temp_coord_array_1[0], temp_coord_array_1[1], past_coord_array_1[0], past_coord_array_1[1]);
                total_distance = total_distance + tempDist;
                distance_string = total_distance.toString();
                var distance_string_period = distance_string.indexOf('.');
                distance_string = distance_string.substring(0, distance_string_period + 4) + " miles";
            }
            coord_previous = myRoute[i];
            attachInstructionText(stepDisplay, marker, "test", map);
        }
    }
}
function attachInstructionText(stepDisplay, marker, text, map) {
    google.maps.event.addListener(marker, 'click', function () {
        // Open an info window when the marker is clicked on, containing the text
        // of the step.
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}