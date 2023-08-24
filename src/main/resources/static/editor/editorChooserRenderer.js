Mario.EditorChooserRenderer = function (level, width, height, drawGrid = false) {
    this.Width = width;
    this.Height = height;
    this.Level = level;
    this.Delta = 0;
    this.Tick = 0;
    this.Bounce = 0;
    this.AnimTime = 0;

    this.drawGrid = drawGrid;
    this.selectedGridX = null;
    this.selectedGridY = null;

    this.Background = Mario.SpriteCuts.GetLevelSheet();
};

Mario.EditorChooserRenderer.prototype = new Enjine.Drawable();

Mario.EditorChooserRenderer.prototype.Update = function (delta) {
    this.AnimTime += delta;
    this.Tick = this.AnimTime | 0;
    this.Bounce += delta * 30;
    this.Delta = delta;
};

Mario.EditorChooserRenderer.prototype.Draw = function (context) {
    this.DrawStatic(context);
    this.DrawDynamic(context);
    this.DrawInfo(context);
};


Mario.EditorChooserRenderer.prototype.DrawStatic = function (context, camera) {
    var x = 0, y = 0, b = 0, frame = null, xTileEnd = (this.Width / 16) | 0, TilesY = ((this.Height / 16) | 0) + 1;
    for (x = 0; x < xTileEnd + 1; x++) {
        for (y = 0; y < TilesY; y++) {
            let posX = ((x << 4)) | 0;
            let posY = (y << 4) | 0;
            b = this.Level.GetBlock(x, y) & 0xff;
            if ((Mario.Tile.Behaviors[b] & Mario.Tile.Animated) === 0) {
                frame = this.Background[b % 16][(b / 16) | 0];
                context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, posX, posY, frame.Width, frame.Height);
            }
        }
    }
}

Mario.EditorChooserRenderer.prototype.DrawDynamic = function (context) {
    var x = 0, y = 0, b = 0, animTime = 0, yo = 0, frame = null, xTileEnd = (this.Width / 16) | 0, TilesY = ((this.Height / 16) | 0) + 1;
    for (x = 0; x <= xTileEnd; x++) {
        for (y = 0; y <= TilesY; y++) {
            b = this.Level.GetBlock(x, y);
            if (((Mario.Tile.Behaviors[b & 0xff]) & Mario.Tile.Animated) > 0) {
                animTime = ((this.Bounce / 3) | 0) % 4;
                if ((((b % 16) / 4) | 0) === 0 && ((b / 16) | 0) === 1) {
                    animTime = ((this.Bounce / 2 + (x + y) / 8) | 0) % 20;
                    if (animTime > 3) {
                        animTime = 0;
                    }
                }
                if ((((b % 16) / 4) | 0) === 3 && ((b / 16) | 0) === 0) {
                    animTime = 2;
                }
                yo = 0;
                if (x >= 0 && y >= 0 && x < this.Level.Width && y < this.Level.Height) {
                    yo = this.Level.Data[x][y];
                }
                if (yo > 0) {
                    yo = (Math.sin((yo - this.Delta) / 4 * Math.PI) * 8) | 0;
                }
                frame = this.Background[(((b % 16) / 4) | 0) * 4 + animTime][(b / 16) | 0];
                if (frame) {
                    context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (x << 4), (y << 4) - yo, frame.Width, frame.Height);
                }
            }
        }
    };

    Mario.EditorChooserRenderer.prototype.DrawInfo = function (context) {
        var x = 0, y = 0, xTileEnd = (this.Width / 16) | 0, TilesY = ((this.Height / 16) | 0) + 1;
        for (x = 0; x < xTileEnd + 1; x++) {
            for (y = 0; y < TilesY; y++) {
                let posX = ((x << 4)) | 0;
                let posY = (y << 4) | 0;

                if (this.drawGrid) {
                    let strokeStyle = context.strokeStyle;
                    let lineWidth = context.lineWidth;
                    context.strokeStyle = "#000000";
                    context.lineWidth = 0.2;
                    context.strokeRect(posX, posY, 16, 16);
                    context.strokeStyle = strokeStyle;
                    context.lineWidth = lineWidth;
                }

                if (x == this.selectedGridX && y == this.selectedGridY) {
                    context.save();
                    context.globalAlpha = 1.0;
                    context.strokeStyle = "#FF0000";
                    context.lineWidth = 1.0;
                    context.strokeRect(posX, posY, 16, 16);
                    context.restore();
                }
            }
        }
    }
};