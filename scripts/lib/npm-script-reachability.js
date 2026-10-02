"use strict";

function successChainCommands(source, name) {
  const commands = [];
  let start = 0;
  let quote = "";
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "\\" && source[i + 1] && quote !== "'") { i += 1; continue; }
    if (quote) {
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === "&" && source[i + 1] === "&") {
      commands.push(source.slice(start, i).trim());
      i += 1;
      start = i + 1;
    } else if (ch === ";" || ch === "|" || ch === "&" || ch === "\n" || ch === "\r") {
      throw new Error(`Unsupported npm script control chain: ${name}`);
    }
  }
  if (quote) throw new Error(`Unterminated npm script quote: ${name}`);
  commands.push(source.slice(start).trim());
  if (commands.some(command => !command)) throw new Error(`Empty npm script command: ${name}`);
  return commands;
}

function reachableNpmScripts(scripts, entry) {
  const reachable = new Set();
  const visiting = [];
  function visit(name) {
    if (visiting.includes(name)) throw new Error(`npm script cycle: ${[...visiting, name].join(" -> ")}`);
    if (reachable.has(name)) return;
    if (!Object.prototype.hasOwnProperty.call(scripts || {}, name) || typeof scripts[name] !== "string") {
      throw new Error(`Unknown npm script: ${[...visiting, name].join(" -> ")}`);
    }
    visiting.push(name);
    for (const command of successChainCommands(scripts[name], name)) {
      const alias = command.match(/^npm\s+run\s+([\w:.-]+)\s*$/);
      if (alias) visit(alias[1]);
      else if (/^npm\s+run\b/.test(command)) throw new Error(`Unsupported npm run command: ${name}: ${command}`);
    }
    visiting.pop();
    reachable.add(name);
  }
  visit(entry);
  return reachable;
}

module.exports = { reachableNpmScripts };
