export class Config {
  Leagues: ConfigItem[];

  constructor() {
    this.Leagues = [];
  }
}

export class ConfigItem {
  LeagueName: string;
  Year: number;
  ScrapeFromUrl: string;
  PushToUrl: string;

  constructor() {
    this.LeagueName = "";
    this.Year = 0;
    this.ScrapeFromUrl = "";
    this.PushToUrl = "";
  }
}
