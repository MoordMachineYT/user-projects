exports.clone = function(item) {
  return Object.assign(Object.create(Object.getPrototypeOf(item)), item);
};
exports.rand = function(range, min=0) {
  return Math.random()*range+min;
};
exports.split = function(arr, maxL) {
  if(arr.length <= maxL) return [arr];
  const newArr = [];
  let y = 0;
  while(arr.length) {
    if(!newArr[y]) newArr.push([]);
    if(newArr[y].length >= maxL) {
      newArr.push([]);
      y++;
    }
    newArr[y].push(arr.shift());
  }
  return newArr;
};