import { Config, ConfigItem } from "../config";

import puppeteer from "puppeteer";
import fs from "fs";
import { Pick } from "./clickydraft/pick";
import { Draft } from "./clickydraft/draft";
import MapPosition from "./position-map";
// tslint:disable-next-line:typedef
const json2csv = require("json2csv").parse;

// const urls = {
//   2018: {
//     prodigy: "https://clickydraft.com/draftapp/board/99555",
//     futures: "https://clickydraft.com/draftapp/board/99743",
//     legacy: "https://clickydraft.com/draftapp/board/99534",
//     experts: "https://clickydraft.com/draftapp/board/133938"
//   },
//   2019: {
//     prodigy: "https://clickydraft.com/draftapp/board/135073",
//     legacy: "https://clickydraft.com/draftapp/board/135019"
//   }
// };

// scrape config
// - url
// - whatever else might be needed?
// - scrape name to push name map

// push config
// - url
// - credentials

// const config = [{ leagueName, year, scrapeFromUrl, pushToUrl }];

export default {
  GetDraftData: function(leagues: Config[]): void {
    for (var league in leagues) {
      if (league) {
        console.log(league);
        scrape(league);
      }
    }
  }
};

const saveJson: Function = (result: Draft, league: ConfigItem) => {
  fs.writeFile(
    `output/${league.LeagueName}/${league.Year}/${league.LeagueName}.json`,
    JSON.stringify(result),
    error => {
      if (error) {
        return console.log(error);
      }
    }
  );
};

const saveCsv: Function = (picks: Pick[], league: ConfigItem) => {
  const csv: any = json2csv(picks, [
    "Drafted By",
    "Overall",
    "Round",
    "Pick",
    "Player",
    "Position",
    "Team"
  ]);
  fs.writeFile(`output/${league.LeagueName}/${league.Year}/${league.LeagueName}.csv`, csv, error => {
    if (error) {
      return console.log(error);
    }
  });
};

const scrape: Function = async (league: ConfigItem) => {
  const browser: any = await puppeteer.launch({
    headless: true
  });
  const page: any = await browser.newPage();

  await page.goto(league.ScrapeFromUrl);
  await page.setViewport({
    width: 1200,
    height: 1160
  });
  await page.screenshot({
    path: `output/${league.LeagueName}/${league.Year}/${league.LeagueName}.png`
  });

  const result: Draft = await page.evaluate(() => {
    const draft: Draft = new Draft();

    [].slice
      .call(document.querySelectorAll(".boardData"))
      .slice(0, 12)
      .forEach(el => {
        draft.Teams.push(el.innerText.trim());
      });

    [].slice.call(document.querySelectorAll(".playerPicked")).forEach(p => {
      const pickNum: string = p.id.match(/\d+/)[0];
      const pick: number = parseInt(pickNum.substring(2), 10);
      const round: number =
        pickNum.length === 4
          ? parseInt(pickNum.substring(0, 1), 10)
          : parseInt(pickNum.substring(0, 2), 10);

      let draftedBy: string =
        draft.Teams[round % 2 === 0 ? 12 - pick : pick - 1];
      let overall: number = (round - 1) * 12 + pick;
      let player: string = `${p
        .querySelector(".playerFName")
        .innerText.trim()} ${p.querySelector(".playerLName").innerText.trim()}`;
      let position: string = MapPosition(
        p.querySelector(".playerPos").innerText.trim()
      );
      let team: string = p.querySelector(".playerTeam").innerText.trim();

      draft.Picks.push(
        new Pick(draftedBy, overall, round, pick, player, position, team)
      );

      return draft;
    });

    browser.close();
    result.Picks.sort((a: Pick, b: Pick) => a.Overall - b.Overall);
    saveJson(result, league);
    saveCsv(result.Picks, league);

    return result;
  });
};
