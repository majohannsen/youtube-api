import { createConnection } from "mysql";
var xhr = new XMLHttpRequest();

var con = createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "youtubeapi",
});

function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return JSON.parse(xmlHttp.responseText);
}

function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(JSON.parse(xmlHttp.responseText));
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}

const apikey = "AIzaSyDpBSBNxxn46UVjhR-TcpWd3rL4bexxgZs";

let channelsFound = [];

con.connect((err) => {
  if (err) {
    if (err) throw err;
  }

  getSubscribers("UClkH8tZIQObjz1xKu84oEVw", null, 1);
  console.log("finished");
});

function getSubscribers(channelId, subscriberChannelId, depth) {
  if (depth <= 2) {
    // channel schon mal untersucht?
    if (!channelsFound.includes(channelId)) {
      channelsFound.push(channelId);
      // daten holen und speichern
      saveChannelData(channelId, subscriberChannelId);
      // subscriptions holen
      const subscriptions = httpGet(
        "https://youtube.googleapis.com/youtube/v3/subscriptions?part=snippet&maxResults=50&channelId=" +
          channelId +
          "&key=" +
          apikey
      );
      try {
        subscriptions.items.forEach((subscription) => {
          getSubscribers(
            subscription.snippet.resourceId.channelId,
            channelId,
            depth + 1
          );
        });
      } catch {}
    }
  }
}

function saveChannelData(channelId, subscriberChannelId) {
  // daten holen
  const statistics = httpGet(
    "https://youtube.googleapis.com/youtube/v3/channels?part=statistics&key=" +
      apikey +
      "&id=" +
      channelId
  ).items[0].statistics;
  const snippet = httpGet(
    "https://youtube.googleapis.com/youtube/v3/channels?part=snippet&key=" +
      apikey +
      "&id=" +
      channelId
  ).items[0].snippet;
  console.log(channelsFound.length);
  console.log(channelId);
  console.log(snippet.title);
  // daten speichern

  con.query(
    `
            insert into channels (channelId, title, viewCount, subscriberCount, videoCount, defaultLanguage, country) values
            ('` +
      channelId +
      `', '` +
      snippet.title +
      `', '` +
      statistics.viewCount +
      `', '` +
      statistics.subscriberCount +
      `', '` +
      statistics.videoCount +
      `', '` +
      snippet.defaultLanguage +
      `', '` +
      snippet.country +
      `')
            `,
    (err, result) => {
      if (err) throw err;
      if (subscriberChannelId) {
        con.query(
          `
                    insert into connection (channelId, subscribedBy) values
                    ('` +
            channelId +
            `', '` +
            subscriberChannelId +
            `')
                    `,
          (err, result) => {
            if (err) throw err;
          }
        );
      }
    }
  );
}
