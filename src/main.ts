const fs = require("fs");
const clickyDraftScraper = require("./scrape/clickyDraft.ts");

fs.readFile("./settings/config.json", "utf8", (err, data) => {
  if (err) {
    console.log(err);
  } else {
    var json = JSON.parse(data);
    console.log(json);
    clickyDraftScraper.GetDraftData(json);
  }
});
