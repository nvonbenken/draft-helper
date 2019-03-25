export function mapPositions(position: string): string {
  return ["LF", "CF", "RF"].includes(position) ? "OF" : position;
}
