setInterval(() => {
  chrome.runtime.sendMessage({ greeting: "hello" }, function (response) {
    gotMessage(response);
  });
}, 1000);

chrome.runtime.onMessage.addListener(gotMessage);

let title;
let channelName;
let duration;
function gotMessage(message, sender, sendResponse) {
  if (message.txt === "hello" && $("h1.title")) {
    if (title != "") {
      title = "";
      channelName = "";
      title = $("h1.title").text().trim();
      channelName = $(
        ".style-scope ytd-video-owner-renderer .style-scope.ytd-channel-name .yt-simple-endpoint.style-scope.yt-formatted-string"
      )
        .first()
        .text()
        .trim();
      if (parseInfo(title).artist == "") {
        channelName = cleanTrack(channelName);
        title = cleanTrack(title);
      }
    }
  } else if (message.command === "lyrics") {
    if (title == "") {
      sendResponse(null);
    }
    if (parseInfo(title).artist == "") {
      sendResponse({ artist: channelName, track: title });
    } else {
      sendResponse({
        artist: parseInfo(title).artist,
        track: parseInfo(title).track,
      });
    }
  }
}

function parseInfo(artistTitle) {
  let artist = "";
  let track = "";

  let separator = findSeparator(artistTitle);
  if (separator == null) return { artist: "", track: "" };

  artist = artistTitle.substr(0, separator.endIndexArtist);
  track = artistTitle.substr(
    separator.startIndexTrack,
    separator.endIndexTrack
  );
  return cleanArtistTrack(artist, track);
}

function findSeparator(str) {
  // care - minus vs hyphen
  let separators = [" - ", " – ", "-", "–", ":", "—", " — "];
  let separators_2 = [
    "ft",
    "ft.",
    " ft. ",
    "Ft.",
    " Ft. ",
    " feat. ",
    " feat ",
    "FEAT.",
    " FEAT. ",
    " | ",
  ];
  let separators_3 = [
    ",",
    " , ",
    "ft",
    "ft.",
    " ft. ",
    "Ft.",
    " Ft. ",
    " feat. ",
    " feat ",
    "FEAT.",
    " FEAT. ",
    "|",
    " | ",
    "&",
    " & ",
    " x ",
    " X ",
  ];
  let endIndexArtist = -1;
  let startIndexTrack = -1;
  let endIndexTrack = -1;

  for (i in separators) {
    let sep = separators[i];
    startIndexTrack = str.indexOf(sep);
    if (startIndexTrack > -1) break;
  }
  endIndexArtist = startIndexTrack;

  for (i in separators_2) {
    let sep = separators_2[i];
    endIndexTrack = str.indexOf(sep);
    if (endIndexTrack > -1) {
      break;
    }
  }

  for (i in separators_3) {
    let sep = separators_3[i];
    if (str.indexOf(sep) > -1) {
      endIndexArtist = Math.min(endIndexArtist, str.indexOf(sep));
    }
  }

  if (endIndexTrack < startIndexTrack) {
    endIndexTrack = -1;
  }

  if (endIndexTrack == -1) {
    endIndexTrack = str.length;
  } else {
    endIndexTrack = endIndexTrack - startIndexTrack;
  }

  if (startIndexTrack > -1) {
    return {
      endIndexArtist: endIndexArtist,
      startIndexTrack: startIndexTrack,
      endIndexTrack: endIndexTrack,
    };
  }

  return null;
}

/**
 * Clean non-informative garbage from title
 */
function cleanArtistTrack(artist, track) {
  // Do some cleanup
  artist = artist.replace(/^\s+|\s+$/g, "");
  track = track.replace(/^\s+|\s+$/g, "");

  // Strip crap
  track = track.replace(/\s*\*+\s?\S+\s?\*+$/, ""); // **NEW**
  track = track.replace(/\s*\[[^\]]+\]$/, ""); // [whatever]
  track = track.replace(/\s*\([^\)]*version\)$/i, ""); // (whatever version)
  track = track.replace(/\s*\(Prod*[^\)]+\)$/i, ""); // (Prod......)
  track = track.replace(/\s*\(Directed*[^\)]+\)$/i, ""); // (Directed.......)
  track = track.replace(/\s*\.(avi|wmv|mpg|mpeg|flv)$/i, ""); // video extensions
  track = track.replace(/\s*(LYRIC VIDEO\s*)?(lyric video\s*)/i, ""); // (LYRIC VIDEO)
  track = track.replace(/\s*(Explicit\s*)?(EXPLICIT\s*)/i, ""); // (LYRIC VIDEO)
  track = track.replace(/\s*(2k19\s*)?(2K19\s*)/i, ""); // (LYRIC VIDEO)
  track = track.replace(/\s*(bonus\s*)?(track\s*)/i, ""); // (BONUS TRACK)
  track = track.replace(/\s*(Lyrics\s*)?(lyrics\s*)/i, ""); // (BONUS TRACK)
  track = track.replace(/\s*(Official Track Stream*)/i, ""); // (Official Track Stream)
  track = track.replace(/\s*(of+icial\s*)?(music\s*)?video/i, ""); // (official)? (music)? video
  // track = track.replace(/\s*(of+icial\s*)?(music\s*)?audio/i, ''); // (official)? (music)? audio
  track = track.replace(/\s*(ALBUM TRACK\s*)?(album track\s*)/i, ""); // (ALBUM TRACK)
  track = track.replace(/\s*(COVER ART\s*)?(Cover Art\s*)/i, ""); // (Cover Art)
  track = track.replace(/\s*\((^\))+\]$/, "");
  track = track.replace(/\s*\(\s*of+icial\s*\)/i, ""); // (official)
  track = track.replace(/\s*\(\s*[0-9]{4}\s*\)/i, ""); // (1999)
  track = track.replace(/\s+\(\s*(HD|HQ)\s*\)$/, ""); // HD (HQ)
  track = track.replace(/\s+(MV|PV)$/i, ""); // (MV)
  track = track.replace(/\s+(HD|HQ)\s*$/, ""); // HD (HQ)
  track = track.replace(/\s*video\s*clip/i, ""); // video clip
  track = track.replace(/\s+\(?live\)?$/i, ""); // live
  track = track.replace(/\(+\s*\)+/, ""); // Leftovers after e.g. (official video)
  track = track.replace(/^(|.*\s)"(.*)"(\s.*|)$/, "$2"); // Artist - The new "Track title" featuring someone
  track = track.replace(/^(|.*\s)'(.*)'(\s.*|)$/, "$2"); // 'Track title'
  track = track.replace(/^[\/\s,:;~-\s"]+/, ""); // trim starting white chars and dash
  track = track.replace(/[\/\s,:;~-\s"\s!]+$/, ""); // trim trailing white chars and dash
  //" and ! added because some track names end as {"Some Track" Official Music Video!} and it becomes {"Some Track"!} example: http://www.youtube.com/watch?v=xj_mHi7zeRQ

  return { artist: artist, track: track };
}

function cleanTrack(track) {
  track = track.replace(/^\s+|\s+$/g, "");

  // Strip crap
  track = track.replace(/\s*\*+\s?\S+\s?\*+$/, ""); // **NEW**
  track = track.replace(/\s*\[[^\]]+\]$/, ""); // [whatever]
  track = track.replace(/\s*\([^\)]*version\)$/i, ""); // (whatever version)
  track = track.replace(/\s*\(feat*[^\)]+\)$/i, ""); // (feat. ...)
  track = track.replace(/\s*\(Prod*[^\)]+\)$/i, ""); // (Prod.....)
  track = track.replace(/\s*\.(avi|wmv|mpg|mpeg|flv)$/i, ""); // video extensions
  track = track.replace(/\s*(LYRIC VIDEO\s*)?(lyric video\s*)/i, ""); // (LYRIC VIDEO)
  track = track.replace(/\s*(Explicit\s*)?(EXPLICIT\s*)/i, ""); // (EXPLICIT)
  track = track.replace(/\s*(Topic\s*)?(TOPIC\s*)/i, ""); // (EXPLICIT)
  track = track.replace(/\s*(Bonus Track\s*)?(BONUS TRACK\s*)/i, ""); // (BONUS TRACK)
  track = track.replace(/\s*(Official Track Stream*)/i, ""); // (Official Track Stream)
  track = track.replace(/\s*(of+icial\s*)?(music\s*)?video/i, ""); // (official)? (music)? video
  track = track.replace(/\s*(of+icial\s*)?(music\s*)?audio/i, ""); // (official)? (music)? audio
  track = track.replace(/\s*(ALBUM TRACK\s*)?(album track\s*)/i, ""); // (ALBUM TRACK)
  track = track.replace(/\s*(COVER ART\s*)?(Cover Art\s*)/i, ""); // (Cover Art)
  track = track.replace(/\s*(MUSIC\s*)?(Music\s*)/i, ""); // (Cover Art)
  track = track.replace(/\s*\((^\))+\]$/, "");
  track = track.replace(/\s*\(\s*of+icial\s*\)/i, ""); // (official)
  track = track.replace(/\s*\(\s*[0-9]{4}\s*\)/i, ""); // (1999)
  track = track.replace(/\s+\(\s*(HD|HQ)\s*\)$/, ""); // HD (HQ)
  track = track.replace(/\s+(HD|HQ)\s*$/, ""); // HD (HQ)
  track = track.replace(/\s*video\s*clip/i, ""); // video clip
  track = track.replace(/\s+\(?live\)?$/i, ""); // live
  track = track.replace(/\(+\s*\)+/, ""); // Leftovers after e.g. (official video)
  track = track.replace(/^(|.*\s)"(.*)"(\s.*|)$/, "$2"); // Artist - The new "Track title" featuring someone
  track = track.replace(/^(|.*\s)'(.*)'(\s.*|)$/, "$2"); // 'Track title'
  track = track.replace(/^[\/\s,:;~-\s"]+/, ""); // trim starting white chars and dash
  track = track.replace(/[\/\s,:;~-\s"\s!]+$/, ""); // trim trailing white chars and dash
  //" and ! added because some track names end as {"Some Track" Official Music Video!} and it becomes {"Some Track"!} example: http://www.youtube.com/watch?v=xj_mHi7zeRQ

  return track;
}
