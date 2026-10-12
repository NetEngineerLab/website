'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');const q=require('./topic-development-queue');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'topic-queue-'));const dir=path.join(root,'docs/roadmap');fs.mkdirSync(dir,{recursive:true});
const write=(p,v)=>fs.writeFileSync(path.join(root,p),typeof v==='string'?v:JSON.stringify(v));
const items=[{id:'TD-01',name:'one',dependencies:[],requiredChecks:['content']},{id:'TD-02',name:'two',dependencies:['TD-01'],requiredChecks:['content']}];write('docs/roadmap/TOPIC_DEVELOPMENT_BACKLOG.json',{schemaVersion:1,sourceMarkdown:'| TD-01 | one |\n| TD-02 | two |',items});write('docs/roadmap/TOPIC_DEVELOPMENT_QUEUE_STATE.json',{schemaVersion:1,active:null,blocked:[],completed:[]});write('artifact.txt','actual implementation');write('log.txt','actual test output PASS');
const e={topicId:'TD-01',planAuthorAgent:'planner',evidenceHashes:{'log.txt':q.hash(path.join(root,'log.txt'))},implementationAgent:'developer',reviewerAgent:'auditor',productionDeployment:false,admission:{status:'PASS',reviewerAgent:'auditor',evidencePaths:['log.txt']},acceptance:{status:'PASS',reviewerAgent:'auditor',evidencePaths:['log.txt']},artifacts:[{path:'artifact.txt',sha256:q.hash(path.join(root,'artifact.txt'))}],checks:[{id:'content',status:'PASS',command:'node meaningful-test.js',evidencePath:'log.txt',sha256:q.hash(path.join(root,'log.txt'))}]};
let checks=0;const reject=(fn,re)=>{assert.throws(fn,re);checks++};const evidence=v=>write('e.json',v);
try {
 q.mutate(root,'block','TD-01','Missing verifiable source');assert.equal(q.status(root).next,null);checks++;
 evidence({...e,topicId:'TD-02'});reject(()=>q.mutate(root,'claim','TD-02','e.json'),/Dependencies/);
 evidence({...e,reviewerAgent:'developer'});reject(()=>q.mutate(root,'claim','TD-01','e.json'),/Independent/);
 evidence({...e,planAuthorAgent:'auditor'});reject(()=>q.mutate(root,'claim','TD-01','e.json'),/Independent plan/);
 evidence({...e,admission:{...e.admission,status:'FAIL'}});reject(()=>q.mutate(root,'claim','TD-01','e.json'),/PASS/);
 evidence({...e,admission:{...e.admission,evidencePaths:['missing.txt']}});reject(()=>q.mutate(root,'claim','TD-01','e.json'),/ENOENT/);
 reject(()=>q.file(root,'../escape.txt'),/traversal/);
 q.implementationLock(root,'acquire','tools','TOOL-01');evidence(e);reject(()=>q.mutate(root,'claim','TD-01','e.json'),/owner busy/);q.implementationLock(root,'release','tools','TOOL-01');
 fs.mkdirSync(path.join(dir,'tasks'));write('docs/roadmap/tasks/README.md','A task may have status (ADMISSION / IMPLEMENTING / REVIEW).');evidence(e);q.mutate(root,'claim','TD-01','e.json');q.mutate(root,'block','TD-01','release test fixture');checks++;write('docs/roadmap/tasks/TOOL-01.md','status: IMPLEMENTING');reject(()=>q.mutate(root,'claim','TD-01','e.json'),/IMPLEMENTING/);q.implementationLock(root,'acquire','tools','TOOL-01');q.implementationLock(root,'release','tools','TOOL-01');fs.unlinkSync(path.join(dir,'tasks/TOOL-01.md'));
 q.mutate(root,'claim','TD-01','e.json');assert.equal(q.status(root).active.id,'TD-01');checks++;
 reject(()=>q.implementationLock(root,'acquire','tools','TOOL-01'),/Topic implementation active/);
 reject(()=>q.mutate(root,'claim','TD-01','e.json'),/already active/);
 write('final.json',{...e,checks:[{...e.checks[0],status:'FAIL'}]});reject(()=>q.mutate(root,'complete','TD-01','final.json'),/must PASS/);
 write('artifact.txt','changed');write('final.json',e);reject(()=>q.mutate(root,'complete','TD-01','final.json'),/Stale artifact/);write('artifact.txt','actual implementation');
 write('log.txt','changed');reject(()=>q.mutate(root,'complete','TD-01','final.json'),/Stale audit/);write('log.txt','actual test output PASS');
 write('final.json',e);q.mutate(root,'complete','TD-01','final.json');q.mutate(root,'complete','TD-01','final.json');assert.equal(q.status(root).completed,1);assert(!fs.readFileSync(path.join(dir,'TOPIC_DEVELOPMENT_CANDIDATES.md'),'utf8').includes('| TD-01 |'));assert(fs.readFileSync(path.join(dir,'TOPIC_DEVELOPMENT_BACKLOG.json'),'utf8').includes('TD-01'));checks++;
 const good=fs.readFileSync(path.join(dir,'TOPIC_DEVELOPMENT_QUEUE_STATE.json'),'utf8');write('docs/roadmap/TOPIC_DEVELOPMENT_QUEUE_STATE.json',{schemaVersion:1,active:null,blocked:[],completed:[{id:'TD-01'}]});reject(()=>q.sync(root),/Invalid completion/);write('docs/roadmap/TOPIC_DEVELOPMENT_QUEUE_STATE.json',good);
 write('artifact.txt','legitimate future Hub change');assert.equal(q.status(root).completed,1);checks++;
 const completed=q.read(root).state.completed[0];write(completed.snapshots['artifact.txt'],'tampered snapshot');reject(()=>q.sync(root),/Stale artifact/);
 console.log(`PASS: ${checks} queue checks, archive idempotence, original source preserved`);
} finally {fs.rmSync(root,{recursive:true,force:true});}

