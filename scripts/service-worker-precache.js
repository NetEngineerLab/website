"use strict";

let acorn = null;
try { acorn = require("acorn"); } catch {}
const fs = require("fs");
const path = require("path");

function walk(node, visitor, ancestors = []) {
  if (!node || typeof node !== "object") return;
  visitor(node, ancestors);
  const next = [...ancestors, node];
  for (const [key, value] of Object.entries(node)) {
    if (key === "start" || key === "end") continue;
    if (Array.isArray(value)) value.forEach(child => walk(child, visitor, next));
    else if (value && typeof value === "object" && typeof value.type === "string") walk(value, visitor, next);
  }
}

function memberName(member) {
  if (member?.type !== "MemberExpression") return "";
  if (!member.computed && member.property?.type === "Identifier") return member.property.name;
  if (member.computed && member.property?.type === "Literal") return member.property.value;
  return "";
}

function isFunction(node) {
  return node?.type === "ArrowFunctionExpression" || node?.type === "FunctionExpression";
}

function boundNames(pattern, output = []) {
  if (!pattern) return output;
  if (pattern.type === "Identifier") output.push(pattern.name);
  else if (pattern.type === "RestElement") boundNames(pattern.argument, output);
  else if (pattern.type === "AssignmentPattern") boundNames(pattern.left, output);
  else if (pattern.type === "ArrayPattern") pattern.elements.forEach(element => boundNames(element, output));
  else if (pattern.type === "ObjectPattern") pattern.properties.forEach(property => boundNames(property.type === "RestElement" ? property.argument : property.value, output));
  return output;
}

function shadowsServiceWorkerGlobals(program) {
  let shadowed = false;
  const check = pattern => {
    if (boundNames(pattern).some(name => name === "self" || name === "caches")) shadowed = true;
  };
  walk(program, node => {
    if (node.type === "VariableDeclarator") check(node.id);
    else if (isFunction(node) || node.type === "FunctionDeclaration") {
      if (node.id) check(node.id);
      node.params.forEach(check);
    } else if (node.type === "ClassDeclaration" || node.type === "ClassExpression") check(node.id);
    else if (node.type === "CatchClause") check(node.param);
    else if (node.type === "AssignmentExpression") check(node.left);
    else if (node.type === "UpdateExpression") check(node.argument);
    else if ((node.type === "ForInStatement" || node.type === "ForOfStatement") && node.left?.type !== "VariableDeclaration") check(node.left);
  });
  return shadowed;
}

function tokenizeFallback(source) {
  const tokens = [];
  let i = 0;
  const isIdStart = ch => /[A-Za-z_$]/.test(ch || "");
  const isIdPart = ch => /[A-Za-z0-9_$]/.test(ch || "");
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) { i += 1; continue; }
    if (ch === "/" && source[i + 1] === "/") {
      i += 2;
      while (i < source.length && source[i] !== "\n") i += 1;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      i += 2;
      while (i + 1 < source.length && !(source[i] === "*" && source[i + 1] === "/")) i += 1;
      i = Math.min(source.length, i + 2);
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let raw = ch;
      i += 1;
      let closed = false;
      while (i < source.length) {
        const c = source[i];
        raw += c;
        i += 1;
        if (c === "\\" && i < source.length) {
          raw += source[i];
          i += 1;
          continue;
        }
        if (c === quote) { closed = true; break; }
      }
      if (!closed) return null;
      tokens.push({ type: "string", raw, value: decodeFallbackString(raw) });
      continue;
    }
    if (ch === "`") {
      let raw = ch;
      i += 1;
      let closed = false;
      while (i < source.length) {
        const c = source[i];
        raw += c;
        i += 1;
        if (c === "\\" && i < source.length) {
          raw += source[i];
          i += 1;
          continue;
        }
        if (c === "`") { closed = true; break; }
      }
      if (!closed) return null;
      tokens.push({ type: "template", raw, value: raw.slice(1, -1) });
      continue;
    }
    if (isIdStart(ch)) {
      let j = i + 1;
      while (j < source.length && isIdPart(source[j])) j += 1;
      tokens.push({ type: "id", value: source.slice(i, j) });
      i = j;
      continue;
    }
    if (source.startsWith("=>", i)) {
      tokens.push({ type: "op", value: "=>" });
      i += 2;
      continue;
    }
    if (source.startsWith("!==", i) || source.startsWith("===", i)) {
      tokens.push({ type: "op", value: source.slice(i, i + 3) });
      i += 3;
      continue;
    }
    if (source.startsWith("!=", i) || source.startsWith("==", i) || source.startsWith("<=", i) || source.startsWith(">=", i) || source.startsWith("&&", i) || source.startsWith("||", i)) {
      tokens.push({ type: "op", value: source.slice(i, i + 2) });
      i += 2;
      continue;
    }
    tokens.push({ type: "punct", value: ch });
    i += 1;
  }
  return tokens;
}

function decodeFallbackString(raw) {
  const body = raw.slice(1, -1);
  let out = "";
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (ch !== "\\") { out += ch; continue; }
    i += 1;
    if (i >= body.length) return "";
    const esc = body[i];
    const basic = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v", "0": "\0" };
    if (Object.prototype.hasOwnProperty.call(basic, esc)) out += basic[esc];
    else if (esc === "x" && /^[0-9A-Fa-f]{2}$/.test(body.slice(i + 1, i + 3))) {
      out += String.fromCharCode(parseInt(body.slice(i + 1, i + 3), 16)); i += 2;
    } else if (esc === "u" && /^[0-9A-Fa-f]{4}$/.test(body.slice(i + 1, i + 5))) {
      out += String.fromCharCode(parseInt(body.slice(i + 1, i + 5), 16)); i += 4;
    } else out += esc;
  }
  return out;
}

function tokenIs(tokens, index, value, type = null) {
  const token = tokens[index];
  return Boolean(token && token.value === value && (!type || token.type === type));
}

function matchingToken(tokens, start, open, close) {
  if (!tokenIs(tokens, start, open)) return -1;
  let depth = 0;
  for (let i = start; i < tokens.length; i += 1) {
    if (tokenIs(tokens, i, open)) depth += 1;
    else if (tokenIs(tokens, i, close)) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitTopLevel(tokens, start, end, separator) {
  const parts = [];
  let begin = start;
  let paren = 0, bracket = 0, brace = 0;
  for (let i = start; i < end; i += 1) {
    const v = tokens[i].value;
    if (v === "(") paren += 1;
    else if (v === ")") paren -= 1;
    else if (v === "[") bracket += 1;
    else if (v === "]") bracket -= 1;
    else if (v === "{") brace += 1;
    else if (v === "}") brace -= 1;
    else if (v === separator && paren === 0 && bracket === 0 && brace === 0) {
      parts.push([begin, i]);
      begin = i + 1;
    }
  }
  parts.push([begin, end]);
  return parts.filter(([a, b]) => b > a);
}

function topLevelConstDeclarations(tokens) {
  const output = [];
  let braceDepth = 0;
  for (let i = 0; i < tokens.length; i += 1) {
    const v = tokens[i].value;
    if (v === "{") { braceDepth += 1; continue; }
    if (v === "}") { braceDepth = Math.max(0, braceDepth - 1); continue; }
    if (braceDepth !== 0 || !tokenIs(tokens, i, "const", "id")) continue;
    let end = i + 1;
    let paren = 0, bracket = 0, brace = 0;
    for (; end < tokens.length; end += 1) {
      const x = tokens[end].value;
      if (x === "(") paren += 1;
      else if (x === ")") paren -= 1;
      else if (x === "[") bracket += 1;
      else if (x === "]") bracket -= 1;
      else if (x === "{") brace += 1;
      else if (x === "}") brace -= 1;
      else if (x === ";" && paren === 0 && bracket === 0 && brace === 0) break;
    }
    if (end >= tokens.length) return [];
    for (const [a, b] of splitTopLevel(tokens, i + 1, end, ",")) {
      if (b - a < 3 || tokens[a].type !== "id" || !tokenIs(tokens, a + 1, "=")) continue;
      output.push({ name: tokens[a].value, nameIndex: a, exprStart: a + 2, exprEnd: b });
    }
    i = end;
  }
  return output;
}

function parseStringArray(tokens, start, end) {
  if (end - start < 2 || !tokenIs(tokens, start, "[") || !tokenIs(tokens, end - 1, "]")) return null;
  const assets = [];
  let i = start + 1;
  let expectValue = true;
  while (i < end - 1) {
    if (tokenIs(tokens, i, ",")) {
      if (expectValue && i !== end - 2) return null;
      expectValue = true;
      i += 1;
      continue;
    }
    if (!expectValue || tokens[i].type !== "string") return null;
    assets.push(tokens[i].value);
    expectValue = false;
    i += 1;
  }
  return assets;
}

function parseArrowParameter(tokens, start, end) {
  if (start >= end) return null;
  if (tokens[start].type === "id" && start + 1 < end && tokenIs(tokens, start + 1, "=>")) {
    return { name: tokens[start].value, bodyStart: start + 2 };
  }
  if (tokenIs(tokens, start, "(")) {
    const close = matchingToken(tokens, start, "(", ")");
    if (close > start && close < end && close === start + 2 && tokens[start + 1].type === "id" && tokenIs(tokens, close + 1, "=>")) {
      return { name: tokens[start + 1].value, bodyStart: close + 2 };
    }
  }
  return null;
}

function matchesPrecacheChain(tokens, start, end, cacheVariable, arrayVariable) {
  let i = start;
  if (!tokenIs(tokens, i++, "caches", "id") || !tokenIs(tokens, i++, ".") || !tokenIs(tokens, i++, "open", "id") || !tokenIs(tokens, i++, "(")) return false;
  if (!tokenIs(tokens, i++, cacheVariable, "id") || !tokenIs(tokens, i++, ")") || !tokenIs(tokens, i++, ".") || !tokenIs(tokens, i++, "then", "id") || !tokenIs(tokens, i++, "(")) return false;
  const thenClose = matchingToken(tokens, i - 1, "(", ")");
  if (thenClose !== end - 1) return false;
  const arrow = parseArrowParameter(tokens, i, thenClose);
  if (!arrow || arrow.name === "self" || arrow.name === "caches") return false;
  i = arrow.bodyStart;
  if (!tokenIs(tokens, i++, arrow.name, "id") || !tokenIs(tokens, i++, ".") || !tokenIs(tokens, i++, "addAll", "id") || !tokenIs(tokens, i++, "(")) return false;
  if (!tokenIs(tokens, i++, arrayVariable, "id") || !tokenIs(tokens, i++, ")")) return false;
  return i === thenClose;
}

function validateInstallUse(tokens, cacheVariable, arrayVariable) {
  let installMatches = 0;
  for (let i = 0; i + 6 < tokens.length; i += 1) {
    if (!tokenIs(tokens, i, "self", "id") || !tokenIs(tokens, i + 1, ".") || !tokenIs(tokens, i + 2, "addEventListener", "id") || !tokenIs(tokens, i + 3, "(")) continue;
    const callClose = matchingToken(tokens, i + 3, "(", ")");
    if (callClose < 0 || tokens[i + 4]?.type !== "string" || tokens[i + 4].value !== "install" || !tokenIs(tokens, i + 5, ",")) continue;
    const handler = parseArrowParameter(tokens, i + 6, callClose);
    if (!handler || handler.name === "self" || handler.name === "caches") continue;
    const eventName = handler.name;
    const bodyStart = handler.bodyStart;
    let waitStart = -1;
    let waitOpen = -1;
    let waitClose = -1;
    if (tokenIs(tokens, bodyStart, "{")) {
      const bodyClose = matchingToken(tokens, bodyStart, "{", "}");
      if (bodyClose !== callClose - 1) continue;
      let paren = 0, bracket = 0, brace = 0;
      for (let j = bodyStart + 1; j < bodyClose; j += 1) {
        const v = tokens[j].value;
        if (v === "(") paren += 1;
        else if (v === ")") paren -= 1;
        else if (v === "[") bracket += 1;
        else if (v === "]") bracket -= 1;
        else if (v === "{") brace += 1;
        else if (v === "}") brace -= 1;
        if (paren === 0 && bracket === 0 && brace === 0 && tokenIs(tokens, j, eventName, "id") && tokenIs(tokens, j + 1, ".") && tokenIs(tokens, j + 2, "waitUntil", "id") && tokenIs(tokens, j + 3, "(")) {
          waitStart = j; waitOpen = j + 3; waitClose = matchingToken(tokens, waitOpen, "(", ")"); break;
        }
      }
    } else if (tokenIs(tokens, bodyStart, eventName, "id") && tokenIs(tokens, bodyStart + 1, ".") && tokenIs(tokens, bodyStart + 2, "waitUntil", "id") && tokenIs(tokens, bodyStart + 3, "(")) {
      waitStart = bodyStart; waitOpen = bodyStart + 3; waitClose = matchingToken(tokens, waitOpen, "(", ")");
      if (waitClose !== callClose - 1) continue;
    }
    if (waitStart < 0 || waitClose < 0) continue;
    if (matchesPrecacheChain(tokens, waitOpen + 1, waitClose, cacheVariable, arrayVariable)) installMatches += 1;
  }
  return installMatches === 1;
}

function parsePrecacheAssetsFallback(source) {
  const tokens = tokenizeFallback(source);
  if (!tokens) return [];
  // In legitimate service workers these globals are only used as member-expression roots.
  // Reject declarations, assignments, parameters, or other shadowing/alias patterns conservatively.
  for (let i = 0; i < tokens.length; i += 1) {
    if ((tokenIs(tokens, i, "self", "id") || tokenIs(tokens, i, "caches", "id")) && !tokenIs(tokens, i + 1, ".")) return [];
  }
  const declarations = topLevelConstDeclarations(tokens);
  const arrays = declarations.filter(item => item.name === "CORE" || item.name === "A");
  if (arrays.length !== 1) return [];
  const candidate = arrays[0];
  const expectedCacheName = candidate.name === "CORE" ? "CACHE" : "C";
  const caches = declarations.filter(item => item.name === expectedCacheName);
  if (caches.length !== 1) return [];
  const cacheDecl = caches[0];
  if (cacheDecl.exprEnd - cacheDecl.exprStart !== 1 || tokens[cacheDecl.exprStart].type !== "string") return [];
  // Do not allow the alternate naming pair to coexist and create an ambiguous fallback parse.
  if (declarations.some(item => (candidate.name === "CORE" ? item.name === "A" || item.name === "C" : item.name === "CORE" || item.name === "CACHE"))) return [];
  const assets = parseStringArray(tokens, candidate.exprStart, candidate.exprEnd);
  if (!assets) return [];
  const references = tokens.reduce((list, token, index) => {
    if (token.type === "id" && token.value === candidate.name && index !== candidate.nameIndex) list.push(index);
    return list;
  }, []);
  if (references.length !== 1) return [];
  if (!validateInstallUse(tokens, expectedCacheName, candidate.name)) return [];
  return assets;
}

function parsePrecacheAssets(source) {
  if (typeof source !== "string") return [];
  if (!acorn) return parsePrecacheAssetsFallback(source);
  try {
    const program = acorn.parse(source, { ecmaVersion: "latest", sourceType: "script", allowHashBang: true });
    if (shadowsServiceWorkerGlobals(program)) return [];
    const declarations = [];
    const cacheNames = new Set();
    for (const statement of program.body) {
      if (statement.type !== "VariableDeclaration" || statement.kind !== "const") continue;
      for (const declaration of statement.declarations) {
        const name = declaration.id?.type === "Identifier" ? declaration.id.name : "";
        if ((name === "CACHE" || name === "C") && declaration.init?.type === "Literal" && typeof declaration.init.value === "string") cacheNames.add(name);
        if (name !== "CORE" && name !== "A") continue;
        const elements = declaration.init?.type === "ArrayExpression" ? declaration.init.elements : null;
        if (!elements || elements.some(element => element?.type !== "Literal" || typeof element.value !== "string")) return [];
        declarations.push({ name, id: declaration.id, assets: elements.map(element => element.value) });
      }
    }
    if (declarations.length !== 1) return [];
    const candidate = declarations[0];
    const references = [];
    walk(program, (node, ancestors) => {
      if (node.type === "Identifier" && node.name === candidate.name && node !== candidate.id) references.push({ node, ancestors });
    });
    if (references.length !== 1) return [];
    const reference = references[0];
    const addAllCall = reference.ancestors.at(-1);
    if (addAllCall?.type !== "CallExpression" || addAllCall.arguments.length !== 1 || addAllCall.arguments[0] !== reference.node || memberName(addAllCall.callee) !== "addAll") return [];
    const installCall = reference.ancestors.find(ancestor =>
      ancestor.type === "CallExpression" &&
      memberName(ancestor.callee) === "addEventListener" &&
      ancestor.callee.object?.type === "Identifier" &&
      ancestor.callee.object.name === "self" &&
      ancestor.arguments[0]?.type === "Literal" &&
      ancestor.arguments[0].value === "install"
    );
    const installHandler = installCall?.arguments[1];
    if (!isFunction(installHandler) || !reference.ancestors.includes(installHandler)) return [];
    const eventName = installHandler.params[0]?.type === "Identifier" ? installHandler.params[0].name : "";
    const waitUntilCall = reference.ancestors.find(ancestor =>
      ancestor.type === "CallExpression" &&
      ancestor.arguments.length === 1 &&
      memberName(ancestor.callee) === "waitUntil" &&
      ancestor.callee.object?.type === "Identifier" &&
      ancestor.callee.object.name === eventName
    );
    if (!waitUntilCall) return [];
    const thenCallback = [...reference.ancestors].reverse().find(ancestor => isFunction(ancestor) && ancestor !== installHandler);
    const callbackIndex = reference.ancestors.indexOf(thenCallback);
    const thenCall = callbackIndex > 0 ? reference.ancestors[callbackIndex - 1] : null;
    const cacheParameter = thenCallback?.params[0]?.type === "Identifier" ? thenCallback.params[0].name : "";
    if (thenCall?.type !== "CallExpression" || !thenCall.arguments.includes(thenCallback) || memberName(thenCall.callee) !== "then") return [];
    if (waitUntilCall.arguments[0] !== thenCall) return [];
    if (addAllCall.callee.object?.type !== "Identifier" || addAllCall.callee.object.name !== cacheParameter) return [];
    const openCall = thenCall.callee.object;
    const expectedCacheName = candidate.name === "CORE" ? "CACHE" : "C";
    if (openCall?.type !== "CallExpression" || openCall.arguments.length !== 1 || openCall.arguments[0]?.type !== "Identifier" || openCall.arguments[0].name !== expectedCacheName) return [];
    if (memberName(openCall.callee) !== "open" || openCall.callee.object?.type !== "Identifier" || openCall.callee.object.name !== "caches" || !cacheNames.has(expectedCacheName)) return [];
    return candidate.assets;
  } catch {
    return [];
  }
}

function hasPrecacheAsset(source, expectedPath) {
  return parsePrecacheAssets(source).some(item => item.split(/[?#]/)[0] === expectedPath);
}

function precachePathIssues(assets, toolRoot, siteRoot) {
  const issues = [];
  const allowedDirectories = new Set(["./", "./zh/"]);
  const realSiteRoot = fs.realpathSync(siteRoot);
  for (const asset of assets) {
    const clean = String(asset).split(/[?#]/)[0];
    if (!clean || clean.includes("\\") || clean.includes("\0") || /^[a-z][a-z0-9+.-]*:/i.test(clean) || path.isAbsolute(clean) || path.win32.isAbsolute(clean) || clean.startsWith("//") || /%(?:2e|2f|5c)/i.test(clean)) {
      issues.push(`${asset}: invalid precache path`);
      continue;
    }
    const target = path.resolve(toolRoot, ...clean.split("/"));
    const relativeToSite = path.relative(siteRoot, target);
    if (!relativeToSite || relativeToSite.startsWith(`..${path.sep}`) || relativeToSite === ".." || path.isAbsolute(relativeToSite)) {
      issues.push(`${asset}: outside website deployment root`);
      continue;
    }
    if (!fs.existsSync(target)) {
      issues.push(`${asset}: missing precache target`);
      continue;
    }
    const realTarget = fs.realpathSync(target);
    const realRelativeToSite = path.relative(realSiteRoot, realTarget);
    if (!realRelativeToSite || realRelativeToSite.startsWith(`..${path.sep}`) || realRelativeToSite === ".." || path.isAbsolute(realRelativeToSite)) {
      issues.push(`${asset}: real target is outside website deployment root`);
      continue;
    }
    if (fs.statSync(target).isDirectory() && !allowedDirectories.has(clean)) issues.push(`${asset}: directory alias is not allowed`);
  }
  return issues;
}

module.exports = { parsePrecacheAssets, hasPrecacheAsset, precachePathIssues };
