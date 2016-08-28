
// get all the image slide class
var imageSlide = document.getElementsByClassName('imageSlide');
// console.log(imageSlide);

var images = [];
var buttons = [];
var image;

// for each image slide class find image tags
for (var i = 0; i < imageSlide.length; i++) { 

 	images[i]= imageSlide[i].getElementsByTagName('img');
 	// console.log(images[i]);
 	
 	for (var j = 0; j < images[i].length; j++) { 
	 image = images[i][j];
	 // console.log(image.getAttribute("src"));
	}

	buttons[i]= imageSlide[i].getElementsByTagName('button');
	for(a=0; a<buttons[i].length; a++){
		buttons[i][a].addEventListener("click", function(e){console.log(e.target.id)}, false);
	}

	console.log(buttons[0][1].id);
}

