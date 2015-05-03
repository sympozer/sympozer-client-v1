// ESWC 15 integrate voting system to the app
// Fuqi Song, wimmics, inria - i3s
// 21 March 2015
define(['jquery'], function($){
    var votingSystem = {
        config: {
            url: 'http://wit.istc.cnr.it/eswc2015/vote', //Unused by now (until I find a proper way to inject it in the vote function)
            tracks: ['poster', 'demo']
        },
        isVotingTrack: function(trackName) {
            for(var i in votingSystem.config.tracks) {
                if(votingSystem.config.tracks[i] === trackName)
                    return true;
            }
            return false;
        },
        vote: function (paperTrack, paperId) {
            var url = 'http://wit.istc.cnr.it/eswc2015/vote';
            var persCode = $('#personalCode').val().trim();
            if (persCode == '') {
                $('#msg').html('Warning! Please enter your personal code!');
                return;
            }

            console.log('[vote] track:' + paperTrack + ', id ' + paperId + ', code: ' + persCode);

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
    };
    return votingSystem;
});