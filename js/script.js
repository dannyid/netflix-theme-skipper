(function(){
  var $ = jQuery
    , n = netflix.cadmium
    , currentEpisodeInfo = {episodeId: '0', themeStart: 9999999999999, themeEnd: 9999999999999}
    , overlay
    , db = {
    "70177863": { // 1
      start: 0,
      end: 25
    },
    "70177865": { // 2
      start: 252252,
      end: 88
    },
    "70177866": { // 3
      start: 216216,
      end: 79
    },
    "70177867": { // 4
      start: 236236,
      end: 84
    },
    "70177868": { // 5
      start: 216216,
      end: 79
    },
    "70177869": { // 6
      start: 256256,
      end: 89
    },
    "70177870": { // 7
      start: 152152,
      end: 63
    },
    "70177871": { // 8
      start: 220220,
      end: 80
    },
    "70177872": { // 9
      start: 142142,
      end: 61
    },
    "70177873": { // 10
      start: 165513,
      end: 67
    },
    "70177874": { // 11
      start: 236236,
      end: 84
    },
    "70177875": { // 12
      start: 208809,
      end: 78
    },
    "70177876": { // 13
      start: 159759,
      end: 65
    },
    "70177877": { // 14
      start: 318878,
      end: 105
    },
    "70177878": { // 15
      start: 182582,
      end: 71
    },
    "70177879": { // 16
      start: 195042,
      end: 74
    },
    "70177880": { // 17
      start: 196196,
      end: 74
    },
    "70177881": { // 18
      start: 136136,
      end: 59
    },
    "70177882": { // 19
      start: 200200,
      end: 75
    },
    "70177883": { // 20
      start: 248248,
      end: 87
    },
    "70177884": { // 21
      start: 256256,
      end: 89
    },
    "70177885": { // 22
      start: 184184,
      end: 71
    },
    "70177886": { // 23
      start: 220220,
      end: 80
    },
    "70177887": { // 24
      start: 244244,
      end: 86
    },
    "70177888": { // 25
      start: 204204,
      end: 75
    }
  };
  
  var intervalCheckAllTheThings = setInterval(checkAllTheThings, 500);
  var intervalCheckIfPlayerLoaded = setInterval(checkIfPlayerLoaded, 500);

  function checkAllTheThings() {
    var v = getVideoData();

    if (currentlyInTheme(v) === true) {
      v.player.seek(currentEpisodeInfo.themeEnd * 4004);
    };

    if (v.episodeId.toString() === currentEpisodeInfo.episodeId) {
      // chill the fuck out
    } else {
      currentEpisodeInfo.episodeId = v.episodeId.toString();
      getThemeTimes(currentEpisodeInfo.episodeId);
      intervalCheckIfPlayerLoaded = setInterval(checkIfPlayerLoaded, 500);
    };
  };

  function getVideoData() {
    var activeVideo = n.metadata.getActiveVideo();

    return {
      player:         n.objects.videoPlayer()
    , showName:       n.metadata.getMetadata().video.title
    , seasonNum:      n.metadata.getActiveSeason().title.slice(7)
    , episodeName:    activeVideo.title
    , episodeNum:     activeVideo.seq
    , episodeId:      activeVideo.episodeId.toString()
    , isFullscreen:   n.fullscreen.isFullscreen()
    , currentTime:    n.objects.videoPlayer().getCurrentTime() 
    }
  };

  function getThemeTimes(episodeId) {
    $.ajax({ 
      url: "http://localhost:3000/"+episodeId
    })
    .done(function(res) {
      console.log(res[0]);
      currentEpisodeInfo.themeStart = res[0].themeStart;
      currentEpisodeInfo.themeEnd = res[0].themeEnd;
      console.log(currentEpisodeInfo);
    })
    .error(function() {
      console.log("there was an error with the ajax");
    })
  };

  function currentlyInTheme(v) {
    if (v.currentTime > currentEpisodeInfo.themeEnd * 4004) {
      console.log("Theme has ended. Watching happyily again."); 
      return false;
    } 
    else if (v.currentTime < currentEpisodeInfo.themeStart) {
      console.log("Theme hasn't started yet.");  
      return false;
    } 
    else if (v.currentTime >= currentEpisodeInfo.themeStart && v.currentTime < currentEpisodeInfo.themeEnd * 4004) {
      console.log("Taken to theme end.");
      return true;
    };
  };


  function checkIfPlayerLoaded() {
    var nextButton = $('div.player-next-episode')
    if (typeof nextButton[0] !== "undefined" && isOverlayPresent() === false) {
      injectOverlay(nextButton);
      clearInterval(intervalCheckIfPlayerLoaded);
    };  
  };

  function injectOverlay(nextButton) {
    overlay = $('<div id="nts-mini-overlay"><span>N</span></div>') ;
    nextButton.before(overlay);
    overlay.click(function() {
      console.log(overlay);
    });
  };

  function isOverlayPresent() {
    var overlay = $('div#nts-mini-overlay');

    if (overlay.length === 0) {
      return false;
    } 
    else if (overlay.length > 0) {
      return true;
    };  
  };
})();

