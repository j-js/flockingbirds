// main function that is called to make chart
// it returns chart
function bubbleChart() {
  
  // Constants for sizing
  var width = 940;
  var height = 700;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('visa_tooltip', 140);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };

  
  var divitionX = 6;
  var continentCenters = {
    Africa: { x: 2*width / divitionX, y: height / 3 },
    Asia: { x: width/2, y: height / 3 },
    Europe: { x: 4*width / divitionX, y: height / 3},
    NorthAmerica: { x: 2*width / divitionX, y: 2*height / 3 },
    Oceania: { x: 3*width / divitionX, y: 2*height / 3 },
    SouthAmerica: { x: 4*width / divitionX, y: 2*height / 3 },
  };
 
  // X locations of the year titles.
  var titleX = 200;
  var continentTitleX = {
    Africa: titleX,
    Asia: width / 2 - 80,
    Europe:  4*width / divitionX,
    NorthAmerica: titleX+30,
    Oceania: width / 2- 40,
    SouthAmerica: width / 2 +titleX,
  };

  // Y locations of the year titles.
  var titleY = 50;
  var continentTitleY = {
    Africa: titleY,
    Asia: titleY,
    Europe: titleY,
    NorthAmerica: 2*height / 3 - titleY,
    Oceania: 2*height / 3 - titleY,
    SouthAmerica: 2*height / 3 - titleY
  };

  // Used when setting up force and
  // moving around nodes
  var damper = 0.102;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  // Charge function is called for each node. Charge is proportional to 
  // the diameter of the circle (radius attribute ), chartge is for
  // accurate collision on detection with nodes of different sizes.
  // negative : nodes to repel/ postitive : nodes to attract.
  // dividing by 8 to make them closer

  function charge(d) {
    // 지름 제곱*3.14
    return -Math.pow(d.radius, 2.0)*3.14/25;
  }

  // Here we create a force layout and
  // configure it to use the charge function
  // from above. This also sets some contants
  // to specify how the force layout should behave.
  // More configuration is done below.
  var force = d3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(-0.01)
    .friction(0.9);


  // setting color (gradation)
  // if 0 -> gray | 1-> blue | 100 -> white | 400 -> red
  var fillColor = d3.scale.linear()
    .domain([0,1,100,400,2000])
    .range(['#919191','#17e7ff', '#f2e47a', '#fe5f6a','#fe5f6a']);

    // color option
    // '#4d53a3', '#76a624', '#ee5153' blue green pink
    // 

  // Sizes bubbles based on their area instead of raw radius
  var radiusScale = d3.scale.pow()
    .exponent(0.5)
    // minimun area from 4 maximum area to 100
    .range([3, 70]);

  /*
   * STEP ONE : LOAD RAW DATA and set to nodes
   * data manipulation function( raw data-CSV file -> array of node objects)
   * Each node will store data and visualization values to visualize
   * a bubble. This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */
  function createNodes(rawData) {
    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.
    var myNodes = rawData.map(function (d) {
      return {
        // id= contry name
        id: d.id,
        radius: radiusScale(+d.O_1),
        value: +d.O_1,
        name: d.id,
        org: d.id,
        group: d.id,
        continents: d.continents,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent smaller nodes hiding under.
    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */
  var chart = function chart(selector, rawData) {
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number by converting it
    // with `+`.
    var maxAmount = d3.max(rawData, function (d) { return +d.O_1; });
    radiusScale.domain([0, maxAmount]);

    nodes = createNodes(rawData);
    // Set the force's nodes to our newly created nodes array.
    force.nodes(nodes);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3.select(selector)
      .append('svg')
      .classed('bubble', true)
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(d.value); })
      //.attr('stroke', function (d) { return d3.rgb(fillColor(d.value)).darker(); })
      //.attr('stroke-width', 2)
      .attr('fill-opacity', 0.7)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    bubbles.exit()
      .transition()
      .duration(200)
      .style('opacity', 0)
      .remove();

    // Set initial layout to single group.
    groupBubbles();
  };

  /*
   * Sets visualization in "single group mode".
   * The year labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  function groupBubbles() {
    hideContinents();

    force.on('tick', function (e) {
      bubbles.each(moveToCenter(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "single group mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it toward the center of
   * the visualization.
   *
   * Positioning is adjusted by the force layout's
   * alpha parameter which gets smaller and smaller as
   * the force layout runs. This makes the impact of
   * this moving get reduced as each node gets closer to
   * its destination, and so allows other forces like the
   * node's charge force to also impact final location.
   */
  function moveToCenter(alpha) {
    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }

  /*
   * Sets visualization in "split by year mode".
   * The year labels are shown and the force layout
   * tick function is set to move nodes to the
   * continentCenters of their data's year.
   */
  function splitBubbles() {
    showContinents();

    force.on('tick', function (e) {
      bubbles.each(moveToContinents(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "split by year mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it the year center for that
   * node.
   *
   * Positioning is adjusted by the force layout's
   * alpha parameter which gets smaller and smaller as
   * the force layout runs. This makes the impact of
   * this moving get reduced as each node gets closer to
   * its destination, and so allows other forces like the
   * node's charge force to also impact final location.
   */
  function moveToContinents(alpha) {
    return function (d) {
      var target = continentCenters[d.continents];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  /*
   * Hides Year title displays.
   */
  function hideContinents() {
    svg.selectAll('.continents').remove();
  }

  /*
   * Shows Year title displays.
   */
  function showContinents() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var continentsData = d3.keys(continentTitleX);
    var continents = svg.selectAll('.continents')
      .data(continentsData);

    continents.enter().append('text')
      .attr('class', 'continents')
      .attr('x', function (d) { return continentTitleX[d]; })
      .attr('y', function(d) {return continentTitleY[d]; })
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }


  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).transition()
                   .duration(500)
                   .attr('fill-opacity', 1);

    var content = '<span class="people">' +
                  addCommas(d.value) + '</span><spanclass="people"> People,</span><br/>' +
                  '<span class="value">' +
                  d.id + ',</span><br/>' +
                  '<span class="value">' +
                  d.continents +
                  '</span><br/>';
    tooltip.showTooltip(content, d3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3.select(this).transition()
      .duration(300)
      .attr('fill-opacity', 0.5);

    tooltip.hideTooltip();
  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between "single group" and "split by year" modes.
   *
   * displayName is expected to be a string and either 'continents' or 'all'.
   */
  chart.toggleDisplay = function (displayName) {
    if (displayName === 'continents') {
      console.log("hello continents");
      splitBubbles();
    } else if(displayName === 'all'){
      console.log("hello ALL");
      groupBubbles();
    } else if(displayName === '1997'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '1998'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '1999'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2000'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2001'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2002'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2003'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2004'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2005'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2006'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2007'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2008'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2009'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2010'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2011'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2012'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2013'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2014'){
      resetData('data/O1nationality'+displayName+'.csv');
    } else if(displayName === '2015'){
      resetData('data/O1nationality'+displayName+'.csv');
    }
  };


  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

var myBubbleChart = bubbleChart();

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
function display(error, data) {
  if (error) {
    console.log(error);
  }
  console.log(data.name);
  myBubbleChart('#vis', data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes
 */
function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}

function resetButtons(){
    d3.selectAll('#all').classed('active', true);
    d3.selectAll('#continents').classed('active', false);
}
/*
 * Sets up the years buttons to allow for toggling between data
 */
function setupYears(){
  d3.select('#years')
    .selectAll('.Ybutton')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.Ybutton').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');
      d3.select("#yearClicked").text(buttonId);

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}

/*
 * Helper function
 * CONVERT NUMBER TO STRING AND ADD COMMAS BY 1,000
 */
function addCommas(nToStr) {
  // convert to string
  nToStr += '';
  // if it's decimal split and store front of decimal in x[0] and behind of decimal x[1]
  var x = nToStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

// Load the data.
d3.csv('data/O1nationality1997.csv', display);


function resetData(dataPath){
  resetButtons();
  var svg = d3.select(".bubble");
  svg.remove("svg");
  d3.csv(dataPath, display);
}

// setup the buttons.
setupButtons();
//setup years buttons
setupYears();


/* */