const presence = new Presence({
  clientId: "813038241451343882"
}),
  startsTime = Math.floor(Date.now() / 1000),
  ShowData = {
    title: "",
    ep: '',
    duration: 0,
    currentTime: 0,
    paused: true,
    playback: false
},
  getStrings = async () => presence.getStrings({
      play: "general.playing",
      paused: "general.paused",
      browse: "general.browsing",
      episode: "general.episode",
      searchFor: "general.searchFor",
      searching: "general.search",
      viewEpisode: "general.buttonViewEpisode",
      reading: "general.reading",
      viewPage: "general.viewPage"
  }, await presence.getSetting('lang'));

let strings = getStrings(),
  oldLang: string = null;

presence.on("iFrameData", (data: Data) => {
  ShowData.playback = !isNaN(data.iframe_video.duration) ? true : false;

  if (ShowData.playback){
    ShowData.duration = data.iframe_video.duration;
    ShowData.paused = data.iframe_video.paused;
    ShowData.currentTime = data.iframe_video.currentTime;
  }
});

presence.on("UpdateData", async () => {

  const presenceData: PresenceData = {
      largeImageKey: "dramacool_logo_b",
      details: "Browsing",
      smallImageText: "Browsing",
      smallImageKey: "reading",
      startTimestamp: startsTime
  },
      newLang = await presence.getSetting('lang'),
      showButtons = await presence.getSetting("buttons"),
      pathname = document.location.pathname;

  if (!oldLang){
      oldLang = newLang;
  } else if (oldLang !== newLang){
      oldLang = newLang;
      strings = getStrings();
  }

  if (pathname.includes("running-man")) presenceData.largeImageKey = "rm";

  if (pathname.includes('/drama-detail')){
      ShowData.title = document.querySelector('h1').textContent;

      presenceData.smallImageText = (await strings).reading;

      presenceData.details = (await strings).viewPage;
      presenceData.state = ShowData.title;
  } else if (pathname.includes("/search")) {
      const searchType = document.location.search.includes("movies") ? "Movies" : "Stars";

      presenceData.details = (await strings).searchFor;
      presenceData.state = searchType;

      presenceData.smallImageKey = 'search';
      presenceData.smallImageText = (await strings).searching;
  } else if (pathname.includes("/")){
      ShowData.title = document.querySelector('div.category > a')?.textContent;

      if (ShowData.playback){
          const timestamps = presence.getTimestamps(ShowData.currentTime, ShowData.duration);
          ShowData.ep = (document.title.match(/Episode ?([1-9]?[0-9]?[0-9])?( & )?([1-9]?[0-9]?[0-9])/g) || document.URL.match(/episode-?([1-9]?[0-9]?[0-9])/g))[0].replace(/(episode)(-)?/i, "");

          presenceData.smallImageKey = ShowData.paused ? "pause" : "play";
          presenceData.smallImageText = ShowData.paused ? (await strings).paused : (await strings).play;

          presenceData.details = ShowData.title;
          presenceData.state = `${(await strings).episode} ${ShowData.ep}`;

          presenceData.startTimestamp = timestamps[0];
          presenceData.endTimestamp = timestamps[1];

          if (showButtons) { 
              presenceData.buttons = [{
                  label: (await strings).viewEpisode,
                  url: document.baseURI
              }];
          } else delete presenceData.buttons;

          if (ShowData.paused){
              delete presenceData.startTimestamp;
              delete presenceData.endTimestamp;
          }
      } else if (ShowData.title) {
          presenceData.smallImageText = (await strings).reading;
  
          presenceData.details = (await strings).viewPage;
          presenceData.state = ShowData.title;
      }
  }

  presence.setActivity(presenceData);
});

interface Data {
  iframe_video: {
      currentTime: number
      paused: boolean
      duration: number
  }
}