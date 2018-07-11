exports.rand = function(range, min=0) {
  return Math.random()*range+min;
};
exports.split = function(arr, maxL) {
  if(arr.length <= maxL) return [arr];
  const newArr = [];
  let y = 0;
  for(let i = 0; i < Math.ceil(arr.length%maxL===arr.length?1:arr.length%maxL); i++) newArr.push([]);
  while(arr.length) {
    if(newArr[y].length >= maxL) y++;
    newArr[y].push(arr.shift());
  }
  return newArr;
};