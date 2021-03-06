//(function() {
  var $ = jQuery
    , n = netflix.cadmium
    , v
    , $ntsScrubber
    , $overlay
    , sm;

  var currentEpisodeInfo = {
    episodeId: 0, 
    themeStart: undefined, 
    themeEnd: undefined, 
    realThemeEnd: undefined, 
    type: undefined
  };

  var BASE_URL = "http://nts.dannyid.com";
  
  var intervalCheckAllTheThings = setInterval(checkAllTheThings, 100);
  var intervalCheckIfPlayerLoaded = setInterval(checkIfPlayerLoaded, 500);

  // This runs repeatedly in order to keep tabs on
  //  a) Which episodeId is being watched
  //  b) currentTime in the episode
  // and compares those to information received from the database 
  function checkAllTheThings() {
    var currentVolume;
    
    // This function runs every 100ms and the first thing it does is gathers and spits out a bunch of useful info about the currently playing title
    // This v object is global and can be accessed by all the functions
    v = getVideoData();

    // Netflix only seeks to multiples of ~4sec so I find the difference between the real themeEnd and the place seek() will land
    // to mute the audio until the REAL themeEnd time, so prevent jar
    var difference = currentEpisodeInfo.realThemeEnd - currentEpisodeInfo.themeEnd;

    if (currentlyInTheme() === true) {
      currentVolume = v.player.getVolume();
      v.player.setVolume(0);
      v.player.seek(currentEpisodeInfo.themeEnd);
      volumeOn(difference, currentVolume);
      console.log("after seek");
    };

    // If the episode ID has changed, it means a new episode has been put on but the page hasn't been reloaded
    // Therefore we must get new episode info and re-inject overlays (because Netflix reinstantiates player)
    if (v.episodeId !== currentEpisodeInfo.episodeId) {
      currentEpisodeInfo.themeStart = undefined;
      currentEpisodeInfo.themeEnd = undefined;
      currentEpisodeInfo.type =         v.series.type;
      if (currentEpisodeInfo.type === "show") {
        currentEpisodeInfo.seriesTitle =  v.series.title;
        currentEpisodeInfo.seriesId =     v.series.id;
        currentEpisodeInfo.seasonId =     v.seasonInfo.id;
        currentEpisodeInfo.seasonNum =    v.seasonInfo.seq;
        currentEpisodeInfo.seasonYear =   v.seasonInfo.year;
        currentEpisodeInfo.episodeId =    v.episodeId;
        currentEpisodeInfo.episodeTitle = v.episodeTitle;
        getThemeTimes(currentEpisodeInfo.episodeId, v);
      }
      intervalCheckIfPlayerLoaded = setInterval(checkIfPlayerLoaded, 500);
    };
  };

  function volumeOn(waitTime, originalVolume) {
      console.log("outside timeout")
    setTimeout(function() {
      v.player.setVolume(originalVolume);
      console.log("inside timeout")
    }, waitTime);
  };

  // This function gets maaaad stuff from the "netflix" object
  function getVideoData() {
    var activeEpisode = n.metadata.getActiveVideo();
    var player =      n.objects.videoPlayer();

    return {
      player:         player
    , seasonInfo:     n.metadata.getActiveSeason()
    , series:         n.metadata.getMetadata().video
    , episodeTitle:    activeEpisode.title
    , episodeNum:     activeEpisode.seq
    , episodeId:      parseInt(activeEpisode.episodeId)
    , isFullscreen:   n.fullscreen.isFullscreen()
    , currentTime:    player.getCurrentTime() 
    , duration:       player.getDuration()
    }
  };

  // Query the database for theme start and end times for the current episode
  function getThemeTimes(episodeId, v) {
    $.ajax({ 
      url: BASE_URL+"/"+episodeId
    })
    .done(function(res) {
      if (res[0] !== undefined) { 
        console.log("\n* * * Episode "+v.episodeId+" found! * * *");
        currentEpisodeInfo.themeStart = res[0].themeStart;
        currentEpisodeInfo.realThemeEnd = res[0].themeEnd;
        currentEpisodeInfo.themeEnd = Math.floor(res[0].themeEnd / 4004) * 4004; //Netflix will only seek to multiples of 4004 (shrug)
        logCurrentEpisode(); 
      } else {
        console.log("* * * Episode "+v.episodeId+" NOT found :( * * *");
        currentEpisodeInfo.themeStart = undefined;
        currentEpisodeInfo.themeEnd = undefined;
        currentEpisodeInfo.realThemeEnd = undefined;
        logCurrentEpisode(); 
      }
    })
    .error(function() {
      console.log("There was an error GETting the data");
    })
  };

  // This just prints out a ton of useful info to the console. And it looks nice
  function logCurrentEpisode() {
      console.log(v.series.title);
      console.log("Season "+v.seasonInfo.seq+": Ep. "+v.episodeNum+" \""+v.episodeTitle+"\"");
      console.log("Theme Start:    "+currentEpisodeInfo.themeStart);
      console.log("Theme End:      "+currentEpisodeInfo.themeEnd);
      console.log("Real Theme End: "+currentEpisodeInfo.realThemeEnd);
      console.log("--------------------");
  };

  // Comparing current time in episode to start and end times received from the database. Returns true / false
  function currentlyInTheme() {
    if (v.currentTime > currentEpisodeInfo.themeEnd) {
      // Theme has ended
      return false;
    } 
    else if (v.currentTime < currentEpisodeInfo.themeStart) {
      // Theme hasn't started yet
      return false;
    } 
    else if (v.currentTime >= currentEpisodeInfo.themeStart && v.currentTime < currentEpisodeInfo.themeEnd) {
      console.log("Taken to theme end:");
      return true;
    } else if (currentEpisodeInfo.themeStart === undefined || currentEpisodeInfo.themeEnd === undefined) {
      // Unknown episode
      return false;
    };
  };

  // This needs to happen when a new episode is loaded because the page doesn't reload but Netflix's javascript player reloads
  // as a result, the overlays that were put in by this extension get destroyed and new ones need to be injected
  function checkIfPlayerLoaded() {
    var $nextButton = $('div.player-next-episode')
    var $netflixScrubber = $("#scrubber-component > .player-scrubber-progress");

    if (typeof $nextButton[0] !== undefined && isOverlayPresent() === false) {
      injectOverlay($nextButton);
      injectScrubber($netflixScrubber, currentEpisodeInfo.themeStart, currentEpisodeInfo.themeEnd);
      clearInterval(intervalCheckIfPlayerLoaded);
      sm = submitMode();
    };  
  };

  // This injects the app icon onto the player UI
  function injectOverlay($nextButton) {
    var $submitPopup;
    
    // Create overlay
    $overlay = $('<div id="nts-mini-overlay">'+
                  '<span>N</span>'+
                  '<div class="nts-submit-popup"><p>Submit<br>Mode</p></div>'+
                '</div>');
    // Insert overlay
    $nextButton.before($overlay);
    
    // Grab popup div
    $submitPopup = $overlay.children('div.nts-submit-popup')

    // If the episode is unknown, enable submit mode divs
    if (currentEpisodeInfo.type === "show" && currentEpisodeInfo.themeStart === undefined && currentEpisodeInfo.themeEnd === undefined) {
      $overlay.children('span').on('mouseenter', function handlerIn(){
        $submitPopup.fadeIn(200);
      });

      $overlay.on('mouseleave', function handlerOut() {
        $submitPopup.fadeOut(200);
      });
    };

    // Enter submit mode when popup is clicked
    $submitPopup.click(function() {
      sm.enter();
    })
  };

  // This injects the darkened scrubber area that highlights where the theme is
  function injectScrubber($netflixScrubber, themeStart, themeEnd) {
    var startPercent = themeStart / v.duration * 100;
    var durationPercent = (themeEnd - themeStart) / v.duration * 100;

    $ntsScrubber = $('<div id="nts-scrubber-theme"></div>');

    $ntsScrubber.css("left", startPercent+"%");
    $ntsScrubber.css("width", durationPercent+"%");
    $netflixScrubber.prepend($ntsScrubber)
  };

  // Checks if the app icon has already been loaded so as to not load it again
  function isOverlayPresent() {
    var $overlay = $('div#nts-mini-overlay');

    if ($overlay.length === 0) {
      return false;
    } 
    else if ($overlay.length > 0) {
      return true;
    };  
  };

  // Puts the user into "submit mode" where they mark the beginning and end of the theme and then submit it to the database
  function submitMode() {
    var whichEnd = "start";
    var $scrubberHandle = $("div#scrubber-component button.player-scrubber-target > div.player-scrubber-handle");
    var $scrubberTheme = $('div#nts-scrubber-theme');
    var $submitPopup = $('div.nts-submit-popup');
    var intervalLockThemeToTime;
    var submitTimes = {
      themeStart: undefined,
      themeEnd: undefined
    };

    function enter() { 
      currentEpisodeInfo.themeStart = undefined;
      currentEpisodeInfo.themeEnd = undefined;
      which("start");
      intervalLockThemeToTime = setInterval(lockThemeToTime, 100);
      $scrubberHandle.addClass('nts-submit-mode'); 
      $scrubberTheme.addClass('nts-submit-mode');
      $submitPopup.addClass('nts-submit-mode');
      $submitPopup.children('p').html('Set<br/>Start')
      $submitPopup.off('click').click(function submitPopupSetStart(){
        which('end');
        $submitPopup.children('p').html('Set<br/>End');
        $submitPopup.off("click").click(function submitPopupSetEnd() {
          leave();
          $submitPopup.children('p').html('Submit?').css('margin-top', '0.7em');
          $submitPopup.off('click').click(function submitPopupSubmit() {
            submit(); 
            $submitPopup.children('p').html('Thanks!');
            $overlay.off('mouseleave').children('span').off('mouseenter');
            setTimeout(function submitPopupFadeOut() {$submitPopup.fadeOut(200)}, 1000)
          });
        })
      })
    };

    function leave() { 
      clearInterval(intervalLockThemeToTime);
      currentEpisodeInfo.themeStart = parseInt(submitTimes.themeStart);
      currentEpisodeInfo.realThemeEnd = parseInt(submitTimes.themeEnd);
      currentEpisodeInfo.themeEnd = Math.floor(parseInt(submitTimes.themeEnd) / 4004) * 4004;
      $scrubberHandle.removeClass('nts-submit-mode'); 
      $scrubberTheme.removeClass('nts-submit-mode');
      $submitPopup.removeClass('nts-submit-mode');
    };

    function lockThemeToTime() {
      if (whichEnd === "start") {
      //console.log("start")
        submitTimes.themeStart = v.currentTime;
        $scrubberTheme.css("left", ((submitTimes.themeStart / v.duration) * 100)+"%");
        if (submitTimes.themeEnd === undefined) {
          $scrubberTheme.css("width", "0%");
        } else {
          $scrubberTheme.css("width", (((submitTimes.themeEnd - submitTimes.themeStart) / v.duration) * 100)+"%");
        };
      } else if (whichEnd === "end") {
      //console.log("end")
        submitTimes.themeEnd = v.currentTime;
        $scrubberTheme.css("width", (((submitTimes.themeEnd - submitTimes.themeStart) / v.duration) * 100)+"%");
      };
    };
    
    function which(whichOne) {
      if (whichOne !== undefined) {
        whichEnd = whichOne;
        return whichEnd;
      } else {
        return whichEnd;
      }
    };

    // Submit theme start and end time information to database
    function submit() {
      $.ajax({ 
        type: "POST",
        url: BASE_URL+"/"+currentEpisodeInfo.episodeId,
        data: {
          seriesTitle:  currentEpisodeInfo.seriesTitle,
          seriesId:     currentEpisodeInfo.seriesId,
          seasonNum:    currentEpisodeInfo.seasonNum,
          seasonId:     currentEpisodeInfo.seasonId,
          seasonYear:   currentEpisodeInfo.seasonYear,
          episodeTitle: currentEpisodeInfo.episodeTitle,
          themeStart:   parseInt(submitTimes.themeStart),
          themeEnd:     parseInt(submitTimes.themeEnd)
        }
      })
      .done(function(res) {
        console.log("Data posted");
        submitTimes.themeStart = undefined;
        submitTimes.themeEnd = undefined;
      })
      .error(function() {
        console.log("There was an error POSTing the data");
      })
    };

    return {
      enter: enter,
      leave: leave,
      lockThemeToTime: lockThemeToTime,
      whichEnd: which,
      submit: submit,
      getSubmitTimes: function getSubmitTimes() {
        return submitTimes;
      }
    };
  };


  function isOverlayPresent() {
    var $overlay = $('div#nts-mini-overlay');

    if ($overlay.length === 0) {
      return false;
    } 
    else if ($overlay.length > 0) {
      return true;
    };  
  };
//})();
