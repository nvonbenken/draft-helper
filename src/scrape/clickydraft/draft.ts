import { Pick } from "./pick";

export class Draft {
  Teams: string[];
  Picks: Pick[];

  constructor() {
    this.Teams = [];
    this.Picks = [];
  }
}