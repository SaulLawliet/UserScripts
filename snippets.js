
/** 获取Steam已有游戏ID, 只包含在售游戏, 速度快 */
function getAppidListByApi() {
  // let url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=1470922A6B6E5C001546E51ACA5D987B&include_played_free_games=true&steamid=${steamId}`;
  let url = `https://steamdb.keylol.com/syncProxy.php?type=own&id=${steamId}`;
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'get',
      url: url,
      responseType: 'json',
      onload: function (result) {
        resolve(result.response);
      },
      onerror: reject,
      ontimeout: reject,
    })
  });
}

/** 获取Steam已有游戏ID, 包含所有游戏, 速度较慢 */
function getAppidListByWeb() {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'get',
      url: `http://steamcommunity.com/profiles/${steamId}/games/?tab=all`,
      onload: function (result) {
        result.responseText.split('\n').forEach((line) => {
          if (line.indexOf('var rgGames') >= 0) {
            line = line.replace('var rgGames = ', '');
            line = line.replace('];', ']');
            const games = JSON.parse(line);
            const data = {
              response: {
                game_count: games.length,
                games: games,
              }
            };
            resolve(data);
          }
        });
      },
      onerror: reject,
      ontimeout: reject,
    });
  });
}
