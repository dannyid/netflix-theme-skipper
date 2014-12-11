(function() {
  var data = {
    "70177863": {
      start: 0,
      end: 25
    },
    "70177865": {
      start: 63,
      end: 88
    },
    "70177866": {
      start: 54,
      end: 79
    },
    "70177867": {
      start: 59,
      end: 84
    },
    "70177868": {
      start: 54,
      end: 79
    },
    "70177869": {
      start: 64,
      end: 89
    },
    "70177870": {
      start: 38,
      end: 63
    },
    "70177871": {
      start: 55,
      end: 80
    },
    "70177872": {
      start: 35.5,
      end: 61
    },
    "70177873": {
      start: 42,
      end: 67
    },
    "70177874": {
      start: 59,
      end: 84
    },
    "70177875": {
      start: 53,
      end: 78
    },
    "70177876": {
      start: 40,
      end: 65
    },
    "70177877": {
      start: 80,
      end: 105
    },
    "70177878": {
      start: 46,
      end: 71
    },
    "70177879": {
      start: 49,
      end: 74
    },
    "70177880": {
      start: 49,
      end: 74
    },
    "70177881": {
      start: 34,
      end: 59
    },
    "70177882": {
      start: 50,
      end: 75
    },
    "70177883": {
      start: 62,
      end: 87
    },
    "70177884": {
      start: 64,
      end: 89
    },
    "70177885": {
      start: 46,
      end: 71
    },
    "70177886": {
      start: 55,
      end: 80
    },
    "70177887": {
      start: 61,
      end: 86
    },
    "70177888": {
      start: 51,
      end: 75
    }
  };

  var intervalCheckTime = setInterval(checkTime, 500);

  function checkTime() {
    var c =           4004; // For some reason Netflix will only seek() to time intervals that are multiples of 4004 (shrug)
    var player =      netflix.cadmium.objects.videoPlayer();
    var currentTime = player.getCurrentTime();

    var showName =    netflix.cadmium.metadata.getMetadata().video.title;
    var seasonNum =   netflix.cadmium.metadata.getActiveSeason().title.slice(7);
    var episodeNum =  netflix.cadmium.metadata.getActiveVideo().seq;
    var episodeName = netflix.cadmium.metadata.getActiveVideo().title;
    var themeStart =  data[netflix.cadmium.metadata.getActiveVideo().episodeId].start * 4004;
    var themeEnd =    data[netflix.cadmium.metadata.getActiveVideo().episodeId].end * 4004;

    var formattedTitle = showName+" - s"+seasonNum+"e"+episodeNum+" - "+episodeName;

//    console.log(formattedTitle);

    if (currentTime > themeEnd) {
      console.log("Theme has ended. Watching happyily again."); 
    } else if (currentTime < themeStart) {
      console.log("Theme hasn't started yet.");  
    } else if (currentTime >= themeStart && currentTime < themeEnd) {
      player.seek(themeEnd);
      console.log("Taken to theme end.");
    };
  };
})();
