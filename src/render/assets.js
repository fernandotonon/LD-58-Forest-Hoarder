
// Simple image asset loader
export const images = {
  squirrel: new Image(),
  tiles: new Image(),
  collectibles: new Image(),
  nest: new Image(),
};

// Use relative paths that work with both dev and production
const basePath = import.meta.env.BASE_URL || '/';
images.squirrel.src = `${basePath}assets/squirrel.png`;
images.tiles.src = `${basePath}assets/tiles.png`;
images.collectibles.src = `${basePath}assets/collectibles.png`;
images.nest.src = `${basePath}assets/nest.png`;

export function whenImagesReady(cb) {
  const keys = Object.keys(images);
  let loaded = 0;
  keys.forEach(k => {
    const img = images[k];
    if (img.complete) {
      loaded++;
      if (loaded === keys.length) cb();
    } else {
      img.addEventListener('load', () => {
        loaded++;
        if (loaded === keys.length) cb();
      });
      img.addEventListener('error', () => {
        // still count to avoid deadlock; fallback drawing will occur
        loaded++;
        if (loaded === keys.length) cb();
      });
    }
  });
}
