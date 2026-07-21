import type { IdeIcon } from "../ide-route";

export type FsNodeType = "dir" | "file";

export interface FsNode {
  readonly name: string;
  readonly type: FsNodeType;
  readonly icon?: IdeIcon;
  readonly href?: string;
  readonly anchor?: string;
  readonly preview?: string;
  readonly children?: readonly FsNode[];
}

export type LineTone = "default" | "accent" | "faint" | "error" | "dir";

export interface TerminalLine {
  readonly text: string;
  readonly tone?: LineTone;
}

export interface ShellState {
  readonly cwd: string;
}

export interface CommandResult {
  readonly output: readonly TerminalLine[];
  readonly newCwd?: string;
  readonly navigateTo?: string;
  readonly clear?: boolean;
}
