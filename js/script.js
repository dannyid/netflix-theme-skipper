(function(){
  var $ = jQuery
    , n = netflix.cadmium
    , player = n.objects.videoPlayer()
    , lastEpisodeId = 0
    , o
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
  var intervalCheckIfUiLoaded = setInterval(checkIfUiLoaded, 500);

  function checkAllTheThings() {
    var v = getVideoData();

    if (currentlyInTheme(v) === true) {
      player.seek(v.themeEnd);
    };

    if (v.episodeId === lastEpisodeId) {
      // chill the fuck out
    } else {
      lastEpisodeId = v.episodeId;
      console.log(lastEpisodeId);
      intervalCheckIfUiLoaded = setInterval(checkIfUiLoaded, 500);
    };

  };

  function getVideoData() {
    var activeVideo = n.metadata.getActiveVideo();

    return {
      showName:       n.metadata.getMetadata().video.title
    , seasonNum:      n.metadata.getActiveSeason().title.slice(7)
    , episodeName:    activeVideo.title
    , episodeNum:     activeVideo.seq
    , episodeId:      activeVideo.episodeId
    , themeStart:     db[activeVideo.episodeId].start
    , themeEnd:       db[activeVideo.episodeId].end * 4004 // Netflix will only seek() to multiples of 4004 (shrug)
    , isFullscreen:   n.fullscreen.isFullscreen()
    , currentTime:    n.objects.videoPlayer().getCurrentTime() 
    }
  };

  function currentlyInTheme(v) {
    if (v.currentTime > v.themeEnd) {
      console.log("Theme has ended. Watching happyily again."); 
      return false;
    } else if (v.currentTime < v.themeStart) {
      console.log("Theme hasn't started yet.");  
      return false;
    } else if (v.currentTime >= v.themeStart && v.currentTime < v.themeEnd) {
      console.log("Taken to theme end.");
      return true;
    };
  };


  function checkIfUiLoaded() {
    var nextButton = $('div.player-control-button.player-next-episode')
    if (typeof nextButton[0] !== "undefined" && isOverlayPresent() === false) {
      injectOverlay(nextButton);
      clearInterval(intervalCheckIfUiLoaded);
    };  
  };

  function injectOverlay(nextButton) {
    o = $('<div id="nts-mini-overlay"><span>N</span></div>') ;
    nextButton.before(o);
    o.click(function() {
      console.log(o);
    });
  };

  function isOverlayPresent() {
    var overlay = $('div#nts-mini-overlay');

    if (overlay.length === 0) {
      return false;
    } else if (overlay.length > 0) {
      return true;
    };  
  };
})();

