import * as PIXI from 'pixi.js';
/**
 * Lotteryball
 * class that contains a ball object. Do we really need this? Possible additional implementation later.
 */
export class LotteryBall extends PIXI.Container
{
    public ball = new PIXI.Graphics();

    public constructor(number: number, colour: number)
    {
        super();
        this.ball = new PIXI.Graphics();
        this.ball.beginFill(colour);
        this.ball.drawCircle(0, 0, 80);
        this.ball.name = "ball_" + number.toString();
        this.addChild(this.ball);
        this.createLabel(number)
    }

    private createLabel(number: number)
    {
        let label = new PIXI.Text(number.toString(), this.labelStyle);
        this.ball.addChild(label);
        label.anchor.x = 0.5;
        label.anchor.y = 0.5;
    }

    protected get labelStyle(): PIXI.TextStyle {
        return new PIXI.TextStyle({
            "align": "center",
            "dropShadow": true,
            "dropShadowAlpha": 0.8,
            "dropShadowAngle": 1.5,
            "dropShadowDistance": 2,
            "fill": ["white", "#fdea35", "#ff9500"],
            "fillGradientStops": [0.3, 0.6, 0.9],
            "stroke": "#240a00",
            "fontSize": 55,
            "strokeThickness": 2,
            "trim": false,
            "whiteSpace": "pre",
            "wordWrap": false
        })
    }
}