//IS IT FASTER TO USE A CSS TRANFORM ON EACH RENDERED LAYER RATHER THAN SVG?


var exo = exo || {};
exo.dat = exo.dat || {};

exo.dat = {
	"Amount": .5
}

exo.width = $('#viz').width();
exo.height = $('#viz').height();
exo.m = {t: 80, r: 80, b: 80, l: 80};
// Conversion constants
exo.deg = 0;

exo.ER = 1;           // Earth Radius, in pixels
exo.AU = $('#viz').width()/3;        // Astronomical Unit, in pixels
exo.YEAR = 7000;     // One year, in frames

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
}


exo.createPlanets = function() {
	d3.select(this)
			.attr("r", function(d){
				//this is not scaled or bounded
				return d.radius*exo.ER;
			})
			.attr("fill", function(d) {
				//how to handle the negative values
				if (d.temp > 0) {
					return d3.hsl("hsl("+exo.scaleColor(Math.sqrt(d.temp))+",100%, 50%)");
				}
				else {
					return d3.hsl("hsl(200,100%, 50%");
				}
			});
};

exo.radial = function(shapes, stage) {
	// remove the axes
	d3.selectAll(".x, .y").each(function(){
			d3.select(this).transition()
		.duration(2000)
		.attr("opacity", "0").delay(2000).remove();
	});


	stage.transition()
			.duration(3000)
			.attr("transform", "translate(" + exo.width / 2 + "," + exo.height / 2 + ")");

	shapes.each(function(){
		var angle = exo.randRange(-180,180);
		d3.select(this).transition()
		.duration(3000)
			.attr("cx", function(d) {
				return exo.scaleX(d.axis);
			})
			.attr("cy", 0)
			//.attr("transform", "rotate(" + angle + ")")
			.each(exo.createOrbits(angle));

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
	};
};



exo.graph1 = function(shapes, stage) {

	var xAxis = d3.svg.axis().scale(exo.scaleX).ticks(2);//.tickSize(-exo.height).tickSubdivide(true)
	var yAxis = d3.svg.axis().scale(exo.scaleYHeat).ticks(2).orient('left');

	stage.transition()
			.duration(3000)
			.attr("transform", "translate(" + exo.m.l + "," + exo.m.t + ")");

	stage.append("g").transition()
		.duration(3000)
		.attr("class", "axis x")
		.attr("transform", "translate(0," + (exo.height-exo.m.b-exo.m.t) + ")")
		.call(xAxis);


	stage.append("text").transition()
		.duration(3000)
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", exo.width-exo.m.l-exo.m.r)
		.attr("y", exo.height-exo.m.b-exo.m.t - 6)
		.text("Earth Distance");

	stage.append("g").transition()
		.duration(3000)
		.attr("class", "axis y")
		.call(yAxis);

	//y label
	stage.append("text").transition()
		.duration(3000)
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("y", 6)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.text("Temperature");

	shapes.each(function(){
		d3.select(this)
			.transition()
			.duration(3000)
			.attr("transform", "rotate(0)")
			//.attr("transform", "translate(0,0)")
		//	.attr("transform", "translate("+ (exo.width / 2)*-1 +"0,0)")
			.attr("cy", function(d) {
				return exo.scaleYHeat(d.temp);
			})
			.attr("cx", function(d) {
				return exo.scaleX(d.axis);
			});
	});

};




$(function(){
//exo.getPlanets()

d3.select("#viz").append("svg:svg")
	.attr("width", exo.width)
	.attr("height", exo.height)
	.append("g").attr("class", "planetStage");


d3.csv("data/planets2012_2.csv", function(data) {
		//console.log(data)
	data.forEach(function(d) {
		d.period = parseFloat(d.period);
		d.radius = parseFloat(d.radius);
		d.axis = parseFloat(d.axis);
		d.temp = parseFloat(d.temp);
	});

	exo.minTemp =  d3.min(data, function(d){ return Math.sqrt(Math.abs(d.temp));});
	exo.maxTemp =  d3.max(data, function(d){ return Math.sqrt(d.temp);});

	exo.scaleX = d3.scale.linear()
				.domain([0, d3.max(data, function(d){ return d.axis;})])
				.range([0,exo.width-exo.m.l-exo.m.r]);

	exo.scaleY = d3.scale.linear()
				//inverted y scale: bigger = up
				.domain([0, d3.max(data, function(d){ return d.period;}) ])
				.range([exo.height-exo.m.b-exo.m.t, 0]);

	exo.scaleYHeat = d3.scale.linear()
				//inverted y scale: bigger = up
				.domain([0, d3.max(data, function(d){ return d.temp;})])
				.range([exo.height-exo.m.b-exo.m.t, 0]);
	exo.scaleColor = d3.scale.linear()
		.domain([exo.minTemp, exo.maxTemp])
		.range([0,200]);





	var planetStage = d3.select(".planetStage").attr("transform", "translate(" + exo.width / 2 + "," + exo.height / 2 + ")");


	var planets = planetStage.selectAll(".planet")
					.data(data)
					.enter()
					.append("g")
					.append("circle")
					.attr("class", "planet")
					.each(exo.createPlanets);

	planetStage
				.append("g")
				.attr("class", "rings")
				.append("circle")
					.attr("cx", 0)
					.attr("cy", 0)
					.attr("r", function(d){
						//this is wrong
						return exo.scaleX(exo.AU)
					})


	$('#radial').click(function(){
			exo.radial(planets, planetStage);
	});
	$('#graph1').click(function(){
			exo.graph1(planets, planetStage);
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

/*
// DAT gui controls
var gui = new dat.GUI();
var amountChanger = gui.add(exo.dat,"Amount", 1, 100);
var rotationChanger = gui.add(exo.dat,"Amount", 30000,100000);

amountChanger.onChange(function(value) {
  viz.selectAll("circle")
		.attr("r", function(d){
			//this is not scaled or bounded
			return d.radius*value*.01;
		});
});

rotationChanger.onChange(function(value) {
	exo.YEAR = 50000;
		viz.selectAll("circle").each(exo.randomOrbit())
	// how to change speed of rotation
	// prevent the animation from reinterpolating only every rotatation
	// reinterpolate every frame so the new year can be detected?
});
*/

});




