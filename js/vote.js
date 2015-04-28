// ESWC 15 integrate voting system to the app
// Fuqi Song, wimmics, inria - i3s
// 21 March 2015

function vote(paperTrack, paperId) {
	//1 check personal code
  	var persCode = $('#personalCode').val().trim();
	if(persCode == ''){
		$('#msg').html('Warning! Please enter your personal code!');
		return;
	}
	
	//2 Create XHR object
   	var url = 'http://wit.istc.cnr.it/eswc2015/vote?id='+paperId+'&track='+paperTrack+'&code='+persCode;
  	var xhr = new XMLHttpRequest();
  	if ("withCredentials" in xhr) {
    	xhr.open('GET', url, true);
  	} else if (typeof XDomainRequest != "undefined") {
    	// XDomainRequest for IE.
    	xhr = new XDomainRequest();
    	xhr.open('GET', url);
  	} else {
    	$('#msg').html('CORS not supported');
    	return;
  	}

	//3 Process the response
  	xhr.onload = function() {
    	var status = xhr.status;
    	if(status == 200){
    		var msg = 'Your vote has been saved successfully, thanks for your participation!';
            $('#personalCode').hide();
            $('#voteButton').hide();
            $('#msg').html(msg);
    	} else if (status == 404){
    		$('#msg').html("Error! The code is wrong!");
    	} else if (status == 409){
    		$('#msg').html("Error! The code has been used, you have already voted!");  
    	} else if (status == 412){
    		$('#msg').html("Error! The format of paper id, track or personal code is wrong, cannot resolve!");
    	} else{
    		$('#msg').html("Error! Reason not detected!");
    	}
  	};

  	xhr.onerror = function() {
    	$('#msg').html("Error making the request!");
  	};

  	xhr.send();
}