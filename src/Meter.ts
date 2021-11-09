import * as PIXI from 'pixi.js';
export class Meter extends PIXI.Container
{
    private _value: number = 0;
    private _width: number;
    private _height: number;
    private _graphics: PIXI.Graphics;
    private _label: PIXI.Text = new PIXI.Text("");
    constructor(width: number, height: number, name: string)
    {
        super();
        this._width = width;
        this._height = height;
        this.name = name;
        this._graphics = new PIXI.Graphics();
        this.init();
    }

    protected init()
    {
        this._graphics.beginFill(0x000000);
        this._graphics.drawRect(0, 0, this._width, this._height);
        this.addChild(this._graphics);
        this.setText();
    }

    public update(value: number)
    {
        this._value = value;
        this.updateText()
    }

    protected updateText()
    {
        if(this._label){
            this._label.destroy();
        }
        this._label = new PIXI.Text(this.name.toUpperCase() + " " + this._value, this.labelStyle);
        this._label.y = this._graphics.height /2 - this._label.height/2;
        this._graphics.addChild(this._label);
    }

    protected setText()
    {
        this._label = new PIXI.Text(this.name.toUpperCase() + " " + this._value, this.labelStyle);
        this._label.y = this._graphics.height /2 - this._label.height/2;
        this._graphics.addChild(this._label);
    }

    protected get labelStyle(): PIXI.TextStyle {
        return new PIXI.TextStyle({
            "align": "center",
            "dropShadow": false,
            "dropShadowAlpha": 0.8,
            "dropShadowAngle": 1.5,
            "dropShadowDistance": 2,
            "fill": ["#ffffff"],
            "stroke": "#000993",
            "fontSize": 40,
            "strokeThickness": 4,
            "trim": false,
            "whiteSpace": "pre",
            "wordWrap": false
        })
    }

}