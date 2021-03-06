const http = require("http");
const fetch = require("node-fetch");
const url = require("url");
const qs = require("querystring");
const fs = require("fs");

const server = http.createServer(async function(req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});

  var query = url.parse(req.url).query;
  var qp = qs.parse(query)

  if (qp.code) {
    var params = Object.assign(
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      },
      qp
    )

    const response = await fetch("https://slack.com/api/oauth.access?" + qs.stringify(params))
    const json = await response.json()

    if (!json.ok) {
      res.end(json.error)
      return
    }

    fs.readFile("./index.html", "utf8", function(error, contents) {
      if (error) {
        res.end(error);
        return
      }

      var body = contents.replace(/{{token}}/g, json.access_token);

      res.write(body);
      res.end();
      return
    });
  } else {
    fs.readFile("./landing.html", function(error, body) {
      if (error) {
        res.end(error);
        return
      }

      res.write(body);
      res.end();
      return
    });
  }
});

server.listen(process.env.PORT || 8080);
