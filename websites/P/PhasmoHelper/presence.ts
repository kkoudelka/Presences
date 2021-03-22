interface IGameProps {
  gamePhase: GamePhase;
  huntRemainingTime: number;
}

type GamePhase = 'Investigating' | 'Hunt';

const def: IGameProps = {
  gamePhase: 'Investigating',
  huntRemainingTime: 0,
};


const getGameData = (): IGameProps => {

  const res = JSON.parse(localStorage.getItem('game'));
  if (!res) {
    return def;
  }
  return res as IGameProps;
}

const presence = new Presence({
  clientId: "823322014860968009"
}),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"

  });

let startEpoch: number = null;

// TODO: Add icons

presence.on("UpdateData", async () => {

  const gameData = getGameData();

  const { gamePhase, huntRemainingTime } = gameData;

  if (gamePhase === "Hunt") {
    startEpoch = null;
    const timeEnd = new Date();
    timeEnd.setSeconds(timeEnd.getSeconds() + huntRemainingTime);

    const epoch = timeEnd.getTime() / 1000;

    const presenceData: PresenceData = {
      largeImageKey: "key",
      smallImageKey: "key",
      smallImageText: "Some hover text",
      details: "Currently escaping a hunt",
      state: "",
      endTimestamp: epoch,
    };

    presence.setActivity(presenceData);
    return;
  }

  if (!startEpoch) {
    startEpoch = new Date().getTime() / 1000;
  }

  const presenceData: PresenceData = {
    largeImageKey: "key",
    smallImageKey: "key",
    smallImageText: "Some hover text",
    details: "Investigating the ghost type",
    startTimestamp: startEpoch,
    state: "",
  };
  presence.setActivity(presenceData)
  return;

  if (presenceData.details == null) {
    //This will fire if you do not set presence details
    presence.setTrayTitle(); //Clears the tray title for mac users
    presence.setActivity(); /*Update the presence with no data, therefore clearing it and making the large image the Discord Application icon, and the text the Discord Application name*/
  } else {
    //This will fire if you set presence details
    ; //Update the presence with all the values from the presenceData object
  }
});