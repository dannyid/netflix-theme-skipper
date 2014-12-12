(function() {
  var data = {
    "70177863": { // 1
      start: 0,
      end: 25
    },
    "70177865": { // 2
      start: 63,
      end: 88
    },
    "70177866": { // 3
      start: 54,
      end: 79
    },
    "70177867": { // 4
      start: 59,
      end: 84
    },
    "70177868": { // 5
      start: 54,
      end: 79
    },
    "70177869": { // 6
      start: 64,
      end: 89
    },
    "70177870": { // 7
      start: 38,
      end: 63
    },
    "70177871": { // 8
      start: 55,
      end: 80
    },
    "70177872": { // 9
      start: 35.5,
      end: 61
    },
    "70177873": { // 10
      start: 41.3, //165513
      end: 67
    },
    "70177874": { // 11
      start: 59,
      end: 84
    },
    "70177875": { // 12
      start: 52.15,
      end: 78
    },
    "70177876": { // 13
      start: 39.9,
      end: 65
    },
    "70177877": { // 14
      start: 79.64,
      end: 105
    },
    "70177878": { // 15
      start: 46,
      end: 71
    },
    "70177879": { // 16
      start: 49,
      end: 74
    },
    "70177880": { // 17
      start: 49,
      end: 74
    },
    "70177881": { // 18
      start: 34,
      end: 59
    },
    "70177882": { // 19
      start: 50,
      end: 75
    },
    "70177883": { // 20
      start: 62,
      end: 87
    },
    "70177884": { // 21
      start: 64,
      end: 89
    },
    "70177885": { // 22
      start: 46,
      end: 71
    },
    "70177886": { // 23
      start: 55,
      end: 80
    },
    "70177887": { // 24
      start: 61,
      end: 86
    },
    "70177888": { // 25
      start: 51,
      end: 75
    }
  };

  var intervalCheckTime = setInterval(checkTime, 500);

  function checkTime() {
    var player =      netflix.cadmium.objects.videoPlayer();
    var currentTime = player.getCurrentTime();

    var showName =    netflix.cadmium.metadata.getMetadata().video.title;
    var seasonNum =   netflix.cadmium.metadata.getActiveSeason().title.slice(7);
    var episodeName = netflix.cadmium.metadata.getActiveVideo().title;
    var episodeNum =  netflix.cadmium.metadata.getActiveVideo().seq;
    var themeStart =  data[netflix.cadmium.metadata.getActiveVideo().episodeId].start * 4004;
    var themeEnd =    data[netflix.cadmium.metadata.getActiveVideo().episodeId].end * 4004; // Netflix will only seek() to multiples of 4004 (shrug)

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
