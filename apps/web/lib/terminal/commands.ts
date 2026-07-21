import { findNode, listDir, resolvePath } from "./resolve-path";
import type { CommandResult, FsNode, ShellState, TerminalLine } from "./types";

export const SUPPORTED_COMMANDS = [
  "help",
  "ls",
  "cd",
  "cat",
  "open",
  "pwd",
  "clear",
  "whoami",
] as const;

const COMMAND_HELP: Record<(typeof SUPPORTED_COMMANDS)[number], string> = {
  help: "lista os comandos disponíveis",
  ls: "lista o conteúdo de um diretório",
  cd: "entra num diretório",
  cat: "imprime a descrição de um arquivo",
  open: "abre o arquivo ou diretório no site",
  pwd: "mostra o diretório atual",
  clear: "limpa a tela",
  whoami: "mostra quem está navegando",
};

const MAX_LINE_LENGTH = 1000;

function error(text: string): CommandResult {
  return { output: [{ text, tone: "error" }] };
}

function toLines(text: string): TerminalLine[] {
  return text.split("\n").map((line) => ({ text: line }));
}

function targetPath(cwd: string, arg: string | undefined): string {
  return arg ? resolvePath(cwd, arg) : cwd;
}

function runLs(root: FsNode, cwd: string, arg?: string): CommandResult {
  const path = targetPath(cwd, arg);
  const entries = listDir(root, path);
  if (!entries) return error(`ls: ${arg ?? path}: No such file or directory`);
  const output: TerminalLine[] = entries.map((entry) =>
    entry.type === "dir"
      ? { text: `${entry.name}/`, tone: "dir" }
      : { text: entry.name },
  );
  return { output };
}

function runCd(root: FsNode, cwd: string, arg?: string): CommandResult {
  if (!arg) return { output: [], newCwd: "/" };
  const path = resolvePath(cwd, arg);
  const node = findNode(root, path);
  if (!node) return error(`cd: no such file or directory: ${arg}`);
  if (node.type !== "dir") return error(`cd: not a directory: ${arg}`);
  return { output: [], newCwd: path };
}

function runCat(root: FsNode, cwd: string, arg?: string): CommandResult {
  if (!arg) return error("cat: missing operand");
  const path = resolvePath(cwd, arg);
  const node = findNode(root, path);
  if (!node) return error(`cat: ${arg}: No such file or directory`);
  if (node.type === "dir") return error(`cat: ${arg}: Is a directory`);
  return { output: toLines(node.preview ?? node.name) };
}

function runOpen(root: FsNode, cwd: string, arg?: string): CommandResult {
  if (!arg) return error("open: missing operand");
  const path = resolvePath(cwd, arg);
  const node = findNode(root, path);
  if (!node) return error(`open: ${arg}: No such file or directory`);
  if (!node.href) return error(`open: cannot open ${arg}`);
  const href = node.anchor ? `${node.href}#${node.anchor}` : node.href;
  return { output: [{ text: `abrindo ${node.name}...`, tone: "faint" }], navigateTo: href };
}

function runHelp(): CommandResult {
  const output: TerminalLine[] = [
    { text: "comandos:", tone: "faint" },
    ...SUPPORTED_COMMANDS.map((name) => ({
      text: `  ${name.padEnd(8)}${COMMAND_HELP[name]}`,
    })),
  ];
  return { output };
}

export function runCommand(
  line: string,
  root: FsNode,
  state: ShellState,
): CommandResult {
  const trimmed = line.trim().slice(0, MAX_LINE_LENGTH);
  if (!trimmed) return { output: [] };
  const [command, ...args] = trimmed.split(/\s+/);
  const arg = args[0];
  switch (command) {
    case "help":
      return runHelp();
    case "pwd":
      return { output: [{ text: state.cwd }] };
    case "ls":
      return runLs(root, state.cwd, arg);
    case "cd":
      return runCd(root, state.cwd, arg);
    case "cat":
      return runCat(root, state.cwd, arg);
    case "open":
      return runOpen(root, state.cwd, arg);
    case "clear":
      return { output: [], clear: true };
    case "whoami":
      return { output: [{ text: "visitante" }] };
    default:
      return error(`zsh: command not found: ${command}`);
  }
}
