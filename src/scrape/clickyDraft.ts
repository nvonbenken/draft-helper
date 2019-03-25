import puppeteer from "puppeteer";
import fs from "fs";

import { Pick } from "./clickydraft/pick";
import { Draft } from "./clickydraft/draft";
import { Config, ConfigItem } from "../config";
import { mapPositions } from "./position-map";
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

export default {
  GetDraftData: function(config: Config): void {
    for (var league of config.Leagues) {
      init(league);
      scrape(league);
    }
  }
};

const init: Function = (league: ConfigItem) => {
  if (!fs.existsSync(`output/${league.LeagueName}/${league.Year}/`)) {
    fs.mkdir(
      `output/${league.LeagueName}/${league.Year}/`,
      {
        recursive: true
      },
      err => {
        if (err) {
          console.log("mkdir error");
        }
      }
    );
  }
};

const chunk: Function = (input: string[], size: number): string[][] => {
  return input.reduce((arr, item, idx): any => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};

const addPicks: Function = (teams: string[], picks: string[][]): Pick[] => {
  let p: Pick[] = [];
  picks.forEach((pick, index) => {
    let overallPickNumber = index + 1;
    let round = Math.ceil(overallPickNumber / teams.length);
    let roundPickNumber = (index % teams.length) + 1;
    p.push(
      new Pick(
        teams[
          round % 2 === 0 ? teams.length - roundPickNumber : roundPickNumber - 1
        ],
        overallPickNumber,
        round,
        roundPickNumber,
        `${pick[2]} ${pick[3]}`,
        mapPositions(pick[0]),
        pick[1]
      )
    );
  });
  return p;
};

const saveJson: Function = (result: Draft, league: ConfigItem): void => {
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

const saveCsv: Function = (picks: Pick[], league: ConfigItem): void => {
  const csv: any = json2csv(picks, [
    "Drafted By",
    "Overall",
    "Round",
    "Pick",
    "Player",
    "Position",
    "Team"
  ]);
  fs.writeFile(
    `output/${league.LeagueName}/${league.Year}/${league.LeagueName}.csv`,
    csv,
    error => {
      if (error) {
        return console.log(error);
      }
    }
  );
};

const saveScreenshot: Function = async (page: any, league: ConfigItem) => {
  await page.setViewport({
    width: 1200,
    height: 1160
  });
  await page.screenshot({
    path: `output/${league.LeagueName}/${league.Year}/${league.LeagueName}.png`
  });
};

const scrape: Function = async (league: ConfigItem) => {
  const browser: any = await puppeteer.launch({ headless: true });
  const page: any = await browser.newPage();
  await page.goto(league.ScrapeFromUrl, { waitUntil: "load" });

  const draft: Draft = new Draft();

  const teams: string[] = await page.evaluate(() =>
    [...document.querySelectorAll(".boardData > div:first-of-type")]
      .map(el => el.innerHTML.trim())
      .slice(0, 12)
  );

  const pickElements: Element[] = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        ".playerPicked > div:not(.pickTeamOwner):not(.playerBye)"
      )
    ].map(el => el.innerHTML)
  );
  var pickArray = chunk(pickElements, 4);

  draft.Teams = teams;
  draft.Picks = addPicks(teams, pickArray);

  saveJson(draft, league);
  saveCsv(draft.Picks, league);
  saveScreenshot(page, league);
};
