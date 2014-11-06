map_range = function(value, low1, high1, low2, high2) {
  if (value < low1) { return low2; }
  else if (value > high1) { return high2; }
  else return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

var Sketch = Framer.Importer.load("imported/fix-nix-home");
var tickArray = [];
var Issues = Sketch.listOfIssues;
var TodayDrag = Sketch.todaydot;


//set up tick array
for(layerName in Sketch) {
	var layer = Sketch[layerName];
   if(layer.name.indexOf("Rectangle") > -1){
   		//Ticks.addSubLayer(layer);
   		//console.log(layer.name);
   		tickArray.push(layer);
   }
}

/* Set up views to access them later */
Sketch.All.centerX();
Sketch.All.y = -Sketch.Statusbar.y;
//Sketch.All.width = 400;


TodayDrag.draggable.enabled = true;
TodayDrag.draggable.speedY = 0;

Ticks = Sketch.Ticks;
//Ticks.draggable.enabled = true;

//Sketch.my_car.draggable.enabled = true;

//Ticks.addSubLayer(Sketch.Rectangle_90); 
TodayDrag.draggable.maxDragFrame = Sketch.All.frame;
TodayDrag.draggable.maxDragFrame.x = 0;
//TodayDrag.on(Events.Drag)

carValue = new Layer({
  backgroundColor: "transparent",
  width: 640,
  y: 20
});
carValue.clip = false;
carValue.html = "$10,973";
var newValue = map_range(TodayDrag.x, 0, Sketch.All.frame.width, 25000, 2000 );
carValue.html = "$" + numberWithCommas(Math.round(newValue * 100) / 100);
carValue.superLayer = Sketch.todayWorthText;
carValue.style["font-size"] = "30px";


//While draggin, magic
TodayDrag.on(Events.DragMove, function() {
  highlightTicks();
  updatedCarValue();
  moveIssues();
  
});

showNumHightlights = 3;
highlightWidth = 6;

var highlightTicks = function(){
	var capture = showNumHightlights*highlightWidth;
	for (var i=0; i < tickArray.length; i++){
  	tickArray[i].opacity = 1;
  	var distance = TodayDrag.x - tickArray[i].x;
  	if (distance < capture && distance > -capture)
  		tickArray[i].opacity = 0.5;
  }
}

var updatedCarValue = function(){
	var newValue = map_range(TodayDrag.x, 0, Sketch.All.frame.width, 25000, 2000 );
	carValue.html = "$" + numberWithCommas(Math.round(newValue * 100) / 100);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var moveIssues = function(){
	Issues.y = 942 - map_range(TodayDrag.x, 0, Sketch.All.frame.width, 0, Issues.height );

}




	Sketch.ic_plus.on(Events.Click, function(event, layer) {
		
		// Wind up the layer by making it smaller
		layer.scale = 0.7

		// Animate the layer back to the original size with a spring
		layer.animate({
			properties: {scale:1.0},
			curve: "spring",
			curveOptions: {
				friction: 15,
				tension: 1000,
			}
		})

		// Only animate this layer, not other ones below
		event.stopPropagation()
	})
