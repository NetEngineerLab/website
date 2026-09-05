/** NetEngineerLab | V2.1-Phase2-PlatformProfileV1 | Profile selection and domain validation */
"use strict";
const registry=require("./platform-profile-registry"),model=require("./platform-profile-model");
function resolve({vendor,profileId}){if(profileId){const p=registry.get(profileId);if(p.vendor!==vendor)throw new Error(`platform_profile_vendor_mismatch:${profileId}:${vendor}`);return p}const matches=registry.forVendor(vendor);if(matches.length!==1)throw new Error(`platform_profile_required:${vendor}`);return matches[0]}
function validateInterfaceVlan({vendor,profileId,model:configModel}){const profile=resolve({vendor,profileId});const result=model.validateInterfaceVlan(profile,configModel);return Object.freeze({profile,result})}
function assertInterfaceVlan(args){const {profile,result}=validateInterfaceVlan(args);if(!result.valid){const e=new Error(`platform_profile_validation_failed:${profile.id}:${result.violations.map(v=>v.code).join(",")}`);e.profile=profile;e.violations=result.violations;throw e}return profile}
module.exports=Object.freeze({registry,resolve,validateInterfaceVlan,assertInterfaceVlan});
