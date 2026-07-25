(function(root,factory){
 const lib=factory();
 if(typeof module==="object"&&module.exports)module.exports=lib;
 else root.NEL_MTU_LIBRARY=lib;
})(typeof self!=="undefined"?self:this,function(){
 return {
  version:"1.0.0",
  notice:{
   zh:"封装开销按常见报文格式建模；IPsec填充、厂商实现和硬件帧长能力可能不同，所有字节数均可编辑。",
   en:"Encapsulation overhead is modeled from common packet formats. IPsec padding, vendor implementation and hardware frame support may vary, so every byte value is editable."
  },
  layers:{
   pppoe:{bytes:8,zh:"PPPoE会话头 + PPP协议字段",en:"PPPoE session header + PPP protocol field",source:"RFC 2516"},
   mpls:{bytes:4,zh:"单个MPLS标签",en:"One MPLS label",source:"RFC 3032"},
   ipip4:{bytes:20,zh:"IPv4-in-IP外层IPv4头",en:"IP-in-IP outer IPv4 header",source:"IPv4"},
   ipip6:{bytes:40,zh:"IPv6-in-IP外层IPv6头",en:"IP-in-IP outer IPv6 header",source:"RFC 8200"},
   gre4:{bytes:24,zh:"外层IPv4 + 基础GRE",en:"Outer IPv4 + base GRE",source:"RFC 2784"},
   gre4key:{bytes:28,zh:"外层IPv4 + GRE Key",en:"Outer IPv4 + GRE key",source:"RFC 2784/2890"},
   gre4keyseq:{bytes:32,zh:"外层IPv4 + GRE Key + Sequence",en:"Outer IPv4 + GRE key + sequence",source:"RFC 2784/2890"},
   gre6:{bytes:44,zh:"外层IPv6 + 基础GRE",en:"Outer IPv6 + base GRE",source:"RFC 2784/8200"},
   vxlan4:{bytes:50,zh:"外层IPv4 + UDP + VXLAN + 内层以太网",en:"Outer IPv4 + UDP + VXLAN + inner Ethernet",source:"RFC 7348"},
   vxlan6:{bytes:70,zh:"外层IPv6 + UDP + VXLAN + 内层以太网",en:"Outer IPv6 + UDP + VXLAN + inner Ethernet",source:"RFC 7348"},
   esp4:{bytes:56,zh:"IPv4 ESP AES-GCM估算（含约2字节填充）",en:"IPv4 ESP AES-GCM estimate (about 2 bytes padding)",source:"RFC 4303"},
   esp4natt:{bytes:64,zh:"IPv4 ESP AES-GCM + NAT-T估算",en:"IPv4 ESP AES-GCM + NAT-T estimate",source:"RFC 4303"},
   esp6:{bytes:76,zh:"IPv6 ESP AES-GCM估算（含约2字节填充）",en:"IPv6 ESP AES-GCM estimate (about 2 bytes padding)",source:"RFC 4303"},
   esp6natt:{bytes:84,zh:"IPv6 ESP AES-GCM + NAT-T估算",en:"IPv6 ESP AES-GCM + NAT-T estimate",source:"RFC 4303"},
   wireguard4:{bytes:60,zh:"IPv4 + UDP + WireGuard传输开销",en:"IPv4 + UDP + WireGuard transport overhead",source:"WireGuard Protocol"},
   wireguard6:{bytes:80,zh:"IPv6 + UDP + WireGuard传输开销",en:"IPv6 + UDP + WireGuard transport overhead",source:"WireGuard Protocol"},
   custom:{bytes:0,zh:"自定义开销",en:"Custom overhead",source:"Custom"}
  },
  presets:{
   plain:{zh:"标准以太网 / 无隧道",en:"Standard Ethernet / no tunnel",underlayMtu:1500,desiredInnerMtu:1500,innerIp:"ipv4",layers:[]},
   pppoe:{zh:"PPPoE IPv4",en:"PPPoE IPv4",underlayMtu:1500,desiredInnerMtu:1492,innerIp:"ipv4",layers:[["pppoe",1]]},
   gre4:{zh:"GRE over IPv4",en:"GRE over IPv4",underlayMtu:1500,desiredInnerMtu:1476,innerIp:"ipv4",layers:[["gre4",1]]},
   gre4key:{zh:"GRE Key over IPv4",en:"GRE key over IPv4",underlayMtu:1500,desiredInnerMtu:1472,innerIp:"ipv4",layers:[["gre4key",1]]},
   vxlan4:{zh:"VXLAN over IPv4",en:"VXLAN over IPv4",underlayMtu:1500,desiredInnerMtu:1450,innerIp:"ipv4",layers:[["vxlan4",1]]},
   vxlan6:{zh:"VXLAN over IPv6",en:"VXLAN over IPv6",underlayMtu:1500,desiredInnerMtu:1430,innerIp:"ipv4",layers:[["vxlan6",1]]},
   esp4natt:{zh:"IPsec ESP NAT-T over IPv4",en:"IPsec ESP NAT-T over IPv4",underlayMtu:1500,desiredInnerMtu:1436,innerIp:"ipv4",layers:[["esp4natt",1]]},
   wireguard4:{zh:"WireGuard over IPv4",en:"WireGuard over IPv4",underlayMtu:1500,desiredInnerMtu:1440,innerIp:"ipv4",layers:[["wireguard4",1]]},
   wireguard6:{zh:"WireGuard over IPv6",en:"WireGuard over IPv6",underlayMtu:1500,desiredInnerMtu:1420,innerIp:"ipv4",layers:[["wireguard6",1]]},
   mpls2:{zh:"双标签MPLS",en:"Two-label MPLS",underlayMtu:1500,desiredInnerMtu:1492,innerIp:"ipv4",layers:[["mpls",2]]},
   custom:{zh:"自定义",en:"Custom",underlayMtu:1500,desiredInnerMtu:1500,innerIp:"ipv4",layers:[["custom",1]]}
  }
 };
});