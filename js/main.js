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
exo.dat = exo.dat || {};

exo.dat = {
	"Amount": .5
}
exo.duration = 4000;
exo.width = $('#viz').width();
exo.height = $('#viz').height();

exo.m = {t: 80, r: 80, b: 80, l: 80};
exo.containerWidth = exo.width;

exo.renderWidth = function() {
	return exo.containerWidth-exo.m.l-exo.m.r;
}


// Conversion constants
exo.deg = 0;

exo.ER = 1;           // Earth Radius, in pixels

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

// This is a zero-one weight that controls whether the planets are flat on the
// plane (0) or not (1)
exo.flatness = 0;
exo.tflatness = 0;

exo.randRange = function(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


exo.createPlanets = function() {
	d3.select(this)
			.attr("r", function(d){
				//this is not scaled or bounded
				return d.radius*exo.ER;
			})
			.attr("fill", function(d) {
				//how to handle the negative values
				if (d.temp > 0) {
					return d3.hsl("hsl("+exo.scaleColor(d.temp)+",100%, 55%)");
				}
				else {
					return d3.hsl("hsl(200,100%, 100%");
				}
			});
};

exo.radial = function(shapes, stage) {

// if we are expanding from nothing, don't transition the rotation (for explosion)
// if we are  transitioning from another viz, transition the rotation (for smooth folding)
// if we are iterating, transition the rotation but dont translate

	// hide the axes
	d3.selectAll(".x, .y").each(function(){
			d3.select(this).transition()
		.duration(2000)
		.attr("opacity", "0");//.delay(2000).remove();
	});


	stage.transition()
			.duration(exo.duration)
			.attr("transform", "translate(" + exo.width / 2 + "," + exo.height / 2 + ")");

	shapes.each(function(){
		var g = d3.select(this);
 

		//this will fold out circularly
		//translate the circle
		g.select(".planetGroup").transition().duration(exo.duration)
			.attr("transform", function(d) {
				return "translate("+exo.scaleXRadial.axis(d.axis)+",0)";
			});
		//this feels hackish
		//rotate the group
		g.transition().duration(exo.duration)
			.each(exo.createOrbits(g.datum().angle));


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
				return (exo.YEAR*d.period);// /(2 * Math.PI);
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

//subtract this by 90?

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
				return (exo.YEAR*d.period);// /(2 * Math.PI);
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
		shapes: '',
		stage: '',
		xScale: '',
		xLabel: '',
		yScale: '',
		yLabel: ''
	};
    var opt = $.extend({}, this.options, options);
	var xAxis = d3.svg.axis().scale(exo.scaleX[opt.xScale]).ticks(10);//.tickSize(-exo.height).tickSubdivide(true)
	var yAxis = d3.svg.axis().scale(exo.scaleY[opt.yScale]).ticks(10).orient('left');

	opt.stage.transition()
			.duration(exo.duration)
			.attr("transform", "translate(" + exo.m.l + "," + exo.m.t + ")scale(1)");

			//instead of removing and reinstating, just update existing
			opt.stage.select(".axis.x").remove();
			opt.stage.append("g").transition()
				.duration(exo.duration)
				.attr("class", "axis x")
				.attr("transform", "translate(0," + (exo.height-exo.m.b-exo.m.t) + ")")
				.call(xAxis);

			//instead of removing and reinstating, just update existing
			opt.stage.select(".x.label").remove();
			opt.stage.append("text").transition()
				.duration(exo.duration)
				.attr("class", "x label")
				.attr("text-anchor", "end")
				.attr("x", exo.width-exo.m.l-exo.m.r)
				.attr("y", exo.height-exo.m.b-exo.m.t - 6)
				.text(opt.xLabel);


			//instead of removing and reinstating, just update existing
			opt.stage.select(".y.axis").remove();
			opt.stage.append("g").transition()
				.duration(exo.duration)
				.attr("class", "axis y")
				.call(yAxis);

			//y label
			//instead of removing and reinstating, just update existing
			opt.stage.select(".y.label").remove();
			opt.stage.append("text").transition()
				.duration(exo.duration)
				.attr("class", "y label")
				.attr("text-anchor", "end")
				.attr("y", 6)
				.attr("dy", ".75em")
				.attr("transform", "rotate(-90)")
				.text(opt.yLabel);

	opt.shapes.each(function(){
		d3.select(this)
			.transition()
			.duration(exo.duration)
			.attr("transform", "rotate(0)")
			//.attr("transform", "translate(0,0)")
		//	.attr("transform", "translate("+ (exo.width / 2)*-1 +"0,0)")
			.attr("transform", function(d) {
				return "translate("+exo.scaleX[opt.xScale](d[opt.xScale])+","+exo.scaleY[opt.yScale](d[opt.yScale])+")";
			});
	});
};

exo.addRing = function(stage, radius) {
	stage.append("g")
				.attr("class", "rings")
				.append("circle")
					//.attr("cx", 0)
					//.attr("cy", 0)
					.attr("r", function(d){
						return exo.scaleXRadial.axis(radius);
				});
};

exo.createLabelGroup = function(coords, selection) {

		//YOU ARE IN THE MIDDLE OF TRYING TO BIND THE STRIPPED ROTATION VALUE OF THE PARENT TO TEH GROUP INSIDE TO STABILIZE IT

		selection = d3.select(selection).select('.planetGroup')
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
				.attr("x", 33)
				.text(function(d){
					return d.koi;
				});
			labelGroup.append("svg:line")
				.attr("x1", 0)
				.attr("x2", 30)
				.attr("y1", 0)
				.attr("y2", 0);
			labelGroup.each(exo.reverseOrbit(360-coords));
};

exo.removeLabelGroup = function(selection) {
	selection.select(".labelGroup").remove();
};


$(function(){
//exo.getPlanets()

d3.select("#viz").append("svg:svg")
	.attr("width", exo.width)
	.attr("height", exo.height)
	.append("g").attr("class", "planetStage");


d3.csv("data/planets2012_2.csv", function(data) {
	//Process the data
	data.forEach(function(d) {
		d.period = parseFloat(d.period);
		d.radius = parseFloat(d.radius);
		d.axis = parseFloat(d.axis);
		d.temp = parseFloat(d.temp);
		d["angle"] = exo.randRange(-180,180);
	});

	//data dependent functions
	exo.minTemp =  d3.min(data, function(d){ return Math.sqrt(Math.abs(d.temp));});
	exo.maxTemp =  d3.max(data, function(d){ return Math.sqrt(d.temp);});

	exo.scaleX = {
		// take the max axis value and scale it to fit within the width of the screen
		axis: d3.scale.linear()
				.domain([0, d3.max(data, function(d){ return d.axis;})])
				.range([0,(exo.width-exo.m.l-exo.m.r)])
	};

	exo.scaleXRadial = {
		// take the max axis value and scale it to fit within the width of the screen
		axis: d3.scale.linear()
				.domain([0, d3.max(data, function(d){ return d.axis;})])
				.range([0,(exo.width-exo.m.l-exo.m.r)*3])
	};


	exo.scaleY = {
		radius : d3.scale.linear()
					//inverted y scale: bigger = up
					.domain([0, d3.max(data, function(d){ return d.radius;}) ])
					.range([exo.height-exo.m.b-exo.m.t, 0]),
		temp:  d3.scale.linear()
					//inverted y scale: bigger = up
					.domain([0, d3.max(data, function(d){ return d.temp;}) ])
					.range([exo.height-exo.m.b-exo.m.t, 0])
	};

	exo.scaleColor = d3.scale.linear()
		.domain([0, d3.max(data, function(d){ return d.temp;})])
		.range([256,0]);




	//create and translate the initial group
	var planetStage = d3.select(".planetStage").attr("transform", "translate(" + exo.width / 2 + "," + exo.height / 2 + ")");

	//Add our solar system and underlying rings

	//SUN
	var sunData = {
		angle: exo.randRange(-180,180),
		koi: "sun",
		period: 10,
		radius: 3,
		axis: 0,
		temp: 254
	};
	data.push(sunData);

	//EARTH
	var earthData = {
		angle: exo.randRange(-180,180),
		koi: "earth",
		period: 365,
		radius: 1,
		axis: exo.AU,
		temp: 254
	};
	data.push(earthData);
	exo.addRing(planetStage, earthData.axis);


	//add the planets
	var planets = planetStage.selectAll(".item")
					.data(data)
					.enter()
					.append("g")
					.attr("class","item");


	var planetObj = planets.append("g")
			.attr("class", function(d){
				return d.koi + " planetGroup";
			});

		planets.on("mouseover", function(d) {
			var rotation = d3.select(this).attr('transform');
			//this is a weird hack
				rotation = rotation.split("rotate(");
				rotation = parseFloat(rotation[1]);
			//exo.createLabelGroup([d3.event.x-(exo.width/2), d3.event.y-(exo.height/2)], this);
			exo.createLabelGroup(rotation, this);
				});
		planetObj.on("mouseout", function(d){
			exo.removeLabelGroup(d3.select(this));
		});

		planetObj.append("circle")
					.attr("class", "planet")
						.each(exo.createPlanets);







	$('#radial').click(function(){
			exo.radial(planets, planetStage);
	});
	$('#graph1').click(function(){
			exo.graph({
				stage: planetStage,
				shapes: planets,
				xScale: "axis",
				xLabel: "Earth Distance",
				yScale: "temp",
				yLabel: "Temperature"
			});
	});

	$('#graph2').click(function(){
			exo.graph({
				stage: planetStage,
				shapes: planets,
				xScale: "axis",
				xLabel: "Earth Distance",
				yScale: "radius",
				yLabel: "Planet Size"
			});
	});

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
var scaleChanger = gui.add(exo.dat,"Amount", 0,1);
var rotationChanger = gui.add(exo.dat,"Amount", 30000,100000);

amountChanger.onChange(function(value) {
  d3.selectAll(".planet")
		.attr("r", function(d){
			//this is not scaled or bounded
			return d.radius*value*.01;
		});
});

scaleChanger.onChange(function(value) {

  d3.select(".planetStage")
  		//.attr("transform", )
		.attr("transform", "translate(" + exo.width / 2 + "," + exo.height / 2 + ") scale("+value+")");
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



