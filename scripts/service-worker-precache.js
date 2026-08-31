"use strict";

const acorn = require("acorn");
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

function parsePrecacheAssets(source) {
  if (typeof source !== "string") return [];
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
