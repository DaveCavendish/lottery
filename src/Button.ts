import { interaction } from "pixi.js";
import * as PIXI from 'pixi.js';
/**
 * Button
 * Button class that takes all 4 states and handles accordingly.
 */
export class Button extends PIXI.Container {

    private _normalState: PIXI.DisplayObject | undefined;
    private _hoverState: PIXI.DisplayObject | undefined;
    private _disabledState: PIXI.DisplayObject | undefined;
    private _pressedState: PIXI.DisplayObject | undefined;
    private _winningState: PIXI.DisplayObject | undefined;
    private _label: PIXI.Text | undefined;
    public enabled: boolean = true;
    public isPressed: boolean = false;
    public constructor() {
        super();
        this.on("pointerdown", (e: interaction.InteractionEvent): void => this._onButtonDown(e))
        this.on("pointerover", (e: interaction.InteractionEvent): void => this._onButtonHover(e))
        this.on("pointerout", (e: interaction.InteractionEvent): void => this._onButtonOut(e))
        this.on("pointerup", (e: interaction.InteractionEvent): void => this._onButtonUp(e))
        this.buttonMode = true;
        this.interactive = true;
    }

    protected _onButtonDown(e: interaction.InteractionEvent) {
        if (this.enabled)
        {
            this.showState("_pressed");
            if(!this.isPressed)
            {
                this.isPressed = true;
            }
            else{
                this.isPressed = false;
            }
        }
    }

    protected _onButtonHover(e: interaction.InteractionEvent) {
        if (this.enabled)
        {
            this.showState("_hover");
        }
        //this.emit("buttonover")
    }

    protected _onButtonOut(e: interaction.InteractionEvent) {
        if (this.enabled)
        {
            if(!this.isPressed)
            {
                this.showState("_default");
            }
            else{
                this.showState("_pressed");
            }
        }
    }

    protected _onButtonUp(e: interaction.InteractionEvent) {
        if (this.enabled)
        {
            this.showState("_pressed");
        }
    }

    public addChild(...children: PIXI.DisplayObject[]): PIXI.DisplayObject {
        children.forEach((child) => this.onChildAdded(child))
        return super.addChild(...children);
    }

    public addLabel(text: string, xOffset: number = 0, yOffset: number = 0) {
        this._label = new PIXI.Text(text, this.labelStyle);
        this.addChild(this._label);
        this._label.x = (this.width / 2 - this._label.width / 2) + xOffset;
        this._label.y = (this.height / 2 - this._label.height / 2) + yOffset;
    }


    protected onChildAdded(child: PIXI.DisplayObject) {
        if (!child.name) { return; }
        if (child.name.endsWith("_default")) {
            this._normalState = child;
            this._normalState.visible = true;
        }
        else if (child.name.endsWith("_disabled")) { this._disabledState = child; this._disabledState.alpha = 0.7; this._disabledState.visible = false;}
        else if (child.name.endsWith("_hover")) {this._hoverState = child; this._hoverState.visible = false;}
        else if (child.name.endsWith("_pressed")) {this._pressedState = child; this._pressedState.visible = false;}
        else if (child.name.endsWith("_winning")) {this._winningState = child; this._winningState.visible = false;}
    }

    public setVisibility(bool: boolean) {
        if (bool) {
            if (this._hoverState)
                this._hoverState.visible = true;
            if (this._disabledState)
                this._disabledState.visible = true;
            if (this._pressedState)
                this._pressedState.visible = true;
            if (this._normalState)
                this._normalState.visible = true;
            if (this._winningState)
                this._winningState.visible = false;
        }
        else {
            if (this._hoverState)
                this._hoverState.visible = false;
            if (this._disabledState)
                this._disabledState.visible = false;
            if (this._pressedState)
                this._pressedState.visible = false;
            if (this._normalState)
                this._normalState.visible = false;
            if (this._winningState)
                this._winningState.visible = false;

        }
    }

    public setPicked(): void
    {
        this.isPressed = true;
        this.showState("_pressed");
    }

    public setUnpicked(): void 
    {
        this.isPressed = false;
        this.showState("_default");
    }

    public setWin(): void{
        this.showState("_winning");
    }

    public setEnabled(enable: boolean) {
        this.enabled = enable;
        this.interactive = enable;
        this.buttonMode = enable;
        if (!enable) {
            this.showState("_disabled");
            if(this._label)
            this._label.alpha = 0.4;
        }
        else {
            this.showState("_default");
            if(this._label)
            this._label.alpha = 1;
        }
    }


    protected showState(state: string) {
        this.setVisibility(false);
        switch (state) {
            case "_pressed":
                if (this._pressedState) 
                {
                    this._pressedState.visible = true;
                }
                break;

            case "_hover":
                if (this._hoverState) this._hoverState.visible = true;
                break;

            case "_disabled":
                if (this._disabledState) this._disabledState.visible = true;
                break;

            case "_default":
                if (this._normalState) this._normalState.visible = true;
                break;

            case "_winning":
                if (this._winningState) this._winningState.visible = true;
                break;

        }
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
            "fontSize": 35,
            "stroke": "#240a00",
            "strokeThickness": 2,
            "trim": false,
            "whiteSpace": "pre",
            "wordWrap": false
        })
    }
}