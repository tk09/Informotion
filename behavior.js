var geocoder = new google.maps.Geocoder(),
    list = document.querySelector('#list'),
    map,
    ID = "1ozhn";

function initialize() {
  // Maps styles worden gedefinieerd en basis settings worden toegevoegd
  var styles = [{"elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"color":"#f5f5f2"},{"visibility":"on"}]},{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"poi.attraction","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"visibility":"on"}]},{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","stylers":[{"visibility":"off"}]},{"featureType":"poi.school","stylers":[{"visibility":"off"}]},{"featureType":"poi.sports_complex","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#ffffff"},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"visibility":"simplified"},{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"color":"#ffffff"},{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.park","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#71c8d4"}]},{"featureType":"landscape","stylers":[{"color":"#e5e8e7"}]},{"featureType":"poi.park","stylers":[{"color":"#8ba129"}]},{"featureType":"road","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.sports_complex","elementType":"geometry","stylers":[{"color":"#c7c7c7"},{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#a0d3d3"}]},{"featureType":"poi.park","stylers":[{"color":"#91b65d"}]},{"featureType":"poi.park","stylers":[{"gamma":1.51}]},{"featureType":"road.local","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","stylers":[{"visibility":"simplified"}]},{"featureType":"road"},{"featureType":"road"},{},{"featureType":"road.highway"}];

  var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});

  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(52.365,4.89),
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.TERRAIN, 'map_style']
    }
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');

  // Haalt data op en maakt voor elk object een marker aan
  $.get("https://api.myjson.com/bins/"+ID, function(data, textStatus, jqXHR) {
    for (var i = 0; i < data.length; i++) { 
      var LatLng = new google.maps.LatLng(data[i].lat, data[i].lon);
      var urgentie = data[i].urgentie;
      var img = 'img/'+urgentie+'.png';
      var marker = new google.maps.Marker({ 
        position: LatLng, 
        map: map, 
        icon: img, 
        animation: google.maps.Animation.DROP, 
        clickable: true
      });
      infoPopup(marker, i)
    };

    // Voor elk punt wordt een popupveld aangemaakt
    function infoPopup(marker, i) {
      var water = data[i].water;
      var probleem = data[i].probleem;
      var contentString = '<h1>'+LatLng+'</h1><p><span>Hoeveelheid water (mm): </span>'+water+'</p><p><span>Probleem: </span>'+probleem+'</p>';
      google.maps.event.addListener(marker, 'click', function() {
        infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        infowindow.open(map, marker);
      });
    }(marker, i);
  });
}

// Val animatie voor elk punt
function drop() {
  clearMarkers();
  for (var i = 0; i < marker.length; i++) {
    addMarkerWithTimeout(marker[i], i * 20);
  }
}

// Val animatie gedefinieerd
function addMarkerWithTimeout(position, timeout) {
  window.setTimeout(function() {
    markers.push(new google.maps.Marker({
      position: position,
      map: map,
      icon: img,
      animation: google.maps.Animation.DROP
    }));
  }, timeout);
}

// Haalt markers weg zodat deze geanimeerd kunnen worden
function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

// Map wordt geladen
google.maps.event.addDomListener(window, 'load', initialize)

// Handelt formulier en verzenden data af
var send = function() {

// formulier waardes worden in variabele geplaatst
$.get("https://api.myjson.com/bins/"+ID, function(data, textStatus, jqXHR) {
  var straat = document.querySelector('#straat').value;
  var water = document.querySelector('#water').value;
  var probleem = document.querySelector('#probleem').value;
  var urgentie = document.querySelector('#urgentie').value;

  // Als straat leeg is gelaten, wordt locatie van gebruiker meegezonden
  if (straat == false) {
    navigator.geolocation.getCurrentPosition(getPos);
    function getPos(position) {
      lon = position.coords.longitude;
      lat = position.coords.latitude;
      a = {
        'lon': lon,
        'lat': lat,
        'water': water,
        'probleem': probleem,
        'urgentie': Number(urgentie)
      };
      data.push(a);  
      $.ajax({
        url:"https://api.myjson.com/bins/"+ID,
        type:"PUT",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data, textStatus, jqXHR){
          console.log(data)
        }
      });
      map = new google.maps.Map(document.getElementById('map'))
      google.maps.event.trigger(map, 'resize');
      initialize();     
    }
  } 

  // Als straat is ingevuld wordt locatie opgezocht en worden lon en lat meegenomen
  else {
    straat = straat.replace(/\s/g, "+");
    straat = straat + "+amsterdam";
    geocoder.geocode( { 'address': straat}, function(results, status) { 
      lon = results[0].geometry.location.lng()
      lat = results[0].geometry.location.lat()
      a = {
        'lon': lon,
        'lat': lat,
        'water': water,
        'probleem': probleem,
        'urgentie': Number(urgentie)
      };
      data.push(a);
      $.ajax({
        url:"https://api.myjson.com/bins/"+ID,
        type:"PUT",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data, textStatus, jqXHR){
          console.log(data)
        }
      });
      map = new google.maps.Map(document.getElementById('map'))
      google.maps.event.trigger(map, 'resize');
      initialize();
    });
  };
});
};

// Functie om alle punten mee te verwijderen. (daarom staat hij dus uit ;))
    // flush = function() {
    //   var c = confirm("weet je zeker dat je alle punten wilt verwijderen?")

    //   if (c) {
    //     $.ajax({
    //             url:"https://api.myjson.com/bins/"+ID,
    //             type:"PUT",
    //             data: '[]',
    //             contentType:"application/json; charset=utf-8",
    //             dataType:"json",
    //             success: function(data, textStatus, jqXHR){
    //               initialize();
    //             }
    //         });
    //   } else {
    //     return;
    //   }
    // }

// Animaties worden gedefinieerd + Toggle van form en legenda
$(window).load(function() {
  formAnim()
})

function formAnim() {

  var form = $("#form")
  var arrow = $("span#arrow")

  var legenda = $("#legenda")
  var arrow2 = $("span#arrow2")

  TweenMax.set(form, { scaleX:0, transformOrigin: 'left' });
  TweenMax.to(form, 0.75, { scaleX:1, delay:1, ease:Power4.easeInOut });
  
  TweenMax.set(arrow, { left: 10, rotation: 180, delay:0, ease:Power4.easeInOut });
  TweenMax.to(arrow, 0.75, { opacity: 1, left: 300, rotation: 0, delay:1, ease:Power4.easeInOut });
  arrow.addClass('arrowOut');

  arrow.toggle(function() {
    TweenMax.to(form, 0.75, { scaleX:0, delay:0, ease:Power4.easeInOut });
    TweenMax.to(arrow, 0.75, { left: 10, delay:0, ease:Power4.easeInOut });
    TweenMax.to(arrow, 0.75, { rotation: 180, ease:Power4.easeOut });
    arrow.addClass('arrowIn')
  }, function() {
    TweenMax.to(form, 0.75, { scaleX:1, delay:0, ease:Power4.easeInOut });
    TweenMax.to(arrow, 0.75, { left: 300, delay:0, ease:Power4.easeInOut });
    TweenMax.to(arrow, 0.75, { rotation: 0, ease:Power4.easeIn });
    arrow.removeClass('arrowIn')
  });


  TweenMax.set(legenda, { scaleX:0, transformOrigin: 'right' });
  TweenMax.to(legenda, 0.75, { scaleX:1, delay:1, ease:Power4.easeInOut });
  
  TweenMax.set(arrow2, { right: 10, rotation: 0, delay:0, ease:Power4.easeInOut });
  TweenMax.to(arrow2, 0.75, { opacity: 1, right: 200, rotation: 180, delay:1, ease:Power4.easeInOut });
  arrow2.addClass('arrowOut2');

  arrow2.toggle(function() {
    TweenMax.to(legenda, 0.75, { scaleX:0, delay:0, ease:Power4.easeInOut });
    TweenMax.to(arrow2, 0.75, { right: 10, delay:0, ease:Power4.easeInOut });
    TweenMax.to(arrow2, 0.75, { rotation: 0, ease:Power4.easeOut });
    arrow2.addClass('arrowIn')
  }, function() {
    TweenMax.to(legenda, 0.75, { scaleX:1, delay:0, ease:Power4.easeInOut });
    TweenMax.to(arrow2, 0.75, { right: 200, delay:0, ease:Power4.easeInOut });
    TweenMax.to(arrow2, 0.75, { rotation: 180, ease:Power4.easeIn });
    arrow2.removeClass('arrowIn')
  });
  
}
