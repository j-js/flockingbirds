/**
	// Reference: http://www.html5rocks.com/en/tutorials/speed/animations/

**/


/**
	variable to check scrolling and audio status

**/
var playing = false;
var audioId;
var audioList = document.getElementsByTagName("audio");

var last_known_scroll_position = 0;
var ticking = false;


var scroll= document.getElementById("scroll");

for (var i = 0; i < audioList.length; i++) {
    audioList[i].addEventListener("playing", onPlaying, false);
    audioList[i].addEventListener("playing", onPlaying, false);
}


function onPlaying(e) {
    
    playing = true;
    audioId = parseInt(e.target.id);

    // console.log(parseInt(audioId) + " playing");

};


// if (audio.volume !== 1) {
//         audio.volume = 1;
//         button.innerHTML = 'change volume to 0.5';
//     } else {
//         audio.volume = 0.5;
//         button.innerHTML = 'change volume to 1';
//     }

    
function stopAudio(scroll_pos) {

	console.log(scroll_pos);

  if(scroll_pos>500){
    scroll.style.visibility = "hidden";
  }else{
    scroll.style.visibility = "visible";
  }



  	if(playing==true){
  		audioList[+audioId].pause();
  		window.setTimeout(audioList[+audioId].volume-=0.1, 2000);
  		playing==false;
  		// console.log(audioList[+audioId].id + "paused");
  		window.setTimeout(resetAudio(audioId), 2000);
  	}
}


function resetAudio(id){
	audioList[+id].pause();
	audioList[+audioId].volume = 1;
  audioList[+id].currentTime = 0;
}

window.addEventListener('scroll', function(e) {
  last_known_scroll_position = window.scrollY;

  stopAudio(last_known_scroll_position);
});
