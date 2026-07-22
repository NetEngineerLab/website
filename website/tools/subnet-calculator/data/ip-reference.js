(function(root,factory){
 const lib=factory();
 if(typeof module==="object"&&module.exports)module.exports=lib;
 else root.NEL_IP_REFERENCE=lib;
})(typeof self!=="undefined"?self:this,function(){
 return {
  version:"1.0.0",
  notice:{
   zh:"工具按CIDR与现代IP规划方法计算。VLSM结果应结合路由策略、网关预留、VRRP/HSRP、广播域规模和企业地址规范复核。",
   en:"Calculations follow CIDR-based modern IP planning. Review VLSM output against routing policy, gateway reservations, redundancy protocols, broadcast-domain size and enterprise addressing rules."
  },
  ipv4Scopes:[
   {cidr:"10.0.0.0/8",type:"private",zh:"私有地址",en:"Private"},
   {cidr:"172.16.0.0/12",type:"private",zh:"私有地址",en:"Private"},
   {cidr:"192.168.0.0/16",type:"private",zh:"私有地址",en:"Private"},
   {cidr:"100.64.0.0/10",type:"shared",zh:"运营商共享地址",en:"Shared address space"},
   {cidr:"127.0.0.0/8",type:"loopback",zh:"环回地址",en:"Loopback"},
   {cidr:"169.254.0.0/16",type:"linklocal",zh:"链路本地地址",en:"Link-local"},
   {cidr:"224.0.0.0/4",type:"multicast",zh:"组播地址",en:"Multicast"},
   {cidr:"240.0.0.0/4",type:"reserved",zh:"保留地址",en:"Reserved"}
  ],
  commonPrefixes:[8,10,12,16,20,21,22,23,24,25,26,27,28,29,30,31,32],
  vlsmGatewayReserveDefault:1
 };
});