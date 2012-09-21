	// the idea is add/remove groups of data and rescale accordingly. right now i need to focus on adding/removing data intependantly and rescaling independantly. also loading the entire new dataset and rescaling everytyhinhg

// start with earth and mars orbit.
// zoom out to show entire orbit
//render exoplanets
//zoom to largest
//zoom to RV type
//zoom to transit type
//zoom back out to solar system
// have lists gray out and update accordingly

//planets and exoplanets as different datasets will simplify rendering

//create a method to hide planets that are too close to the center because of scale

//INSET MAP OF SCALE


	/*exo.scale = function(options) {
				//input, type
   				this.defaultOptions = {
   					type: '',
   					input: null
   				};
    	        var settings = $.extend({}, this.defaultOptions, options);

				var scale = d3.scale.linear()
					//inverted y scale: bigger = up
					.domain([0, d3.max(data, function(d){ return d[settings.type];}) ])
					.range([exo.height-exo.m.b-exo.m.t, 0]);
				return scale(settings.input);
				};
				*/


//IS IT FASTER TO USE A CSS TRANFORM ON EACH RENDERED LAYER RATHER THAN SVG?
//give each planet a random rotation to tween to and then continue that in a loop

var exo = exo || {};

exo.data = [];
exo.dat = exo.dat || {};

exo.dat = {
	"Amount": .5
}
exo.duration = 4000;
exo.rDuration = 360000; // 360 seconds for teh earth to rotate around the sun
exo.width = $('#viz').width();
exo.height = $('#viz').height();

exo.m = {t: 80, r: 80, b: 80, l: 80};
exo.containerWidth = exo.width;

exo.renderWidth = function() {
	return exo.containerWidth-exo.m.l-exo.m.r;
}


// Conversion constants
exo.deg = 0;
exo.PER = 365.2; //days
exo.ER = 1;           // Earth Radius, in pixels
exo.SR = exo.ER*5; //sun is 110 the earth
//radius of earth 1/4 of the screen
exo.AU = 1; //$('#viz').width()/4;        // Astronomical Unit, in pixels
exo.YEAR = 15000;     // One year, in frames

// Max/Min numbers
//exo.maxTemp = 3257;
//exo.minTemp = 3257;

exo.yMax = 10;
exo.yMin = 0;

exo.maxSize = 0;
exo.minSize = 1000000;

// Axis labels
exo.xLabel = "Semi-major Axis (Astronomical Units)";
exo.yLabel = "Temperature (Kelvin)";

// Rotation Vectors - control the main 3D space
//PVector rot = new PVector();
//PVector trot = new PVector();

// Master zoom
exo.zoom = 0;
exo.tzoom = 0.3;


exo.randRange = function(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

//http://nssdc.gsfc.nasa.gov/planetary/factsheet/
//http://nssdc.gsfc.nasa.gov/planetary/factsheet/planet_table_ratio.html
//values relative to earth: radius, axis
//absolute values: temperature (k), period (days)

exo.sun = {
		name: "Sun",
		period: 0,
		radius: exo.SR,
		axis: 0,
		temp: 5778,
		angle: exo.randRange(-360,0)
	},

exo.solarSystem = [
	{
		name: "Mercury",
		radius: 0.383,
		axis: 0.387,
		period: 88,
		temp: 440.15,
		type: "local",
		angle: exo.randRange(-360,0)
	},
	{
		name: "Venus",
		radius: 0.949,
		axis: 0.723,
		period: 224.7,
		temp: 737.15,
		type: "local",
		angle: exo.randRange(-360,0)
	},
	{
		name: "Earth",
		radius: exo.ER,
		axis: exo.AU,
		period: exo.PER,
		temp: 288.15,
		type: "local",
		angle: exo.randRange(-360,0)
	},
	{
		name: "Mars",
		radius: 0.532,
		axis: 1.52,
		period: 687,
		temp: 208.15,
		type: "local",
		angle: exo.randRange(-360,0)
	},
	{
		name: "Jupiter",
		radius: 11.21,
		axis: 5.20,
		period: 4331,
		temp: 164.15,
		type: "local",
		angle: exo.randRange(-360,0)
	},
	{
		name: "Saturn",
		radius: 9.45,
		axis: 9.58,
		period: 10747,
		temp: 133.15,
		type: "local",
		angle: exo.randRange(-360,0)
	},
	{
		name: "Uranus",
		radius: 4.01,
		axis: 19.20,
		period: 30589,
		temp: 78.15,
		type: "local",
		angle: exo.randRange(-360,0)
	},
	{
		name: "Neptune",
		radius: 3.88,
		axis: 30.05,
		period: 59800,
		temp: 73.15,
		type: "local",
		angle: exo.randRange(-360,0)
	},
	{
		name: "Pluto",
		radius: 0.187,
		axis: 39.24,
		period: 90588,
		temp: 48.15,
		type: "local",
		angle: exo.randRange(-360,0)
	}
];


exo.createFill = function() {
	return function() {
		d3.select(this)
			.attr("fill", function(d) {
					//how to handle the negative values
				if (d.temp > 0 && d.temp) {
					return d3.hsl("hsl("+exo.scaleColor()(d.temp)+",100%, 55%)");
				}
				else if (d.temp <= 0 || !d.temp) {
					return d3.hsl("hsl(200,100%,100%)");
				}
		});
	};
}


exo.scaleRadial = function() {
		return this.select(".planetGroup").transition().duration(exo.duration)
			//translate the elements
				.attr("transform", function(d) {
					return "translate("+exo.scaleXRadial.axis()(d.axis)+",0)";
		});			
}

exo.scaleRings = function() {
		return this.transition().duration(exo.duration)
			//translate the elements
				.attr("r", function(d) {
					return exo.scaleXRadial.axis()(d.axis);
		});
			}

exo.radial = function() {
return function() {
// if we are expanding from nothing, don't transition the rotation (for explosion)
// if we are  transitioning from another viz, transition the rotation (for smooth folding)
// if we are iterating, transition the rotation but dont translate

	// hide the axes
	d3.selectAll(".rings").transition().duration(1000).style("opacity",1);


	d3.selectAll(".x, .y").each(function(){
			d3.select(this).transition()
		.duration(2000)
		.attr("opacity", "0");//.delay(2000).remove();
	});

	exo.planetStage.transition()
			.duration(exo.duration)
			.call(exo.centerRadialStage);

	//scale the planets
	exo.planets.call(exo.scaleRadial);
	exo.rings.call(exo.scaleRings);

	exo.planets.each(function(){
		var g = d3.select(this);
		//this will fold out circularly
		//translate the circle
	//		.each("end", function(d) {
				//need to interpolate between 0 and the angle
		//rotate the circles		
		g.transition()//.ease("sin", 1,0)
			.duration(4000)
			.ease("linear")
			.attrTween("transform", function(d) {
			return d3.interpolateString(
				"rotate("+ 0 +")",
				"rotate(" + g.datum().angle + ")"
			);
		})
				.each("end", exo.createOrbits(g.datum().angle));
		//	});


		//this feels hackish
		//rotate the group

		//restore this rather than the whole initial transition for explosion
		//this should be the only thing when starting the app
		/*g.transition().duration(exo.duration)
			.each(exo.createOrbits(g.datum().angle));*/


// how too store rotation data for when adding future text objects?
// store rotation data for updating transition speed?
// store original rotation and negate it
//		planets.select('.sun').append("text")
//				.text('yo!').each(exo.reverseOrbit(0));
			


	//move teh circle and text (make this a new group), translate the whole gropu	

		/*
		//this will explode out from a collapse state
		.duration(exo.duration)
			.attr("transform", "rotate(" + angle + ")")
			.each("end", function() {
				d3.select(this).transition()
				.duration(exo.duration)
				.attr("cx", function(d) {
					return exo.scaleX(d.axis);
				})
				.attr("cy", 0);
			});
		*/

	});

}
};



exo.createOrbits = function(angle) {
	return function() {
		d3.select(this)
			.transition()
			.ease("linear")
			//.attrTween("d",exo.tweenArc({value:0}));
			//.attr("transform", "translate(" + exo.width / 2 + "," + exo.height / 2 + ")")
			.duration(function(d,i){
				//var periodInYears = d.period/365;
				//console.log(periodInYears)
				//return periodInYears*30000
				return (exo.rDuration*(d.period/exo.PER));// /(2 * Math.PI);
			})
			.attrTween("transform", function(d) {
				return d3.interpolateString(
					"rotate("+ angle +")",
					"rotate(" + (angle - 360) + ")"
				);
			})

			//.attr("transform", "rotate(" + angle + ")")
			.each("end",exo.createOrbits(angle));
			//.attr("transform", "rotate(" + angle + ")")
		
	};
};

exo.reverseOrbit = function(angle) {
	return function() {
		var obj = d3.select(this)
		//var angle = 360-obj.datum().angle;
		obj//.select('text')
			.transition()
			.ease("linear")
			.duration(function(d,i){
				//var periodInYears = d.period/365;
				//console.log(periodInYears)
				//return periodInYears*30000
				return (exo.rDuration*(d.period/exo.PER));// earth rotation duration * the relative speed of the planet
			})
			.attrTween("transform", function(d) {
				return d3.interpolateString(
					"rotate("+ angle +")",
					"rotate(" + (angle + 360) + ")"
				);
			})
			.each("end",exo.reverseOrbit(angle));
	};
};



exo.graph = function(options) {
	//exo.containerWidth = (exo.width-exo.m.l-exo.m.r);

	//TODO:
	// make proper labels for each graph
	// get color scaling right
	// get sizing right transitioning from radial to graph modes.
	// get the width settings right
	// add planetlabeling that stays horizontal even within rotation

	this.options = {
		xScale: '',
		xLabel: '',
		yScale: '',
		yLabel: ''
	};
    var opt = $.extend({}, this.options, options);
	var xAxis = d3.svg.axis().scale(exo.scaleX[opt.xScale]()).ticks(10);//.tickSize(-exo.height).tickSubdivide(true)
	var yAxis = d3.svg.axis().scale(exo.scaleY[opt.yScale]()).ticks(10).orient('left');


	d3.selectAll(".rings").transition().duration(1000).style("opacity",0);

	exo.planetStage.transition()
			.duration(exo.duration)
			.attr("transform", "translate(" + exo.m.l + "," + exo.m.t + ")scale(1)");

			//instead of removing and reinstating, just update existing
			exo.planetStage.select(".axis.x").remove();
			exo.planetStage.append("g")
				.attr("transform", "translate(0," + (exo.height-exo.m.b-exo.m.t) + ")")
				.transition()
					.duration(exo.duration)
					.attr("class", "axis x")

				.call(xAxis);

			//instead of removing and reinstating, just update existing
			exo.planetStage.select(".x.label").remove();
			exo.planetStage.append("text")
				.attr("class", "x label")
				.attr("text-anchor", "end")
				.attr("x", exo.width-exo.m.l-exo.m.r)
				.attr("y", exo.height-exo.m.b-exo.m.t - 6)
				.text(opt.xLabel);


			//instead of removing and reinstating, just update existing
			exo.planetStage.select(".y.axis").remove();
			exo.planetStage.append("g").transition()
				.duration(exo.duration)
				.attr("class", "axis y")
				.call(yAxis);

			//y label
			//instead of removing and reinstating, just update existing
			exo.planetStage.select(".y.label").remove();
			exo.planetStage.append("text").transition()
				.duration(exo.duration)
				.attr("class", "y label")
				.attr("text-anchor", "end")
				.attr("y", 6)
				.attr("dy", ".75em")
				.attr("transform", "rotate(-90)")
				.text(opt.yLabel);

	exo.planets.each(function(){
		d3.select(this)
			.transition()
			.duration(exo.duration)
			.attr("transform", "rotate(0)")
			//.attr("transform", "translate(0,0)")
		//	.attr("transform", "translate("+ (exo.width / 2)*-1 +"0,0)")
		.select('.planetGroup')
			.transition()
			.duration(exo.duration)
			.attr("transform", function(d) {
				return "translate("+exo.scaleX[opt.xScale]()(d[opt.xScale])+","+exo.scaleY[opt.yScale]()(d[opt.yScale])+")";
			});
	});
};

exo.addRing = function(radius) {
	return function() {
			this.append("g")
				.attr("class", "rings")
				.append("circle")
					//.attr("cx", 0)
					//.attr("cy", 0)
					.attr("r", function(d){
						return exo.scaleXRadial.axis()(radius);
				});
}
};

exo.createLabelGroup = function() {
 return function() {
		//YOU ARE IN THE MIDDLE OF TRYING TO BIND THE STRIPPED ROTATION VALUE OF THE PARENT TO TEH GROUP INSIDE TO STABILIZE IT
		var rotation = d3.select(this).attr('transform');
		//this is a weird hack
			rotation = rotation.split("rotate(");
			rotation = parseFloat(rotation[1]);

		var selection = d3.select(this).select('.planetGroup');
		//var offset = d3.mouse(selection);
		//console.log(coords[0], offset[0], coords[1] , offset[1],(Math.atan2(coords[0] + offset[0], coords[1] - offset[1]) * (180/Math.PI)))
		
		//coord system of page x,y and circle offset have a reversed y coordinate system

		//you need to get the angle onhover  because you cant get current rotation angle without an expensive operation?
		//var angle = 360-(Math.atan2(coords[0] - offset[0], coords[1] + offset[1]) * (180/Math.PI));
		/*d3.select('.planetStage').append('circle')
			.attr('cx',coords[0] - offset[0])
			.attr('cy',coords[1] - offset[1])
			.attr('r', 3);*/

		var labelGroup = selection.append("g").attr("class", "labelGroup");
			labelGroup.append("text")
				.attr("x", function(d){
					return (d.radius*exo.ER)+36;
				})
				.text(function(d){
					return d.name;
				});
			labelGroup.append("circle")
				.attr("r", function(d){
					//this is not scaled or bounded
					return (d.radius*exo.ER)+10;
				});

			var line = labelGroup.append("svg:line")
				.attr("x1", function(d){
					return (d.radius*exo.ER)+10;
				})
				.attr("x2", function(d){
					return (d.radius*exo.ER)+30;
				})
				.attr("y1", 0)
				.attr("y2", 0);
			labelGroup.each(exo.reverseOrbit(360-rotation));
	};
};

exo.removeLabelGroup = function() {
	return function() {
		d3.select(this).select(".labelGroup").remove();
	};

};

exo.scaleStar = function(obj) {
	var sun = d3.select('.Sun').select("circle");
	var starData = obj.datum();
	sun.attr("r", function(d){
		return starData.rStar*exo.sun.radius;
	});
	sun.attr("fill", function(d){
		return d3.hsl("hsl("+exo.scaleColor()(starData.tStar)+",100%, 55%)");
	});
};

exo.calcPlanetTemp = function(tStar, rStar, axis) {
	if (tStar > 0 && rStar > 0 && axis > 0){
	//http://books.google.com/books?id=xekY6FuKuAcC&pg=PA138&lpg=PA138&dq=stefan+boltzmann+albedo+equilibrium+exoplanet&source=bl&ots=4jjL6Dcv2N&sig=XgjBdbdeKZaGjJlYMIk6iG56lmo&hl=en#v=onepage&q=stefan%20boltzmann%20albedo%20equilibrium%20exoplanet&f=false
	var albedo = 0.3; //planet reflectivity
	var fFactor = 1;  //atmostpheric circulation
	var rStar = rStar*7; // 7:150 is the ratio of the sun's radius to the earths semi-major axis
	var axis = axis*150
	//return (tStar*Math.pow(rStar/(2*axis),0.5))*Math.pow(fFactor*(1-albedo), 0.25);
	//return tStar(Math.pow(rStar/(2*axis),1/2))*Math.pow(fFactor*(1-albedo), 1/4);
	//http://en.wikipedia.org/wiki/Black-body_radiation#Temperature_relation_between_a_planet_and_its_star
	return tStar*Math.pow((rStar*Math.pow((1-albedo)/.7),0.5)/(2*axis),0.5);
		} else {
		return 0;
	}
};






exo.returnRadius = function(r) {
	//objects without radiii should be a different shape
	if (r && r>0) {
		return parseFloat(r);
	}
	else if (r && r<0) {return 1}
	else  {return 1;}
};

exo.filterDiscoveryMethod = function(shapes, method) {
// maybe: have the filtereing method within the graph rendering. if filtering is active, hide teh ones that arent filtered. But dont re-render

	var filter = shapes.select(function(d, i) {
			//console.log(d)
			if (d.type == method) {
				return i;
			} else {
				d3.select(this).transition().duration(1000).style("opacity",0);
			}
		});
	};


exo.scaleX = {
	// take the max axis value and scale it to fit within the width of the screen
	axis: function() {
		return d3.scale.linear()
			.domain([0, d3.max(exo.data, function(d){ return d.axis;})])
			.range([0,(exo.width-exo.m.l-exo.m.r)]);
		}
};

exo.scaleXRadial = {
	// take the max axis value and scale it to fit within the width of the screen
	axis: function() {
		return d3.scale.linear()
			.domain([0, d3.max(exo.data, function(d){ return d.axis;})])
			.range([0,((exo.width-exo.m.l-exo.m.r)/2)]);
		}
};


exo.scaleY = {
	radius : function() {
		return d3.scale.linear()
				//inverted y scale: bigger = up
				.domain([0, d3.max(exo.data, function(d){ return d.radius;}) ])
				.range([exo.height-exo.m.b-exo.m.t, 0]);
			},
	temp:  function() {
		return d3.scale.linear()
				//inverted y scale: bigger = up
				.domain([0, d3.max(exo.data, function(d){ return d.temp;}) ])
				.range([exo.height-exo.m.b-exo.m.t, 0]);
			},
	period:  function() {
		return d3.scale.linear()
				//inverted y scale: bigger = up
				.domain([0, d3.max(exo.data, function(d){ return d.period;}) ])
				.range([exo.height-exo.m.b-exo.m.t, 0]);
			}
};

exo.scaleColor = function() {
	return d3.scale.linear()
		.domain([0, d3.max(exo.data, function(d){ return d.temp;})])
		.range([256,0]);
	};



exo.renderPlanets = function() {	// join planet objects with initial (empty) data
return function() {
	exo.planets = exo.planetStage.selectAll(".item")
			.data(exo.data, function(d) { return d.name; });
			
	exo.planets.enter()
			.append("g")
			.attr("class",function(d,i){
				return "item index-"+i;
			})
			.attr("index", function(d, i) { return "index-" + i; })

			.append("g")
				.attr("class", function(d){
					return d.name + " planetGroup";
				})

			.append("circle")
					.attr("class", "planet")
					.attr("r", function(d){
						if (d.radius > 0) {
							return d.radius*exo.ER;
						}
						else {
							return 2;
						}
					})
					.each(exo.createFill());

	exo.planets.exit().remove();


	exo.planets.on("mouseover", function(d) {
		d3.select(this).each(exo.createLabelGroup());//, d3.select(this));
	});
	exo.planets.on("mouseout", function(d){
		d3.select(this).each(exo.removeLabelGroup());
	});
}	};

exo.renderList = function () {
	//add list of names
	var list = d3.select("#list").append("ul");
	var names = list.selectAll('.listItem')
		.data(exo.data)
		.enter()
		.append('li')
		.attr("data-index",function(d,i){
			return "index-"+i;
		})
		.attr("class",function(d,i){
			return "item index-"+i;
		})
		.text(function(d){
			return d.name;
		});

		names.on("mouseover", function(d) {
			var currClass = d3.select(this).attr("data-index");
			var obj = exo.planetStage.select("."+currClass);
			obj.each(exo.createLabelGroup());
			exo.scaleStar(obj);
			//console.log($("."+currClass))
		});

		names.on("mouseout", function(d) {
			var currClass = d3.select(this).attr("data-index");
			var obj = exo.planetStage.select("."+currClass);
			obj.each(exo.removeLabelGroup());
		});
}

exo.centerRadialStage = function() {
		return this.attr("transform", "translate(" + $(window).width() / 2 + "," + $(window).height() / 2 + ")");
	};


exo.scaleScale = function() {
		var newData = exo.data.filter(function(d) { return d.type != "local";});
		var newDataMax = d3.max(newData,function(d){ return d.axis;});

		var newWidth = d3.scale.linear()
			.domain([0, newDataMax])
			.range([0,(exo.width-exo.m.l-exo.m.r)]);
		//scale the entire dataset within the range of the new set
		return newWidth(d3.max(exo.data, function(d){ return d.axis;}));
		//exo.width = width;
};

$(function(){

d3.select("#viz").append("svg:svg")
	.attr("width", exo.width)
	.attr("height", exo.height)
	.append("g").attr("class", "planetStage");


//all planet-related objects go in here. translate it to the center of the screen for initial radial view

	exo.planetStage = d3.select(".planetStage").call(exo.centerRadialStage);

	//draw rings
	exo.rings = exo.planetStage.selectAll('.rings')
		.data(exo.solarSystem)
		.enter()
			.append("g")
				.attr("class", "rings")
				.append("circle")
		//.attr("cx", 0)
		//.attr("cy", 0)
			.attr("r", function(d){
				//console.log(exo.scaleXRadial.axis()(d.axis));
				return exo.scaleXRadial.axis()(d.axis);
	});
/*
d3.csv("data/planets2012_2.csv", function(data) {
	//Process 2012 kepler set
	data.forEach(function(d) {
		d.period = parseFloat(d.period);
		d.radius = parseFloat(d.radius);
		d.axis = parseFloat(d.axis);
		d.rStar = 1;
		d.tStar = 1;
		d.type = 'test';
		d.temp = exo.calcPlanetTemp(d.tStar,d.rStar,d.axis);
		d["angle"] = exo.randRange(-360,0);
	});
*/
/*
d3.csv("data/planets2012_2.csv", function(data) {
	//Process 2012 kepler set
	data.forEach(function(d) {
		d.period = parseFloat(d.period);
		d.radius = parseFloat(d.radius);
		d.axis = parseFloat(d.axis);
		d.temp = parseFloat(d.temp);
		d["angle"] = exo.randRange(-360,0);
	});
*/
/*

d3.csv("data/exoplanet.eu_catalog.csv", function(data) {

	 data.forEach(function(d) {
		d.name = d.name;
		d.period = parseFloat(d.period);
		d.radius = exo.returnRadius(d.radius);
		d.axis = parseFloat(d.axis);
		d.rStar = parseFloat(d["star.radius"]);
		d.tStar = parseFloat(d["star.teff"])
		d.type = d.detection_type;
		d.temp = exo.calcPlanetTemp(d.tStar,d.rStar,d.axis);
		d["angle"] = exo.randRange(-360,0);
	});
*/
d3.csv("data/exoplanetdb.csv", function(data) {

	 data.forEach(function(d) {
		d.name = d.NAME;
		d.period = parseFloat(d.PER);
		d.radius = exo.returnRadius(d.R);
		d.axis = parseFloat(d.A);
		d.rStar = parseFloat(d.RSTAR);
		d.tStar = parseFloat(d.TEFF)
		d.type = d.DISCMETH;
		d.temp = exo.calcPlanetTemp(d.tStar,d.rStar,d.axis);
		d["angle"] = exo.randRange(-360,0);
	});

	 //structure the data by detection type
	/*var nestedData = d3.nest()
		.key(function(d) {return d.type.toLowerCase();})
		.entries(data)*/

	// merge the solar system data with the returned dataset
	exo.dataSet = exo.solarSystem.concat(data);

	//exo.planets.call(exo.scaleRadial)

	//EVENTS DEPEND ON EXTERNAL DATASET LOADING




	$('#start').click(function(){
		exo.rDuration = 60000;
		exo.data = exo.dataSet.filter(function(d) { return d.type == "local"; });//.concat(exo.data);

		//exo.planets.filter(function(d) { return d.type == "local"}).each(exo.createLabelGroup());

		//exo.renderList();

		exo.planetStage.call(exo.renderPlanets());
		exo.planetStage.call(exo.radial());

/*
		var newWidth = d3.scale.linear()
			.domain([0, d3.max(exo.data, function(d){ return d.axis;})])
			.range([0,(exo.width-exo.m.l-exo.m.r)]);
		//scale the entire dataset within the range of the new set
		exo.width = newWidth(d3.max(exo.data, function(d){ return d.axis;}));
		
*/
		$("#orbits").click();

		
	});

	$('#all').click(function(){
		exo.rDuration = 360000;
		exo.data = exo.dataSet;

		$('#graph-type').find('.active').click();

//remove this 
		if ($('#orbits').hasClass('active')) {
			exo.width = 6369
		}


	});
	$('#rv').click(function(){
		exo.rDuration = 360000;		
		exo.data = exo.dataSet.filter(function(d) { return d.type == "RV" || d.type == "local";} );
		
//remove this 
		if ($('.radial').hasClass('active')) {
			exo.width = 36180
		}


		$('#graph-type').find('.active').click();
	});
	$('#transit').click(function(){
		exo.rDuration = 360000;		
		exo.data = exo.dataSet.filter(function(d) { return d.type == "Transit" || d.type == "local"; });

		$('#graph-type').find('.active').click();

//remove this 
		if ($('#orbits').hasClass('active')) {
			exo.width = 198770
		}


	});

	$('#orbits').click(function(){
		//exo.data = exo.dataSet.filter(function(d) { return d.type == "RV" || d.type == "local"; });
		//exo.rDuration = 360000;
		//exo.renderList();

		exo.planetStage.call(exo.renderPlanets());
		exo.planetStage.call(exo.radial());
	});
/*
		var newData = exo.dataSet.filter(function(d) { return d.type != "local";});
		var newDataMax = d3.max(newData,function(d){ return d.axis;});

		var newWidth = d3.scale.linear()
			.domain([0, newDataMax])
			.range([0,(exo.width-exo.m.l-exo.m.r)]);
		//scale the entire dataset within the range of the new set
		exo.width = newWidth(d3.max(exo.dataSet, function(d){ return d.axis;}));
*/



/*
	$('#rv').click(function(){
				exo.data = exo.data.filter(function(d) { return d.type != "local";} );
				exo.planetStage.call(exo.renderPlanets());
				exo.planetStage.call(exo.radial());
			//exo.filterDiscoveryMethod(planets, 'RV');
	});


/*	$('#transit').click(function(){
				exo.data = exo.data.filter(function(d) { return d.type != "local";} );
				exo.planetStage.call(exo.renderPlanets());
				exo.planetStage.call(exo.radial());

*/
/*
		exo.data = confirmedData//.concat(exo.data);
		
		var dataMax = d3.max(confirmedData, function(d){ return d.axis;})

		var newWidth = d3.scale.linear()
			.domain([0, dataMax])
			.range([0,(exo.width-exo.m.l-exo.m.r)]);
		//scale the entire dataset within the range of the new set
		exo.width = newWidth(d3.max(exo.data, function(d){ return d.axis;}));
		//exo.planetStage = d3.select(".planetStage").call(exo.radialStage);

		exo.planetStage.call(exo.renderPlanets());
		exo.planetStage.call(exo.radial());
		//exo.planets.call(exo.scaleRadial)
		
	}) */

	$('#graph1').click(function(){
			exo.width = $(window).width()
			exo.data = exo.data.filter(function(d) { return d.type != "local";} );
			exo.planetStage.call(exo.renderPlanets())
			exo.graph({
				stage: exo.planetStage,
				shapes: exo.planets,
				xScale: "axis",
				xLabel: "Earth Distance",
				yScale: "temp",
				yLabel: "Temperature"
			});
	});

	$('#graph2').click(function(){
			exo.width = $(window).width()
			exo.data = exo.data.filter(function(d) { return d.type != "local";} );
			exo.planetStage.call(exo.renderPlanets())			
			exo.graph({
				stage: exo.planetStage,
				shapes: exo.planets,
				xScale: "axis",
				xLabel: "Earth Distance",
				yScale: "radius",
				yLabel: "Planet Size"
			});
	});

	$('#graph3').click(function(){
			exo.width = $(window).width()
			exo.data = exo.data.filter(function(d) { return d.type != "local";} );
			exo.planetStage.call(exo.renderPlanets())			
			exo.graph({
				stage: exo.planetStage,
				shapes: exo.planets,
				xScale: "axis",
				xLabel: "Earth Distance",
				yScale: "period",
				yLabel: "Period"
			});
	});	
	
	$('#solarLabels').toggle(
		function(){
			exo.planets.filter(function(d) { return d.type == "local"}).each(exo.createLabelGroup());
		},
		function(){
			exo.planets.filter(function(d) { return d.type == "local"}).each(exo.removeLabelGroup());
		}
	)

	});






/*
			.attr("cx", function(d) {
				return x(d.axis*exo.AU);
			})
			.attr("cy", function(d) {
			//	return y(d.temp);
			})
			.attr("r", function(d){
				//this is not scaled or bounded
				return d.radius*exo.ER;
			})
			.attr("fill", function(d) {
				//how to handle the negative values
				if (d.temp > 0) {
					return d3.hsl("hsl("+color(Math.sqrt(d.temp))+",100%, 50%)");
				}
				else {
					return d3.hsl("hsl(200,100%, 50%");
				}
			});*/

$("#viz").click(function(){







});


/*bar tut

viz.append("svg:rect")
	.attr("x", 100)
	.attr("y", 100)
	.attr("height", 100)
	.attr("width",200);

	//console.log(data)
	var barWidth = 40;
	var width = (barWidth + 10) * data.length;
	var height = 200;


	var x = d3.scale.linear()
		.domain([0,data.length])
		.range([0,width]);

	var y = d3.scale.linear()
		.domain([0,data.length])
		.range([0,width]);

*/


// DAT gui controls
var gui = new dat.GUI();
var amountChanger = gui.add(exo.dat,"Amount", 1, 100);
var scaleChanger = gui.add(exo.dat,"Amount", $(window).width(),500000);
var rotationChanger = gui.add(exo.dat,"Amount", 30000,100000);

amountChanger.onChange(function(value) {
  d3.selectAll(".planet")
		.attr("r", function(d){
			//this is not scaled or bounded
			return d.radius*value*.01;
		});
});

scaleChanger.onChange(function(value) {

exo.width = value; 
exo.planets.call(exo.scaleRadial);
	exo.rings.call(exo.scaleRings);

 // d3.select(".planetStage")
  		//.attr("transform", )
		//.call(exo.centerRadialStage)
	//.attr("transform", "scale("+value+")")
});


rotationChanger.onChange(function(value) {
	exo.YEAR = 50000;
		viz.selectAll(".planet").each(exo.randomOrbit())
	// how to change speed of rotation
	// prevent the animation from reinterpolating only every rotatation
	// reinterpolate every frame so the new year can be detected?
});


});


//hide all but the first text



