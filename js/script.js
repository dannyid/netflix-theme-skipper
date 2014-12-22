  var $ = jQuery
    , n = netflix.cadmium
    , currentEpisodeInfo = {episodeId: '0', themeStart: undefined, themeEnd: undefined}
    , ntsScrubber
    , overlay
    , sm;
  
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
      // If the episode ID has changed, it means a new episode has been put on but the page hasn't been reloaded
      // Therefore we must get new episode info and re-inject overlays (because Netflix reinstantiates player)
      currentEpisodeInfo.episodeId = v.episodeId.toString();
      getThemeTimes(currentEpisodeInfo.episodeId, v);
      intervalCheckIfPlayerLoaded = setInterval(checkIfPlayerLoaded, 500);
    };
  };

  function getVideoData() {
    var activeVideo = n.metadata.getActiveVideo();
    var player =      n.objects.videoPlayer();

    return {
      player:         player
    , showName:       n.metadata.getMetadata().video.title
    , seasonNum:      n.metadata.getActiveSeason().title.slice(7)
    , episodeName:    activeVideo.title
    , episodeNum:     activeVideo.seq
    , episodeId:      activeVideo.episodeId.toString()
    , isFullscreen:   n.fullscreen.isFullscreen()
    , currentTime:    player.getCurrentTime() 
    , duration:       player.getDuration()
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
        currentEpisodeInfo.themeStart = undefined;
        currentEpisodeInfo.themeEnd = undefined;
        logCurrentEpisode(v); 
      }
    })
    .error(function() {
      console.log("There was an error GETting the data");
    })
  };

  function postThemeTimes(episodeId, themeStart, themeEnd) {
    $.ajax({ 
      type: "POST",
      url: "http://localhost:3000/"+episodeId,
      data: {
        themeStart: themeStart,
        themeEnd: themeEnd
      }
    })
    .done(function(res) {
      console.log("Data posted");
      currentEpisodeInfo.themeStart = themeStart;
      currentEpisodeInfo.themeEnd = themeEnd;
    })
    .error(function() {
      console.log("There was an error POSTing the data");
    })
  };

  function logCurrentEpisode(v) {
      console.log(v.showName);
      console.log("Season "+v.seasonNum+": Ep. "+v.episodeNum+" \""+v.episodeName+"\"");
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
    } else if (currentEpisodeInfo.themeStart >= 0 || currentEpisodeInfo.themeEnd >= 0) {
      //console.log('unknown episode'); 
      return false;
    };
  };


  function checkIfPlayerLoaded() {
    var nextButton = $('div.player-next-episode')
    var netflixScrubber = $("#scrubber-component > .player-scrubber-progress");

    if (typeof nextButton[0] !== "undefined" && isOverlayPresent() === false) {
      injectOverlay(nextButton);
      injectScrubber(netflixScrubber, currentEpisodeInfo.themeStart || 9999999999999, currentEpisodeInfo.themeEnd || 9999999999999);
      clearInterval(intervalCheckIfPlayerLoaded);
      sm = submitMode();
    };  
  };

  function injectOverlay(nextButton) {
    overlay = $('<div id="nts-mini-overlay">'+
                  '<span>N</span>'+
                  '<div class="player-menu nts-submit-popup">'+
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
                '</div>');
    nextButton.before(overlay);
    overlay.click(function() {
      console.log(overlay);
    });
  };

  function injectScrubber(netflixScrubber, themeStart, themeEnd) {
    var v = getVideoData();
    var startPercent = themeStart / v.duration * 100;
    var durationPercent = (themeEnd - themeStart) / v.duration * 100;

    ntsScrubber = $('<div id="nts-scrubber-theme"></div>');

    ntsScrubber.css("left", startPercent+"%");
    ntsScrubber.css("width", durationPercent+"%");
    netflixScrubber.prepend(ntsScrubber)
  };

  function submitMode() {
    var whichEnd = "start";
    var scrubberHandle = $("button.player-scrubber-target > div.player-scrubber-handle");
    var scrubberTheme = $('div#nts-scrubber-theme');
    var intervalLockThemeToTime;

    function enter() { 
      intervalLockThemeToTime = setInterval(lockThemeToTime, 100);
      scrubberHandle.addClass('nts-submit-mode'); 
      scrubberTheme.addClass('nts-submit-mode');
    };

    function leave() { 
      clearInterval(intervalLockThemeToTime);
      scrubberHandle.removeClass('nts-submit-mode'); 
      scrubberTheme.removeClass('nts-submit-mode');
    };

    function lockThemeToTime() {
      var v = getVideoData();
  
      if (whichEnd === "start") {
      console.log("start")
        currentEpisodeInfo.themeStart = v.currentTime;
        scrubberTheme.css("left", ((currentEpisodeInfo.themeStart / v.duration) * 100)+"%")
      } else if (whichEnd === "end") {
      console.log("end")
        currentEpisodeInfo.themeEnd = Math.floor(v.currentTime / 4004) * 4004;
        scrubberTheme.css("width", (((currentEpisodeInfo.themeEnd - currentEpisodeInfo.themeStart) / v.duration) * 100)+"%")
      };
    };
    
    function which (whichOne) {
      if (whichOne !== undefined) {
        whichEnd = whichOne;
        return whichEnd;
      } else {
        return whichEnd;
      }
    };

    return {
      enter: enter,
      leave: leave,
      lockThemeToTime: lockThemeToTime,
      whichEnd: which 
    };
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


