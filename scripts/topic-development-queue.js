'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dir = root => path.join(root, 'docs/roadmap');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const meaningful = x => typeof x === 'string' && x.trim().length > 0 && !/^(PENDING|UNASSIGNED)$/i.test(x.trim());
function file(root, relative) {
  if (!meaningful(relative) || path.isAbsolute(relative) || /^[A-Za-z]:/.test(relative) || relative.split(/[\\/]/).includes('..')) throw Error('Repository-relative path required; traversal rejected');
  const resolved = fs.realpathSync(path.resolve(root, relative));
  const rel = path.relative(fs.realpathSync(root), resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel) || !fs.statSync(resolved).isFile() || !fs.readFileSync(resolved).toString().trim()) throw Error('Evidence must be a nonempty repository file');
  return resolved;
}
function read(root) {
  const backlog = JSON.parse(fs.readFileSync(path.join(dir(root), 'TOPIC_DEVELOPMENT_BACKLOG.json')));
  const state = JSON.parse(fs.readFileSync(path.join(dir(root), 'TOPIC_DEVELOPMENT_QUEUE_STATE.json')));
  if (backlog.schemaVersion !== 1 || state.schemaVersion !== 1 || !Array.isArray(backlog.items) || new Set(backlog.items.map(x => x.id)).size !== backlog.items.length || !Array.isArray(state.completed) || !Array.isArray(state.blocked)) throw Error('Invalid queue');
  if(new Set(state.completed.map(c=>c.id)).size!==state.completed.length)throw Error('Duplicate completion');
  for(const c of state.completed) {
    const item=backlog.items.find(x=>x.id===c.id);
    if(!item||c.name!==item.name||!meaningful(c.completedAt)||!Number.isFinite(Date.parse(c.completedAt)))throw Error('Invalid completion record');
    const evidenceFile=file(root,c.evidencePath);
    if(hash(evidenceFile)!==c.evidenceSha256)throw Error('Completion evidence changed');
    const e=JSON.parse(fs.readFileSync(evidenceFile));acceptance(root,item,e,c.snapshots);
    if(JSON.stringify(c.artifacts)!==JSON.stringify(e.artifacts))throw Error('Completion artifacts mismatch');
    dependencies(item,state);
  }
  return {backlog, state};
}
function save(root, state) { fs.writeFileSync(path.join(dir(root), 'TOPIC_DEVELOPMENT_QUEUE_STATE.json'), JSON.stringify(state, null, 2) + '\n'); }
function dependencies(item, state) { if (item.dependencies.some(id => !state.completed.some(c => c.id === id))) throw Error('Dependencies incomplete'); }
function boundFile(root,p,snapshots) {return file(root,snapshots?snapshots[p]:p);}
function bindings(root, e, snapshots) {
  if (!Array.isArray(e.artifacts) || !e.artifacts.length) throw Error('Artifact SHA256 bindings required');
  for (const a of e.artifacts) if (!/^[a-f0-9]{64}$/.test(a.sha256 || '') || hash(boundFile(root,a.path,snapshots)) !== a.sha256) throw Error('Stale artifact SHA256');
}
function auditFiles(root,e,section,snapshots) {
  for(const p of e[section].evidencePaths) if(hash(boundFile(root,p,snapshots))!==e.evidenceHashes?.[p])throw Error('Stale audit evidence SHA256');
}
function admission(root, item, e, snapshots) {
  if (e.topicId !== item.id || !meaningful(e.implementationAgent) || !meaningful(e.reviewerAgent) || e.implementationAgent.trim() === e.reviewerAgent.trim()) throw Error('Independent reviewer required');
  if (e.productionDeployment !== false || e.admission?.status !== 'PASS' || e.admission.reviewerAgent !== e.reviewerAgent || !Array.isArray(e.admission.evidencePaths) || !e.admission.evidencePaths.length) throw Error('Independent admission PASS evidence required');
  if(!meaningful(e.planAuthorAgent)||e.planAuthorAgent.trim()===e.reviewerAgent.trim())throw Error('Independent plan admission reviewer required');
  auditFiles(root,e,'admission',snapshots); bindings(root, e,snapshots);
}
function acceptance(root, item, e, snapshots) {
  admission(root, item, e,snapshots);
  if (e.acceptance?.status !== 'PASS' || e.acceptance.reviewerAgent !== e.reviewerAgent || !Array.isArray(e.acceptance.evidencePaths) || !e.acceptance.evidencePaths.length) throw Error('Independent acceptance PASS evidence required');
  auditFiles(root,e,'acceptance',snapshots);
  for (const id of item.requiredChecks) {
    const check = e.checks?.find(c => c.id === id);
    if (!check || check.status !== 'PASS' || !meaningful(check.command)) throw Error('Required check must PASS: ' + id);
    const log = boundFile(root, check.evidencePath,snapshots);
    if (hash(log) !== check.sha256) throw Error('Stale check evidence');
  }
}
function busyOther(root, ownTask) {
  const p = path.join(dir(root), 'DEVELOPMENT_QUEUE_STATE.json');
  if (fs.existsSync(p)) {const s = JSON.parse(fs.readFileSync(p));
    for(const t of [s.active,s.inProgress,s.currentTask,...(s.tasks || []).filter(t=>['in_progress','IN_PROGRESS','running','IMPLEMENTING'].includes(t.status))]) {
      if(t && (!ownTask || (typeof t==='string'?t:t.id)!==ownTask))throw Error('Tool queue implementation active');
    }
  }
  const taskDir=path.join(dir(root),'tasks');
  if(fs.existsSync(taskDir))for(const name of fs.readdirSync(taskDir).filter(n=>n.endsWith('.md'))) {
    const text=fs.readFileSync(path.join(taskDir,name),'utf8');
    if(/^\s*(?:status|current status|阶段与状态)\s*[:：=]\s*IMPLEMENTING\b/im.test(text)&&path.basename(name,'.md')!==ownTask)throw Error('Tool task IMPLEMENTING: '+name);
  }
}
function locked(root, fn) {
  const p = path.join(dir(root), 'DEVELOPMENT_IMPLEMENTATION.lock');
  let fd; try {fd = fs.openSync(p, 'wx');} catch(e) {if(e.code === 'EEXIST') throw Error('Shared implementation lock busy'); throw e;}
  try { fs.writeFileSync(fd, JSON.stringify({queue:'topics',pid:process.pid})); return fn(); }
  finally { fs.closeSync(fd); fs.unlinkSync(p); }
}
function implementationLock(root, command, queue, task) {
  const p=path.join(dir(root),'DEVELOPMENT_ACTIVE_IMPLEMENTATION.json');
  if(!['tools','topics'].includes(queue)||!meaningful(task))throw Error('Queue tools/topics and task required');
  return locked(root,()=>{
    if(command==='acquire') {
      busyOther(root,queue==='tools'?task:undefined);
      const state=read(root).state;if(queue==='tools'&&state.active)throw Error('Topic implementation active');
      if(fs.existsSync(p)) {const owner=JSON.parse(fs.readFileSync(p));if(owner.queue===queue&&owner.task===task)return owner;throw Error('Shared implementation owner busy');}
      const owner={queue,task,acquiredAt:new Date().toISOString()};fs.writeFileSync(p,JSON.stringify(owner,null,2)+'\n');return owner;
    }
    const owner=JSON.parse(fs.readFileSync(p));if(owner.queue!==queue||owner.task!==task)throw Error('Lock owner mismatch');fs.unlinkSync(p);return {released:true};
  });
}
function sync(root) {
  const {backlog,state} = read(root), done = new Set(state.completed.map(c=>c.id));
  const text = backlog.sourceMarkdown.split(/\r?\n/).filter(l => !/^\| TD-\d+ \|/.test(l) || !done.has(l.split('|')[1].trim())).join('\n');
  fs.writeFileSync(path.join(dir(root),'TOPIC_DEVELOPMENT_CANDIDATES.md'), `<!-- 待办视图：${backlog.items.length-done.size} 项；完整原表保存在 TOPIC_DEVELOPMENT_BACKLOG.json。 -->\n` + text + '\n');
  fs.writeFileSync(path.join(dir(root),'TOPIC_DEVELOPMENT_COMPLETED.md'), '# 专题已验收记录\n\n仅表示本地开发和独立验收通过，不表示上线。\n\n| ID | 专题 | 时间 | 证据 |\n|---|---|---|---|\n' + state.completed.map(c=>`| ${c.id} | ${c.name} | ${c.completedAt} | ${c.evidencePath} |`).join('\n')+'\n');
  return status(root);
}
function status(root) {
  const {backlog,state}=read(root), remaining=backlog.items.filter(x=>!state.completed.some(c=>c.id===x.id));
  return {pending:remaining.length,completed:state.completed.length,active:state.active,blocked:state.blocked,next:remaining.find(x=>!state.blocked.some(b=>b.id===x.id)&&x.dependencies.every(id=>state.completed.some(c=>c.id===id)))?.id || null,productionDeployment:false};
}
function mutate(root, command, id, argument) { return locked(root,()=>{
  const {backlog,state}=read(root), item=backlog.items.find(x=>x.id===id); if(!item)throw Error('Unknown topic');
  if(command==='complete' && state.completed.some(c=>c.id===id)) return sync(root);
  if(state.completed.some(c=>c.id===id))throw Error('Topic already complete');
  if(command==='claim'||command==='start') {
    busyOther(root); dependencies(item,state);
    const ownerPath=path.join(dir(root),'DEVELOPMENT_ACTIVE_IMPLEMENTATION.json');
    if(fs.existsSync(ownerPath)){const owner=JSON.parse(fs.readFileSync(ownerPath));if(owner.queue!=='topics'||owner.task!==id)throw Error('Shared implementation owner busy');}
    if(state.active)throw Error('An implementation is already active; resume its checkpoint');
    const e=JSON.parse(fs.readFileSync(file(root,argument))); admission(root,item,e);
    state.active={id,implementationAgent:e.implementationAgent,admissionEvidence:argument,admissionSha256:hash(file(root,argument)),startedAt:new Date().toISOString(),checkpoint:'Admission passed; implementation pending'};
    state.blocked=state.blocked.filter(b=>b.id!==id);
    fs.writeFileSync(ownerPath,JSON.stringify({queue:'topics',task:id,acquiredAt:state.active.startedAt},null,2)+'\n');
  } else if(command==='block') {
    if(!meaningful(argument))throw Error('Concrete blocking reason required');
    if(state.active&&state.active.id!==id)throw Error('Another implementation active');
    state.blocked=state.blocked.filter(b=>b.id!==id); state.blocked.push({id,...(state.active||{}),reason:argument,blockedAt:new Date().toISOString()});state.active=null;
  } else if(command==='complete') {
    busyOther(root);dependencies(item,state);
    if(state.active?.id!==id)throw Error('Claim topic before completion');
    const e=JSON.parse(fs.readFileSync(file(root,argument)));acceptance(root,item,e);
    if(e.implementationAgent!==state.active.implementationAgent)throw Error('Implementation identity changed');
    if(hash(file(root,state.active.admissionEvidence))!==state.active.admissionSha256)throw Error('Admission checkpoint changed');
    const snapshotDir=path.join(dir(root),'evidence','topic-snapshots',id);fs.mkdirSync(snapshotDir,{recursive:true});
    const paths=[...new Set([...e.artifacts.map(a=>a.path),...e.admission.evidencePaths,...e.acceptance.evidencePaths,...e.checks.map(c=>c.evidencePath)])],snapshots={};
    paths.forEach((p,i)=>{const target=path.join(snapshotDir,String(i)+'.snapshot');fs.copyFileSync(file(root,p),target);snapshots[p]=path.relative(root,target).replace(/\\/g,'/');});
    const archived=path.join(snapshotDir,'acceptance.json');fs.copyFileSync(file(root,argument),archived);
    state.completed.push({id,name:item.name,evidencePath:path.relative(root,archived).replace(/\\/g,'/'),evidenceSha256:hash(archived),artifacts:e.artifacts,snapshots,completedAt:new Date().toISOString()}); state.active=null;
  } else throw Error('Unknown command');
  save(root,state);
  if(command==='complete'||command==='block') {const ownerPath=path.join(dir(root),'DEVELOPMENT_ACTIVE_IMPLEMENTATION.json');if(fs.existsSync(ownerPath)){const owner=JSON.parse(fs.readFileSync(ownerPath));if(owner.queue==='topics'&&owner.task===id)fs.unlinkSync(ownerPath);}}
  return sync(root);
}); }
if(require.main===module) {try {const [command='status',id,arg]=process.argv.slice(2);const root=process.cwd();console.log(JSON.stringify(['acquire','release'].includes(command)?implementationLock(root,command,id,arg):command==='status'?status(root):command==='sync'?locked(root,()=>sync(root)):mutate(root,command,id,arg),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={file,hash,read,sync,status,mutate,implementationLock};
