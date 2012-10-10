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
/*
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
	 */