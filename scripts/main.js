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
var svg = d3.select('div#map-svg').append('svg')
  .attr('width', mapWidth)
  .attr('height', mapHeight);

// Add SVG map at correct size, assuming map is saved in a subdirectory called `data`
svg.append('image')
  .attr('width', mapWidth)
  .attr('height', mapHeight)
  .attr('xlink:href', 'data/map.svg');

// ********** LOAD AND DRAW RESTAURANT LOCATIONS **********

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
  }; 
}).then(drawLocationPins);

// ********** DRAW A SEARCH AREA (CIRCLES A & B) **********

circle_a = svg.append('g')
  .attr('transform', 'translate(100, 100)')

circle_a.append('circle')
  .attr('class', 'radius')
  .attr('id', 'circle-a')
  .attr('r', 50)
  .attr('cx', 0)
  .attr('cy', 0)
  .attr('fill', 'black')
  .attr('opacity', 0.3)

circle_a.append('text')
  .attr('x', circle_a.select('.radius').attr('cx'))
  .attr('y', d3.select('#circle-a').attr('cy'))
  .attr('dy', '0.35em')
  .attr('dx', '-0.35em')
  .text('A')

circle_b = svg.append('g')
  .attr('transform', 'translate(200, 200)')

circle_b.append('circle')
  .attr('class', 'radius')
  .attr('id', 'circle-b')
  .attr('r', 50)
  .attr('cx', 0)
  .attr('cy', 0)
  .attr('fill', 'black')
  .attr('opacity', 0.3)

circle_b.append('text')
  .attr('dy', '0.35em')
  .attr('dx', '-0.35em')
  .text('B')

// Function: drawLocationPins
function drawLocationPins(restaurantData) {

  // Draw location pins as circles 
  svg.selectAll('.location_pin')
    .data(restaurantData)
    .join('circle')
    .attr('class', 'location_pin')
    .attr('r', 3)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('opacity', 0.3)

  // update which points are intersecting and which ones are not 
  function updateLocationPins() {

    svg.selectAll('.location_pin')
      .attr('fill', function(d){
        if(parseInt(d.score) >= currentScore) {
          return 'black'
        } else {
          return 'none'
        };
      })
      .on('mouseover', null)
      .on('mouseout', null)
      .classed('intersecting_point', intersecting)

    svg.selectAll('.intersecting_point')
    .attr('fill', function(d){
      if(parseInt(d.score) >= currentScore) {
        return 'dodgerblue'
      } else {
        return 'none'
      };
    })
    .on('mouseover', mouseOver)
    .on('mouseout', mouseOut)
  }

  // ***** DEFINE BEHAVIOR FOR HOVERING OVER LOCATION POINTS ***** 

  function mouseOver(event, d) {
    d3.select(this)
      .style("stroke", "black")
      .attr("opacity", 1)

    // Label for Name, Grade, and Score of each place
    // Split into three 'text' labels for spacing
    svg.append('text')
      .attr('class', 'ptLabel')
      .style('fill', 'darkblue')
      .attr('x', d.x - d.name.length*2)
      .attr('y', d.y + LABEL_MARGIN * 2)
      .text(`Name: ${d.name}`)
    svg.append('text')
      .attr('class', 'ptLabel')
      .style('fill', 'darkblue')
      .attr('x', d.x - d.name.length*2)
      .attr('y', d.y + LABEL_MARGIN * 3)
      .text(`Grade: ${d.grade}`)
    svg.append('text')
      .attr('class', 'ptLabel')
      .style('fill', 'darkblue')
      .attr('x', d.x - d.name.length*2)
      .attr('y', d.y + LABEL_MARGIN * 4)
      .text(`Score: ${d.score}`)
  }

  function mouseOut() {
    d3.select(this)
      .style("stroke", "none")
      .attr("opacity", 0.3)
    svg.selectAll('.ptLabel').remove() // remove all
  }

  // ***** DEFINE BEHAVIOR FOR DRAGGING THE SEARCH AREA ***** 

  // Behavior at the start of the drag (clicking on the search area): 
  // 1. Change the stroke to red, for visual feedback 
  function dragStart() {
    d3.select(this).select('.radius')
      .attr('stroke', 'red')
      .attr('stroke-width', '2')
  }

  // Behavior while the search area is being dragged:  
  // 1. Move the x and y position of the search area 
  // 2. Don't let users drag the search area out of bounds 
  function dragMove(event){

    // the radius of the search area is ever changing so 
    // we need to pull the value directly from the object 
    radius = d3.select(this).select('.radius').attr('r')

    // defining new x and y values for the search area, to make sure
    // they stay within the bounds of the map 
    bounded_cx = Math.max(0, Math.min(mapWidth, event.x));
    bounded_cy = Math.max(0, Math.min(mapHeight, event.y));

    // set the new x and y positions
    d3.select(this)
      .attr('transform', 'translate(' + bounded_cx + ', ' + bounded_cy + ')')
  }

  // Behavior when the search area is no longer being dragged:  
  // 1. Remove the stroke 
  function dragEnd() {
    d3.select(this).select('.radius')
      .attr('stroke', null)
      .attr('stroke-width', null)
      updateLocationPins()
  }

  // Create a handler object to descbribe the dragging behavior 
  var drag_handler = d3.drag()
    .on('start', dragStart)
    .on('drag', dragMove)
    .on('end', dragEnd)

  // Apply the handler to the radius objects 
  drag_handler(circle_a)
  drag_handler(circle_b)

  // ***** RADIUS SLIDER *****

  var circleRadiusA = d3.select('#circle-a')
  var circleRadiusB = d3.select('#circle-b')

  // A function that update the chart when slider is moved
  function updateRadius(updatedRadius, selectedCircle) {
    selectedCircle.transition()
      .ease(d3.easeLinear)
        .duration(200)
        .delay(10)
        .attr('r', updatedRadius)
    .on("end", updateLocationPins);
  }

  // Listen to the radius slider A
  d3.select('#radius-slider-a')
    .on('change', function(d) {
      selectedValue = this.value
      updateRadius(selectedValue, circleRadiusA)
    });

  // Listen to the radius slider B
  d3.select('#radius-slider-b')
    .on('change', function(d) {
      selectedValue = this.value
      updateRadius(selectedValue, circleRadiusB)
    });

  // ********** SCORE SLIDER **********

  var scoreValue = d3.select('#score-value')
  var currentScore = 50 

  // A function that update the chart when slider is moved
  function updateScore() {
    scoreValue.enter().append('text')
    scoreValue.text(`${currentScore}`)

    updateLocationPins()
  }

  // Listen to the score slider
  d3.select("#score-slider")
    .on("change", function(d) {
      currentScore =  this.value
      updateScore()
  });

  updateLocationPins()
}

// calculates the distance between two points p1 and p2 
function distance(p1, p2) {
  dx = p1.x - p2.x 
  dy = p1.y - p2.y
  return Math.sqrt(dx * dx + dy * dy)
}

// determine if this point is intersecting with the radii or not
function intersecting() {

  // retrieve the objects for the circles and location pin
  circle_a = d3.select('#circle-a')
  circle_b = d3.select('#circle-b')
  location_pin = d3.select(this)

  // create objects representing the centers 
  circle_a_center = {x: Number(circle_a.attr('cx')), y: Number(circle_a.attr('cy'))}
  circle_b_center = {x: Number(circle_b.attr('cx')), y: Number(circle_b.attr('cy'))}
  location_pin_center = {x: Number(location_pin.attr('cx')), y: Number(location_pin.attr('cy'))}

  // get the current radius of each circle 
  circle_a_radius = Number(circle_a.attr('r'))
  circle_b_radius = Number(circle_b.attr('r'))

  // calculate the distance from the location pin to each circle 
  distance_to_a = distance(circle_a_center, location_pin_center)
  distance_to_b = distance(circle_b_center, location_pin_center)

  return (distance_to_a<=circle_a_radius && distance_to_b<=circle_b_radius)
}