var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

const apikey =  "AIzaSyDpBSBNxxn46UVjhR-TcpWd3rL4bexxgZs"

const part = "snippet"

const maxResults = 5

let channelId = "UClkH8tZIQObjz1xKu84oEVw"

let result = httpGet("https://youtube.googleapis.com/youtube/v3/subscriptions?part=" + part + "&maxResults=" + maxResults + "&channelId=" + channelId + "&key=" + apikey)

let count = 0
result.items.forEach(item => {
    channelId = item.snippet.resourceId.channelId
    console.log(channelId);
    count++
});
console.log(count);