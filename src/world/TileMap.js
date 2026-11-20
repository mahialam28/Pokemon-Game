/**
 * TileMap — Loads and renders Tiled-format orthogonal JSON tilemaps with multi-layering and collision.
 */

export class TileMap {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.tileWidth = 32;
    this.tileHeight = 32;
    this.layers = new Map();
    this.tilesets = [];
    this.collisionData = null;
    this.loaded = false;
  }

  async load(url) {
    const res = await fetch(url);
    const data = await res.json();

    this.width = data.width;
    this.height = data.height;
    this.tileWidth = data.tilewidth || 32;
    this.tileHeight = data.tileheight || 32;

    // Load all tileset images
    const tilesetPromises = data.tilesets.map(async (ts) => {
      // Resolve path relative to map location or static asset root
      const imgPath = ts.image.replace('../../', '');
      const img = await this._loadImage(imgPath);
      return {
        firstGid: ts.firstgid,
        lastGid: ts.firstgid + ts.tilecount - 1,
        name: ts.name,
        image: img,
        columns: ts.columns,
        tileWidth: ts.tilewidth,
        tileHeight: ts.tileheight,
        tileCount: ts.tilecount,
      };
    });

    this.tilesets = await Promise.all(tilesetPromises);
    // Sort descending by firstGid for quick lookup
    this.tilesets.sort((a, b) => b.firstGid - a.firstGid);

    // Parse layers
    for (const layer of data.layers) {
      if (layer.type === 'tilelayer') {
        this.layers.set(layer.name, {
          name: layer.name,
          data: layer.data,
          visible: layer.visible !== false,
          opacity: layer.opacity ?? 1.0,
        });
        if (layer.name === 'collision') {
          this.collisionData = layer.data;
        }
      }
    }

    this.properties = data.properties || {};
    this.loaded = true;
    return this;
  }

  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load tileset image: ${src}`));
      img.src = src;
    });
  }

  getTileSource(gid) {
    if (gid === 0) return null;

    const ts = this.tilesets.find((t) => gid >= t.firstGid && gid <= t.lastGid);
    if (!ts) return null;

    const localId = gid - ts.firstGid;
    const col = localId % ts.columns;
    const row = Math.floor(localId / ts.columns);

    return {
      image: ts.image,
      sx: col * ts.tileWidth,
      sy: row * ts.tileHeight,
      sw: ts.tileWidth,
      sh: ts.tileHeight,
    };
  }

  renderLayer(ctx, layerName, cameraOffset, viewportW, viewportH) {
    const layer = this.layers.get(layerName);
    if (!layer || !layer.visible) return;

    ctx.save();
    ctx.globalAlpha = layer.opacity;

    // Viewport tile range culling for performance
    const startCol = Math.max(0, Math.floor(cameraOffset.x / this.tileWidth));
    const endCol = Math.min(this.width - 1, Math.ceil((cameraOffset.x + viewportW) / this.tileWidth));
    const startRow = Math.max(0, Math.floor(cameraOffset.y / this.tileHeight));
    const endRow = Math.min(this.height - 1, Math.ceil((cameraOffset.y + viewportH) / this.tileHeight));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const gid = layer.data[r * this.width + c];
        if (gid === 0) continue;

        const src = this.getTileSource(gid);
        if (src) {
          const dx = c * this.tileWidth - cameraOffset.x;
          const dy = r * this.tileHeight - cameraOffset.y;
          ctx.drawImage(src.image, src.sx, src.sy, src.sw, src.sh, dx, dy, this.tileWidth, this.tileHeight);
        }
      }
    }

    ctx.restore();
  }

  isBlocked(x, y, w = 24, h = 16) {
    // Bounding box collision against collision layer and map edges
    if (x < 0 || y < 0 || x + w > this.width * this.tileWidth || y + h > this.height * this.tileHeight) {
      return true;
    }

    if (!this.collisionData) return false;

    // Check all tile points overlapped by the bounding box
    const left = Math.floor(x / this.tileWidth);
    const right = Math.floor((x + w - 1) / this.tileWidth);
    const top = Math.floor(y / this.tileHeight);
    const bottom = Math.floor((y + h - 1) / this.tileHeight);

    for (let r = top; r <= bottom; r++) {
      for (let c = left; c <= right; c++) {
        const idx = r * this.width + c;
        if (this.collisionData[idx] > 0) {
          return true;
        }
      }
    }
    return false;
  }

  getPixelWidth() {
    return this.width * this.tileWidth;
  }

  getPixelHeight() {
    return this.height * this.tileHeight;
  }
}

