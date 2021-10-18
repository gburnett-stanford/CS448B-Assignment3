// Set up size
var mapWidth = 1000;
var mapHeight = 750;

// ********** PLOT MAP **********

// Set up projection that the map is using
var scale = 190000;
var projection = d3.geoMercator()
  .center([-122.061578, 37.385532]) 
  .scale(scale)
  .translate([mapWidth / 2, mapHeight / 2]);

// This is the mapping between <longitude, latitude> position to <x, y> pixel position on the map
// projection is a function and it has an inverse:
// projection([lon, lat]) returns [x, y]
// projection.invert([x, y]) returns [lon, lat]

// Add an SVG element to the DOM
var svg = d3.select('body').append('svg')
  .attr('width', mapWidth)
  .attr('height', mapHeight);

// Add SVG map at correct size, assuming map is saved in a subdirectory called `data`
svg.append('image')
  .attr('width', mapWidth)
  .attr('height', mapHeight)
  .attr('xlink:href', 'data/map.svg');

// ********** PLOT RESTAURANT LOCATIONS **********
// field: name, address, grade, score, latitude, longitude 

restaurantData = d3.csv('data/restaurant_data.csv', function(d) {
    [x_projection, y_projection] = projection([d.longitude, d.latitude])
    return {
        name: d.name,
        address: d.address,   
        grade: +d.grade, 
        score: d.score,
        latitude: +d.latitude, 
        longitude: +d.longitude, 
        x: +x_projection,
        y: +y_projection
    }; })
    .then(function(restaurantData) {
        svg.selectAll('circle')
        .data(restaurantData)
        .join('circle')
        .attr('r', 3)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('fill', 'steelblue')
        .on('mouseover', function(event, d) {
          svg.append('text')
            .attr('class', 'ptLabel')
            .attr('x', d.x)
            .attr('y', d.y)
            .text(d.name)

        })
        .on('mouseout', function(event, d) {
          svg.selectAll('.ptLabel').remove() // remove all
        });
    });