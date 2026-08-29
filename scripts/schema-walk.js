"use strict";

function walkSchema(node,visitor){
  if(Array.isArray(node)){
    node.forEach(item=>walkSchema(item,visitor));
    return;
  }
  if(!node||typeof node!=="object")return;
  visitor(node);
  Object.values(node).forEach(value=>walkSchema(value,visitor));
}

module.exports={walkSchema};
