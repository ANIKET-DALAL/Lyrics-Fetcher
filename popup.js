window.addEventListener("load", updatePage);

function updatePage() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    let activeTab = tabs[0];
    chrome.tabs.sendMessage(
      activeTab.id,
      { command: "lyrics" },
      function (response) {
        if (response == undefined || response == null) {
          if ($.trim($("#songName").html()) != "") {
            $("#songName").empty();
          }
          lyrics.append(`try to play a youtube video or refresh the page`);
        } else {
          console.log(response);
          getLyricsByArtistAndSong(response.artist, response.track);
        }
      }
    );
  });
  $("#search_panel").show();
}

function getLyricsByArtistAndSong(artist, song) {
  let search_button = $("#search_button");
  let lyrics = $("#lyrics");
  let song_name = $("#songName");
  let artist_name = $("#artistName");
  let by = $("#by");
  search_button.hide();
  $.ajax({
    method: "GET",
    url: `https://api.vagalume.com.br/search.php?art=${artist}&mus=${song}&extra=relmus&apikey={key}`,
    success: async function (data) {
      if ($.trim(lyrics.html()) != "") {
        lyrics.empty();
      }

      if ($.trim(artist_name.html()) != "") {
        artist_name.empty();
      }
      if ($.trim(by.html()) != "") {
        by.empty();
      }
      if (data.type == "song_notfound" || data.type == "notfound") {
        let GENIUS_ACCESS_TOKEN = `6KPdL0K4UDfiGZNYpFZkjzWJxfzGT_Z4cQjpFxU6O2s4p76zq5C3WmOHrtjE4ddj`;
        await $.ajax({
          method: "GET",
          url: `https://api.genius.com/search?access_token=${GENIUS_ACCESS_TOKEN}&q=${artist}%20${song}&per_page=1`,
          success: function (data) {
            if (data.response.hits.length > 0) {
              $.ajax({
                method: "GET",
                url: data.response.hits[0].result.url,
                mode: "cors",
                success: async function (data_recieved) {
                  let songTitle = data.response.hits[0].result.title;
                  let artistName =
                    data.response.hits[0].result.primary_artist.name;
                  let html = $($.parseHTML(data_recieved));
                  let ly = html.find(".lyrics").text();
                  if (ly != "") {
                    ly = ly.split(/\r?\n/);
                    ly.forEach(function (element, index, arr) {
                      if (arr[index].trim() !== "")
                        arr[index] = `<p> ${arr[index]} </p>`;
                    });
                    if ($.trim(song_name.html()) != "") {
                      song_name.empty();
                    }
                    song_name.append(songTitle);
                    by.append("by");
                    artist_name.append(artistName);
                    lyrics.append(ly);
                  } else {
                    ly = html.find(".Lyrics__Container-sc-a49d8432-1.fBKwZw");
                    ly.find(".LyricsHeader__Container-sc-5e4b7146-1.hFsUgC").remove();
                    console.log(ly);
                    if ($.trim(song_name.html()) != "") {
                      song_name.empty();
                    }
                    song_name.append(songTitle);
                    by.append("by");
                    artist_name.append(artistName);
                    lyrics.append(ly);
                    $("a").contents().unwrap();
                    $("span").contents().unwrap();
                    // $(function () {
                    //   $("body").html(
                    //     $("body")
                    //       .html()
                    //       .replace(/<br>\\/g, "</p><p>")
                    //   );
                    // });
                    $(function replaceText() {
                      $("br").replaceWith("<p></p>");
                    });
                  }
                },
              });
            } else {
              if ($.trim(song_name.html()) != "") {
                song_name.empty();
              }
              lyrics.append("Lyrics not found :(");
            }
          },
        });
      } else {
        if ($.trim(song_name.html()) != "") {
          song_name.empty();
        }
        let songTitle = data.mus[0].name;
        let artistName = data.art.name;
        let ly = data.mus[0].text;
        ly = ly.split(/\r?\n/);
        ly.forEach(function (element, index, arr) {
          if (arr[index].trim() !== "") arr[index] = `<p> ${arr[index]} </p>`;
        });
        song_name.append(songTitle);
        by.append("by");
        artist_name.append(artistName);
        lyrics.append(ly);
      }
    },
  });
}

$("#bt_search").click(function () {
  if ($("#artist").is(":visible")) {
    $("#artist").hide();
    $("#song").hide();
  } else {
    $("#artist").show();
    $("#song").show();
  }
});
let q = 0;

$("#song").keyup(function (event) {
  if (event.keyCode === 13) {
    q = 1;
    $("#artist").hide();
    $("#song").hide();
    $("#song").click();
  }
});

$("#song").click(function () {
  if (q == 1) {
    q = 0;
    let song_input = $("#song").val();
    let artist_input = $("#artist").val();
    getLyricsByArtistAndSong(artist_input, song_input);
  }
});


