// Constants
const LABEL_MARGIN = 15;

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
var svg = d3.select('#map-svg').append('svg')
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
        grade: d.grade, 
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
        .attr('fill', 'gray')
        .on('mouseover', function(event, d) {
          d3.select(this).style('fill', 'steelblue');
          // Label for Name, Grade, and Score of each place
          // Split into three 'text' labels for spacing
          svg.append('text')
            .attr('class', 'ptLabel')
            .attr('x', d.x + LABEL_MARGIN)
            .attr('y', d.y)
            .text(`Name: ${d.name}`)
          svg.append('text')
            .attr('class', 'ptLabel')
            .attr('x', d.x + LABEL_MARGIN)
            .attr('y', d.y + LABEL_MARGIN)
            .text(`Grade: ${d.grade}`)
          svg.append('text')
            .attr('class', 'ptLabel')
            .attr('x', d.x + LABEL_MARGIN)
            .attr('y', d.y + 2 * LABEL_MARGIN)
            .text(`Score: ${d.score}`)
        })
        .on('mouseout', function(event, d) {
          d3.select(this).style("fill", "gray");
          svg.selectAll('.ptLabel').remove() // remove all
          
        });
    });