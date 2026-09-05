/** NetEngineerLab | V2.1-Phase2-MinimalDeltaV1 | Snapshot -> reconciliation -> minimal forward/rollback */
"use strict";
const running=require("../running-config/engine"),reconcile=require("../state-reconciliation/engine"),renderers=require("./renderers");
function build({vendor,deviceId,runningConfig,desired}){
 const snapshot=running.parse({vendor,deviceId,input:runningConfig});const state=reconcile.reconcile({snapshot,desired});if(state.status==="blocked")return Object.freeze({version:"1.0.0",status:"blocked",snapshot,reconciliation:state,conflicts:state.conflicts,forward:Object.freeze({configuration:""}),rollback:Object.freeze({configuration:""})});
 const rendered=state.status==="in-sync"?{forward:"",rollback:""}:renderers.render(state);
 const actions=Object.freeze([{id:"parse-running",status:snapshot.safe?"pass":"fail"},{id:"reconcile-state",status:state.status},{id:"render-minimal-delta",status:state.status==="in-sync"?"noop":"ready"},{id:"verify-post-state",status:"required"}].map(Object.freeze));
 return Object.freeze({version:"1.0.0",status:state.status==="in-sync"?"noop":"ready",snapshot,reconciliation:state,actions,forward:Object.freeze({configuration:rendered.forward}),rollback:Object.freeze({configuration:rendered.rollback}),opaquePreserved:snapshot.opaqueLines.length});
}
function validate(input){try{const plan=build(input);return Object.freeze({valid:plan.status!=="blocked",plan,violations:plan.conflicts||Object.freeze([])})}catch(error){return Object.freeze({valid:false,error,violations:Object.freeze([{code:String(error.message||error),severity:"error"}])})}}
module.exports=Object.freeze({running,reconcile,renderers,build,validate});
