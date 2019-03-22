export default {
  MapPositions: function(position: string):string {
    return ["LF", "CF", "RF"].includes(position) ? "OF" : position;
  }
};