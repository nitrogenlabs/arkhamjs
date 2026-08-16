globalThis.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};
