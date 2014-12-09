  var checkForNetflixInterval = setInterval(isNetflix, 500);

  function isNetflix() {
    if (typeof netflix === "undefined") {
      console.log("Netflix not found. Trying again.")
    } else {
      clearInterval(checkForNetflixInterval)
      init(netflix);
      return;
    }
  };

  function init(netflix) {
    var data = {
      "70177868": {
        start: 217167,
        end: 320000
      },
      "70177869": {
        start: 256256,
        end: 360000
      }
    };

    var player =    netflix.cadmium.objects.videoPlayer()
      , episodeId = netflix.cadmium.metadata.getActiveVideo().episodeId
      , imgRoot =   netflix.cadmium.metadata.getActiveVideo().progressImageRoot;

    function checkTime(player, episodeId) {
      if (player.getCurrentTime() > data[episodeId].start) {
        console.log("Theme hasn't started yet.");  
      } else {
        player.seek(data[episodeId].end);
        clearInterval(interval);
        console.log("At theme end.")
      };
    };

    var interval = setInterval(function() {checkTime(player, episodeId)},500);
  };
