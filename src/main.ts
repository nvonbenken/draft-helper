import fs from "fs";
import clickyDraftScraper from "./scrape/clickyDraft";
import { Config } from "./config";

fs.readFile("./settings/config.json", "utf8", (err: any, data: string) => {
  if (err) {
    console.log(err);
  } else {
    var json: Config = JSON.parse(data);
    clickyDraftScraper.GetDraftData(json);
  }
});
