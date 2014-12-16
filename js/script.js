(function(){
  var $ = jQuery
    , n = netflix.cadmium
    , currentEpisodeInfo = {episodeId: '0', themeStart: 9999999999999, themeEnd: 9999999999999}
    , overlay;
  
  var intervalCheckAllTheThings = setInterval(checkAllTheThings, 100);
  var intervalCheckIfPlayerLoaded = setInterval(checkIfPlayerLoaded, 500);

  function checkAllTheThings() {
    var v = getVideoData();

    if (currentlyInTheme(v) === true) {
      v.player.seek(currentEpisodeInfo.themeEnd);
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
      //console.log(res[0]);
      currentEpisodeInfo.themeStart = res[0].themeStart;
      currentEpisodeInfo.themeEnd = Math.floor(res[0].themeEnd / 4004) * 4004; //Netflix will only seek to multiples of 4004 (shrug)
      console.log(currentEpisodeInfo);
    })
    .error(function() {
      console.log("there was an error with the ajax");
    })
  };

  function currentlyInTheme(v) {
    if (v.currentTime > currentEpisodeInfo.themeEnd) {
      //console.log("Theme has ended. Watching happyily again."); 
      return false;
    } 
    else if (v.currentTime < currentEpisodeInfo.themeStart) {
      //console.log("Theme hasn't started yet.");  
      return false;
    } 
    else if (v.currentTime >= currentEpisodeInfo.themeStart && v.currentTime < currentEpisodeInfo.themeEnd) {
      console.log("Taken to theme end:");
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

