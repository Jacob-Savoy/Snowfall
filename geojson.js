function calcPropRadius(attValue) {
    var scaleFactor = 50;
    var area = attValue * scaleFactor;
    var radius = Math.sqrt(area / Math.PI);
    return radius;
}
    
function pointToLayer(feature, latlng, attributes) {
    var attribute = attributes[0];
    console.log(attribute);

    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    var attValue = Number(feature.properties[attribute]);
    options.radius = calcPropRadius(attValue);
    var layer = L.circleMarker(latlng, options);

    var panelContent = "<p><b>City:</b> " + feature.properties.City;
    var year = attribute.split("_")[1];
    panelContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " million</p>";
    
    var popupContent = feature.properties.City;
    
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -options.radius)
    });
    layer.on({
        mouseover: function () {
            this.openPopup();
        },
        mouseout: function () {
            this.closePopup();
        },
        click: function () {
            $("#panel").html(panelContent);
        }
    });
    return layer;
}

function createPropSymbols(data, map, attributes) {
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

function createSequenceControls() {
    $('#panel').append('<input class="range-slider" type="range">');
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    $('.skip').click(function () {
        var index = $('.range-slider').val();
        if ($(this).attr('id') === 'forward') {
            index++;
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') === 'reverse') {
            index--;
            index = index < 0 ? 6 : index;
        };
        console.log(index);

        $('.range-slider').val(index);
    });
    $('.range-slider').on('input', function () {
        var index = $(this).val();
        console.log(index);
    });
};

function processData(data) {
    var attributes = [];
    var properties = data.features[0].properties;
    for (var attribute in properties){
        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);
        };
    };
     console.log(attributes);
    return attributes;
};

function updatePropSymbols(map, attributes){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attributes]){
            var props = layer.feature.properties;
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
        });
    };
})};

$.ajax("data/MegaCities.geojson", {
    dataType: "json",
    success: function (response) {
        var attributes = processData(response);
        createPropSymbols(response, map, attributes);
        createSequenceControls(map, attributes);
        updatePropSymbols(map, attributes);
        }
});