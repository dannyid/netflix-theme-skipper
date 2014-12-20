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

    // If we're still looking at the same episode, do nothing. If we're on a new one, update info.
    if (v.episodeId.toString() === currentEpisodeInfo.episodeId) {
      // do nothing
    } else {
      currentEpisodeInfo.episodeId = v.episodeId.toString();
      getThemeTimes(currentEpisodeInfo.episodeId, v);
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

  function getThemeTimes(episodeId, v) {
    $.ajax({ 
      url: "http://localhost:3000/"+episodeId
    })
    .done(function(res) {
      if (res[0] !== undefined) { 
        console.log("\n* * * Episode "+v.episodeId+" found! * * *");
        currentEpisodeInfo.themeStart = res[0].themeStart;
        currentEpisodeInfo.themeEnd = Math.floor(res[0].themeEnd / 4004) * 4004; //Netflix will only seek to multiples of 4004 (shrug)
        logCurrentEpisode(v); 
      } else {
        console.log("* * * Episode "+v.episodeId+" NOT found :( * * *");
        currentEpisodeInfo.themeStart = 9999999999999;
        currentEpisodeInfo.themeEnd = 9999999999999;
        logCurrentEpisode(v); 
      }
    })
    .error(function() {
      console.log("there was an error with the ajax");
    })
  };

  function logCurrentEpisode(v) {
      console.log(v.showName+' - "'+v.episodeName+'"');
      console.log("Season "+v.seasonNum+", Episode "+v.episodeNum);
      console.log("Theme Start: "+currentEpisodeInfo.themeStart);
      console.log("Theme End:   "+currentEpisodeInfo.themeEnd);
      console.log("--------------------");
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
    overlay = $('<div id="nts-mini-overlay">'+
                  '<span>N</span>'+
/*                  '<div class="player-menu nts-submit-popup">'+
                    '<h1>Hood Shit</h1>'+
                    '<div class="player-next-episode-info">'+
                      '<div class="image-container">'+
                        '<img class="next-episode-image" src="http://so0.akam.nflximg.com/soa1/106/1742156106.jpg" style="margin-left: 0px;">'+
                        '<div class="play-icon"></div>'+
                      '</div>'+
                      '<div class="player-next-episode-description">'+
                        '<h2>Ep. 19 Heart of Glory</h2>'+
                        '<p>Worf must choose between his loyalty to Starfleet and his Klingon heritage when two Klingon fugitives take over the Enterprise.</p>'+
                      '</div>'+
                    '</div>'+
                  '</div>'+
*/                '</div>') ;
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

