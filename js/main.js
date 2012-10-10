
//planets and exoplanets as different datasets will simplify rendering
//create a method to hide planets that are too close to the center because of scale
//INSET MAP OF SCALE
//IS IT FASTER TO USE A CSS TRANFORM ON EACH RENDERED LAYER RATHER THAN SVG?

var exo = exo || {};

exo.data = [];
exo.dat = exo.dat || {};

exo.dat = {
	"Size":1,
	"Scale":1,
	"Rotation":1

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


exo.plotRadial = true;

// Conversion constants
exo.deg = 0;
exo.PER = 365.2; //days
exo.ER = 1;           // Earth Radius, in pixels
exo.SR = 2; //sun is 110 the earth
//radius of earth 1/4 of the screen
exo.AU = 1; //$('#viz').width()/4;        // Astronomical Unit, in pixels
exo.YEAR = 15000;     // One year, in frames

// Axis labels
exo.xLabel = "Semi-major Axis (Astronomical Units)";
exo.yLabel = "Temperature (Kelvin)";


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
		name: "Sun",
		period: 0,
		radius: exo.SR,
		axis: 0,
		temp: 737.15,
		//temp: 5778,
		type: "local",
		angle: exo.randRange(-360,0)
	},
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
		var color = function(d) {
				if (d.temp > 0 && d.temp) {
					return d3.hsl("hsl("+exo.scaleColor()(d.temp)+",100%, 55%)");
				}
				else if (d.temp <= 0 || !d.temp) {
					return d3.hsl("hsl(200,100%,100%)");
				}
		};
		d3.select(this)
			.attr("fill", function(d) {
				return color(d);
			})
			.attr("stroke", function(d) {
				return color(d);
			});
	};
}


exo.scaleRadial = function() {
		return this.select(".planetGroup")
			.transition().duration(exo.duration)
			//translate the elements
				.attr("transform", function(d) {
					return "translate("+exo.scaleXRadial.axis()(d.axis)+",0)";
				})
				.each("end", function(d,i) {
					//when things are done scaling, show the planet labels. Bind this to a trigger and render elsewhere?
					if (i===0) {
						exo.planets.filter(function(d) { return d.type == "local" && d.name != "Sun"; }).each(exo.createLabelGroup());
					}
				});
};


exo.scaleSun = function() {
		return this.transition().duration(exo.duration)
			//translate the elements
				.attr("r", function(d) {
					return exo.scaleXRadial.radiusSun()(d.radius);
		});
			};

exo.scaleRings = function() {
		return this.transition().duration(exo.duration)
			//translate the elements
				.attr("r", function(d) {
					return exo.scaleXRadial.axis()(d.axis);
		})
			};

exo.radial = function() {
return function() {
// if we are expanding from nothing, don't transition the rotation (for explosion)
// if we are  transitioning from another viz, transition the rotation (for smooth folding)
// if we are iterating, transition the rotation but dont translate

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
	//exo.planets.each(exo.removeLabelGroup());
	exo.planets.call(exo.scaleRadial);

	exo.rings.call(exo.scaleRings);
	d3.select('.Sun').select("circle").call(exo.scaleSun);

	exo.planets.each(function(){
		var g = d3.select(this);

		if (!exo.plotRadial) {
			//this will fold out radially
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
		} else {
			//this will explode out
			g.transition().duration(exo.duration)
				.each(exo.createOrbits(g.datum().angle));
		}

	});

	exo.plotRadial = true;

	};
};


exo.createOrbits = function(angle) {
	return function() {
		d3.select(this)
			.transition()
			.ease("linear")
			.duration(function(d,i){
				return (exo.rDuration*(d.period/exo.PER));// /(2 * Math.PI);
			})
			.attrTween("transform", function(d) {
				return d3.interpolateString(
					"rotate("+ angle +")",
					"rotate(" + (angle - 360) + ")"
				);
			})
			.each("end",exo.createOrbits(angle));
	};
};

exo.reverseOrbit = function(angle) {
	return function() {
		var obj = d3.select(this);
		obj.transition()
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

exo.stopOrbit = function() {
	return function() {
		this.select('.labelGroup').transition().attr("transform","rotate(0)");
	};
}


exo.graph = function(options) {
	exo.plotRadial = false;

	this.options = {
		xScale: '',
		xLabel: '',
		yScale: '',
		yLabel: ''
	};
    var opt = $.extend({}, this.options, options);
    if (exo.solar) {
		var xAxis = d3.svg.axis().scale(exo.scaleXSolar[opt.xScale]()).ticks(10);//.tickSize(-exo.height).tickSubdivide(true)
		var yAxis = d3.svg.axis().scale(exo.scaleYSolar[opt.yScale]()).ticks(10).orient('left');

    }
    else {
		var xAxis = d3.svg.axis().scale(exo.scaleX[opt.xScale]()).ticks(10);//.tickSize(-exo.height).tickSubdivide(true)
		var yAxis = d3.svg.axis().scale(exo.scaleY[opt.yScale]()).ticks(10).orient('left');

    }

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
				.select('.planetGroup')
					.transition()
					.duration(exo.duration)
					.attr("transform", function(d) {
						//console.log(d,opt.yScale,exo.scaleX[opt.xScale]()(d[opt.xScale])), exo.scaleY[opt.yScale]()(d[opt.yScale])
						if (exo.solar) {
							return "translate("+exo.scaleXSolar[opt.xScale]()(d[opt.xScale])+","+exo.scaleYSolar[opt.yScale]()(d[opt.yScale])+")";
						} else {
							return "translate("+exo.scaleX[opt.xScale]()(d[opt.xScale])+","+exo.scaleY[opt.yScale]()(d[opt.yScale])+")";
						}
						})
				.select('.labelGroup').attr("transform", "rotate(0)");
			});
};

exo.addRing = function(radius) {
	return function() {
			this.append("g")
				.attr("class", "rings")
				.append("circle")
					.attr("r", function(d){
						return exo.scaleXRadial.axis()(radius);
				});
			};
};

exo.createLabelGroup = function() {
 return function() {
		//YOU ARE IN THE MIDDLE OF TRYING TO BIND THE STRIPPED ROTATION VALUE OF THE PARENT TO TEH GROUP INSIDE TO STABILIZE IT


		var selection = d3.select(this).select('.planetGroup');
		//var offset = d3.mouse(selection);
		//you need to get the angle onhover  because you cant get current rotation angle without an expensive operation?
		//var angle = 360-(Math.atan2(coords[0] - offset[0], coords[1] + offset[1]) * (180/Math.PI));

		var labelGroup = selection.append("g").attr("class", "labelGroup");
			labelGroup.style("opacity",0);
			labelGroup.append("text")
				.attr("x", function(d){
					return (d.radius*exo.ER)+36;
				})
				.attr("y", 4)
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

			d3.select(this).call(exo.refreshLabelPosition());

	};
};

exo.refreshLabelPosition = function() {
	return function() {
			if (exo.plotRadial) {
				var rotation = this.attr('transform');
				//this is a weird hack
				rotation = rotation.split("rotate(");
				rotation = parseFloat(rotation[1]);
				this.select('.labelGroup')
					.transition().duration(200)
						.style("opacity",1)
					.each(exo.reverseOrbit(360-rotation));
							
				/*this.select('.labelGroup').transition().duration(4000)
				.ease("linear")
				.attrTween("transform", function(d) {
				return d3.interpolateString(
					"rotate("+ rotation +")",
					"rotate(" + this.datum().angle + ")"
				);})*/
			} else {
				this.select('.labelGroup')
				.transition().duration(200)
				.style("opacity",1)
				.call(exo.stopOrbit);
			}
	};
}

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
	var axis = axis*150;
	//return (tStar*Math.pow(rStar/(2*axis),0.5))*Math.pow(fFactor*(1-albedo), 0.25);
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
	else if (r && r<0) {return 1;}
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
		//this filter takes out the solar system planets
		//THIS IS NOT EFFICIENT
			.domain([0, d3.max(exo.data.filter(function(d) { return d.type != "local";} ), function(d){ return d.axis;})])
			.range([0,(exo.width-exo.m.l-exo.m.r)]);
		}
		//log scale
		/*return d3.scale.log()
			.domain([d3.min(exo.data, function(d){ return d.axis;}), d3.max(exo.data, function(d){ return d.axis;})])
			.range([0,(exo.width-exo.m.l-exo.m.r)]);
		}*/
};

//THIS IS NOT A GOOD SOLUTION
exo.scaleXSolar = {
	// take the max axis value and scale it to fit within the width of the screen
	axis: function() {
		return d3.scale.linear()
		//this filter takes out the solar system planets
		//THIS IS NOT EFFICIENT
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
		},
	radiusSun: function() {
		return d3.scale.linear()
			.domain([0, d3.max(exo.data, function(d){ return d.radius;})])
			.range([0,((exo.width-exo.m.l-exo.m.r)/650)]);
		}
};


exo.scaleY = {
	radius : function() {
		return d3.scale.linear()
				//inverted y scale: bigger = up
				.domain([0, d3.max(exo.data.filter(function(d) { return d.type != "local";} ), function(d){ return d.radius;}) ])
				.range([exo.height-exo.m.b-exo.m.t, 0]);
			},
	temp:  function() {
		return d3.scale.linear()
				//inverted y scale: bigger = up
				.domain([0, d3.max(exo.data.filter(function(d) { return d.type != "local";} ), function(d){ return d.temp;}) ])
				.range([exo.height-exo.m.b-exo.m.t, 0]);
			},
	period:  function() {
		return d3.scale.linear()
				//inverted y scale: bigger = up
				.domain([0, d3.max(exo.data.filter(function(d) { return d.type != "local";} ), function(d){ return d.period;}) ])
				.range([exo.height-exo.m.b-exo.m.t, 0]);
			}
};

//THIS IS NOT A GOOD SOLUTION
exo.scaleYSolar = {
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
					.each(exo.createFill())
					.attr("class", function(d){
						if (d.radius > 0) {
							return "planet";
						} else {
							return "planet-no-radius";
						}
					})
					.attr("r", function(d){
						if (d.radius > 0) {
							return d.radius*exo.ER;
						}
						else {
							d.radius = 2;
							return 2;
						}
					});

		exo.planets.exit().remove();

		exo.planets.filter(function(d) { return d.type != "local";}).on("mouseover", function(d) {
				d3.select(this).each(exo.createLabelGroup());//, d3.select(this));
		});
		exo.planets.filter(function(d) { return d.type != "local";}).on("mouseout", function(d){
			d3.select(this).each(exo.removeLabelGroup());
		});
	};
};

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
};

exo.centerRadialStage = function() {
		return this.attr("transform", "translate(" + $(window).width() / 2 + "," + $(window).height() / 2 + ")");
	};


exo.scaleScale = function() {
	var newData = exo.data;
	if (!exo.solar) {
		newData = exo.data.filter(function(d) { return d.type != "local";} );
	}
		var filteredMax = d3.max(newData,function(d){ return d.axis;});
		var newWidth = d3.scale.linear()
			.domain([0, filteredMax])
			.range([0,($(window).width())]);
		//scale the entire dataset within the range of the new set
		return newWidth(d3.max(exo.dataSet, function(d){ return d.axis;}));
};

$(function(){

	d3.select("#viz").append("svg:svg")
		.attr("width", exo.width)
		.attr("height", exo.height)
		.append("g").attr("class", "planetStage");

	var resetZoom = function() {
				$('#zoom').find('.num').text("20x");
				$('#zoom').removeClass('zoomout').addClass('zoomin');
			};

	$('#zoom').click(
		function() {
			if ($(this).hasClass('zoomin')) {
				exo.width = exo.width*20;
				exo.planets.call(exo.scaleRadial);
				exo.rings.call(exo.scaleRings);
				$('#zoom').find('.num').text("1x");
				$('#zoom').removeClass('zoomin').addClass('zoomout');
			} else if ($(this).hasClass('zoomout')) {
				$('#data-type').find('.active').click();
				resetZoom();
			}
		});


	exo.planetStage = d3.select(".planetStage").call(exo.centerRadialStage);

	//draw rings
	exo.rings = exo.planetStage.selectAll('.rings')
		.data(exo.solarSystem)
		.enter()
			.append("g")
				.attr("class", "rings")
				.append("circle")
				.attr("r", function(d){
					//console.log(exo.scaleXRadial.axis()(d.axis));
					return exo.scaleXRadial.axis()(d.axis);
				});

	d3.csv("data/NasaExoplanetArchive.csv", function(data) {
		data.forEach(function(d) {
			d.name = d.pl_hostname + ' ' + d.pl_letter;
			d.period = parseFloat(d.pl_orbper);
			d.radius = parseFloat(d.pl_rade);
			d.axis = parseFloat(d.pl_orbsmax);
			d.rStar = parseFloat(d.st_rad);
			d.tStar = parseFloat(d.st_teff);
			d.type = d.pl_discmethod;
			d.temp = exo.calcPlanetTemp(d.tStar,d.rStar,d.axis);
			d["angle"] = exo.randRange(-360,0);
		});


		// merge the solar system data with the returned dataset
		exo.dataSet = exo.solarSystem.concat(data);


		$('#orbits').click(function(){
			//exo.renderList();
			exo.width = exo.scaleScale();
			exo.planetStage.call(exo.renderPlanets());
			exo.planetStage.call(exo.radial());
			$('#zoom').fadeIn();
		});

		//launch initial parameters
		$('#solarSystem').click(function(){
			resetZoom();
			exo.solar = true;
			exo.rDuration = 30000;
			exo.data = exo.dataSet.filter(function(d) { return d.type == "local"; });//.concat(exo.data);
			exo.width = $(window).width();
			$('#graph-type').find('.active').click();
		});

		$("#solarSystem").click();




		$('#rv').click(function(){
			resetZoom();
			exo.solar = false;
			exo.rDuration = 360000;
			exo.data = exo.dataSet.filter(function(d) { return d.type == "Radial Velocity" || d.type == "local";} );

			//exo.planets.filter(function(d) { return d.type == "local" && d.name != "Sun";});
			//	.transition().duration(3000).delay(4000)
			//	.each(exo.createLabelGroup());

			$('#graph-type').find('.active').click();
		});
		$('#transit').click(function(){
			resetZoom();
			exo.solar = false;
			exo.rDuration = 360000;
			exo.data = exo.dataSet.filter(function(d) { return d.type == "Transit" || d.type == "local"; });
			$('#graph-type').find('.active').click();

		});

		$('#all').click(function(){
			exo.solar = false;
			exo.rDuration = 360000;
			exo.data = exo.dataSet.filter(function(d) { return d.type != "Imaging";} );

		});


		$('#graph1').click(function(){
				$('#zoom').fadeOut();	
				exo.width = $(window).width();
				//exo.data = exo.data.filter(function(d) { return d.type != "local";} );
				exo.planetStage.call(exo.renderPlanets());
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
				$('#zoom').fadeOut();			
				exo.width = $(window).width();
				//exo.data = exo.data.filter(function(d) { return d.type != "local";} );
				exo.planetStage.call(exo.renderPlanets());
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
				$('#zoom').fadeOut();			
				exo.width = $(window).width();
				//exo.data = exo.data.filter(function(d) { return d.type != "local";} );
				exo.planetStage.call(exo.renderPlanets());
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
				exo.planets.filter(function(d) { return d.type == "local" && d.name != "Sun";}).each(exo.createLabelGroup());
			},
			function(){
				exo.planets.filter(function(d) { return d.type == "local";}).each(exo.removeLabelGroup());
			}
		);
		
		
	});


	// DAT gui controls
	var gui = new dat.GUI();
	var amountChanger = gui.add(exo.dat,"Size", -100, 100);
	var scaleChanger = gui.add(exo.dat,"Scale", $(window).width()/2,500000);
	var rotationChanger = gui.add(exo.dat,"Rotation", 15000,1000000);

	amountChanger.onChange(function(value) {
		d3.selectAll(".planet")
			.attr("r", function(d){
				//this is not scaled or bounded
				return (d.radius*exo.ER)+value;
			});
	});

	scaleChanger.onChange(function(value) {
		exo.width = value;
		exo.planets.call(exo.scaleRadial);
			exo.rings.call(exo.scaleRings);
	});


	rotationChanger.onChange(function(value) {
		exo.rDuration = value;
			exo.planetStage.call(exo.renderPlanets());
			exo.planetStage.call(exo.radial());
	});


});


