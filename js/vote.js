// ESWC 15 integrate voting system to the app
// Fuqi Song, wimmics, inria - i3s
// 21 March 2015

function vote(paperTrack, paperId){
	//if(!$.support.cors){
	//	$('#msg').html('Warning! Browser doesn\'t support CORS!');
	//	return;
	//}

	var persCode = $('#personalCode').val().trim();
	if(persCode == ''){
		$('#msg').html('Warning! Please enter your personal code!');
		return;
	}
	
   	var url = 'http://wit.istc.cnr.it/eswc2015/vote';
    console.log('[vote] track:' + paperTrack + ', id ' + paperId + ', code: '+persCode);

    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: url,
        data: {'track': paperTrack, 'id': paperId, 'code': persCode},
        crossDomain: true,
        statusCode: {
      	200: function (response) {
         	var msg = 'Vote successfully, thanks for your participation!';
            $('#personalCode').hide();
            $('#voteButton').hide();
            $('#msg').html(msg);
      	},
      	404: function (response) {
         	$('#msg').html("Error! The code is wrong!");
      	},
      	409: function (response) {
         	$('#msg').html("Error! The code has been used, you have already voted!");   
         },     
      	412: function (response) {
         	$('#msg').html("Error! The format of paper Id or personal code is wrong, cannot resolve!");
      	}
      	//0: function (response){
      	//	$('#msg').html("Error! Not connected to network!");
      	//}
      	}
    });
}