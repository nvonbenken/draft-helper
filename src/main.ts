import fs from "fs";
import clickyDraftScraper from "./scrape/clickyDraft";

fs.readFile("./settings/config.json", "utf8", (err: any, data: string) => {
  if (err) {
    console.log(err);
  } else {
    var json = JSON.parse(data);
    console.log(json);
    clickyDraftScraper.GetDraftData(json);
  }
});
