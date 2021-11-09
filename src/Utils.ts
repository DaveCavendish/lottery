import * as PIXI from 'pixi.js';
export class Utils
{
    public drawRectangle(x: number, y: number, width: number, height: number, backgroundColor: number, borderColor: number, borderWidth: number): PIXI.Graphics
    {
        let box = new PIXI.Graphics();
        box.beginFill(backgroundColor);
        box.lineStyle(borderWidth , borderColor);
        box.drawRect(0, 0, width - borderWidth, height - borderWidth);
        box.endFill();
        box.position.x = x + borderWidth/2;
        box.position.y = y + borderWidth/2;
        return box;
    }
}