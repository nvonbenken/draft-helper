import puppeteer from "puppeteer";
import fs from "fs";
import {parse} from "json2csv";

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
  GetDraftData: function(data) {
    for (var league in data) {
      console.log(league);
    }
  }
};

const sortPicks = picks => picks.sort((a, b) => a.overall - b.overall);

const saveJson = (result, name) => {
  fs.writeFile(
    `output/2019/json/output-${name}.json`,
    JSON.stringify(result),
    error => {
      if (error) {
        return console.log(error);
      }
    }
  );
};

const saveCsv = (picks, name) => {
  const csv = json2csv(picks, [
    "Drafted By",
    "Overall",
    "Round",
    "Pick",
    "Player",
    "Position",
    "Team"
  ]);
  fs.writeFile(`output/2019/csv/${name}.csv`, csv, error => {
    if (error) {
      return console.log(error);
    }
  });
};

const scrape = async (url, name) => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();

  await page.goto(url);
  await page.setViewport({
    width: 1200,
    height: 1160
  });
  await page.screenshot({
    path: `output/2019/screenshots/${name}.png`
  });

  const result = await page.evaluate(() => {
    const draft = {
      teams: [],
      picks: []
    };

    const outfield = ["LF", "CF", "RF"];

    [].slice
      .call(document.querySelectorAll(".boardData"))
      .slice(0, 12)
      .forEach(el => {
        draft.teams.push(el.innerText.trim());
      });

    [].slice.call(document.querySelectorAll(".playerPicked")).forEach(p => {
      const pickNum = p.id.match(/\d+/)[0];
      const round =
        pickNum.length === 4
          ? parseInt(pickNum.substring(0, 1), 10)
          : parseInt(pickNum.substring(0, 2), 10);

      const pick = parseInt(pickNum.substring(2), 10);

      draft.picks.push({
        draftedBy: draft.teams[round % 2 === 0 ? 12 - pick : pick - 1],
        overall: (round - 1) * 12 + pick,
        round,
        pick,
        player: `${p
          .querySelector(".playerFName")
          .innerText.trim()} ${p
          .querySelector(".playerLName")
          .innerText.trim()}`,
        position: outfield.includes(
          p.querySelector(".playerPos").innerText.trim()
        )
          ? "OF"
          : p.querySelector(".playerPos").innerText.trim(),
        team: p.querySelector(".playerTeam").innerText.trim()
      });
    });

    return draft;
  });

  browser.close();
  result.picks = sortPicks(result.picks);
  saveJson(result, name);
  saveCsv(result.picks, name);

  return result;
};
