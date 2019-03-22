export class Pick {
  DraftedBy: string;
  Overall: number;
  Round: number;
  Pick: number;
  Player: string;
  Position: string;
  Team: string;

  constructor(draftedBy: string, overall: number, round: number, pick: number, player: string, position: string, team: string) {
    this.DraftedBy = draftedBy;
    this.Overall = overall;
    this.Round = round;
    this.Pick = pick;
    this.Player = player;
    this.Position = position;
    this.Team = team;
  }
}