import { Button } from "./Button";
import * as PIXI from 'pixi.js';
import { Utils } from "./Utils";
import { StateMachine } from "./States";
import { LotteryBall } from "./LotteryBall";
import { GameSettings } from "./GameSettings";
/**
 * LotteryPad
 * Contains all 59 possible numbers on screen, all clickable.
 */
export class LotteryPad extends PIXI.Container
{

    private _buttonsPressed: Button[] = [];
    private _allNonPressedButtons: Button[] = [];
    private _lottoNumbers: number[] = []
    private _stateMachine: StateMachine;
    private _label: PIXI.Text = new PIXI.Text("")
    constructor(stateMachine: StateMachine)
    {
        super();
        this._stateMachine = stateMachine;
    }

     /**
     * creates the pad in its initialised state and adds the label.
     */
    public init(): void
    {
        for(let i: number = 1; i < GameSettings.LOTTO_NUMBERS; i++)
        {
            this._lottoNumbers.push(i);
        }
        this.createPad();
        this.createPickLabel();
    }

    public setEnabled(enabled: boolean): void {
        if (enabled) {
            this.interactive = true;
        }
        else {
            this.interactive = false;
        }
    }

    /**
     * returns an array of pressed buttons
     */
    public getChosenNumbers(): Button[]
    {
        return this._buttonsPressed;
    }

    /**
     * resets all of the buttons to their initial states.
     */
    public reset(): void 
    {
        this._disableButtons(false);
        this._buttonsPressed.forEach((button)=>{
            button.setUnpicked();
            this._allNonPressedButtons.push(button);
        })
        this._buttonsPressed = [];
        this.updateLabel();
    
    }

    /**
     * this should be called when the random button is pressed, randomly picks 6 numbers from the pad and updates the stage accordingly.
     */
    public pickRandom(): void 
    {
        if(this._buttonsPressed.length < 6)
        {
            //how many buttons are there left to pick?
            let remainingToPick = 6 - this._buttonsPressed.length
            //shuffle the array that will allow us to pick n number of buttons randomly.
            this.shuffleArray(this._allNonPressedButtons);
            for(let i: number = 0; i < remainingToPick ; i++)
            {
                //get the random button
                let button = this._allNonPressedButtons[i];
                //set it to pressed and refactor the arrays
                button.setPicked();
                this._buttonsPressed.push(button);
                this._allNonPressedButtons.splice(i, 1);
            }
            //disable the rest of the non picked buttons
            this.updateLabel();
            this._disableButtons(true);
        }
        else{
            //cleanup and reset.
            this._disableButtons(false);
            this._buttonsPressed.forEach((button)=>{
                button.setUnpicked();
                this._allNonPressedButtons.push(button);
            })
            this._buttonsPressed = [];
            this.updateLabel();
        }
    }

    private shuffleArray(array: any) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    private createPad(): void
    {
        let numberAdded: number = 0;
        for(let i: number = 0; i < 10; i++)
        {
            for(let j: number = 0; j < 6; j++)
            {
                //we don't want 60 numbers, just 59.
                if(i === 9 && j === 5 )
                {
                    return;
                }
                let button = new Button();
                //unpicked state
                let buttonSprite_default = new PIXI.Graphics();
                buttonSprite_default.lineStyle(5, 0xfbb640)
                buttonSprite_default.beginFill(0x878787);
                buttonSprite_default.drawRect(0, 0, 70, 70);
                buttonSprite_default.name = "button_default";
                //hover button
                let buttonSprite_hover = new PIXI.Graphics();
                buttonSprite_hover.beginFill(0x878787);
                buttonSprite_hover.drawRect(0, 0, 70, 70);
                buttonSprite_hover.name = "button_hover";
                //pressed state
                let buttonSprite_pressed = new PIXI.Graphics();
                buttonSprite_pressed.lineStyle(5, 0xf44336);
                buttonSprite_pressed.beginFill(0x878787);
                buttonSprite_pressed.drawRect(0, 0, 70, 70);
                buttonSprite_pressed.name = "button_pressed";
                //disabled state
                let buttonSprite_disabled = new PIXI.Graphics();
                buttonSprite_disabled.beginFill(0x878787);
                buttonSprite_disabled.drawRect(0, 0, 70, 70);
                buttonSprite_disabled.name = "button_disabled";

                let buttonSprite_winning = new PIXI.Graphics();
                buttonSprite_winning.beginFill(0xF0FF00);
                buttonSprite_winning.drawRect(0, 0, 70, 70);
                buttonSprite_winning.name = "button_winning";
                //increase the number of balls added
                numberAdded++;
                //name the button and add to array so we can track it later
                button.name = `ball_${numberAdded}`;
                this._allNonPressedButtons.push(button);
                //position the button so that we end up with a nice list layout
                button.x = 550+80*i;
                button.y = 100+80*j
                //add the graphics to create the button object
                button.addChild(...[buttonSprite_default, buttonSprite_hover, buttonSprite_pressed, buttonSprite_disabled, buttonSprite_winning]);
                //add a label to show what each button represents
                button.addLabel(numberAdded.toString())
                //finally add an event listener so we can track when they are pressed/unpressed and add it to the view.
                button.on("pointerdown", (e: PIXI.interaction.InteractionEvent): void => this._onButtonDown(e, button))
                this.addChild(button);
            }
        }
    }

    //handles when a button on the pad is pressed
    private _onButtonDown(e: PIXI.interaction.InteractionEvent, button: Button): void {
        //check if the button is already pressed
        if (button.isPressed) {
            //remove button from pressed array and add it to the other array
            let index = this._allNonPressedButtons.indexOf(button);
            this._buttonsPressed.push(button);
            this._allNonPressedButtons.splice(index, 1);
            this.updateLabel()
        }
        else {
            let index = this._buttonsPressed.indexOf(button);
            this._buttonsPressed.splice(index, 1);
            this._allNonPressedButtons.push(button);
            this.updateLabel()
        }
        if (this._buttonsPressed.length === 6) {
            this._disableButtons(true);
            this.updateLabel()
        }
        else{
            this._disableButtons(false);
            this.updateLabel()
        }
    }

    /**
     * called when ever the label is changed. This should probably work from an eventlistener/observable instead of being manually called all the time. TODO.
     */
    private updateLabel()
    {
        if(this._label)
        {
            this._label.destroy();
        }
        let numberToPick = 6 - this._buttonsPressed.length;
        if(numberToPick !== 0 && numberToPick !== 1)
        {
            this._label = new PIXI.Text(`PICK: ${numberToPick} MORE NUMBERS.`, this.labelStyleTwo);
            this._label.alpha = 1;
        }
        else if(numberToPick === 1)
        {
            this._label = new PIXI.Text(`PICK: ${numberToPick} MORE NUMBER.`, this.labelStyleTwo);
        }
        else{
            this._label = new PIXI.Text(`PICK: ${numberToPick} MORE NUMBERS.`, this.labelStyle);
            this._label.alpha = 0.5;
        }
        this.addChild(this._label);
        this._label.y = 650;
        this._label.x = 1920/2 - this._label.width/2;
    }

    private createPickLabel(): void
    {
        let numberToPick = 6 - this._buttonsPressed.length;
        this._label = new PIXI.Text(`PICK: ${numberToPick} MORE NUMBERS.`, this.labelStyleTwo);
        this.addChild(this._label);
        this._label.y = 650;
        this._label.x = 1920/2 - this._label.width/2;
    }
    /**
     * compares the ball parsed through to see if it matches any chosen numbers. If so it highlights them.
     */
    public highLightWins(ball: LotteryBall)
    {
        this._buttonsPressed.forEach((button)=>{
            if(button.name === ball.ball.name)
            {
                button.setWin();
            }
        })
    }

    /**
     * ensure none of the buttons are clickable, or all are clickable.
     */
    public disableAll(disable: boolean): void {
        if (disable) {
            this._allNonPressedButtons.forEach((button) => {
                button.interactive = false;
            })
            this._buttonsPressed.forEach((button) => {
                button.interactive = false;
            })
        }
        else {
            this._allNonPressedButtons.forEach((button) => {
                button.interactive = true;
            })
            this._buttonsPressed.forEach((button) => {
                button.interactive = true;
            })
        }
    }
    /**
     * disable only the buttons that have or have not been clicked.
     */
    private _disableButtons(disable: boolean): void {
        if (disable) {
            this._allNonPressedButtons.forEach((button) => {
                if (!button.isPressed) {
                    button.setEnabled(false);
                }
            })
            this._stateMachine.setState(StateMachine.READY_STATE);
        }
        else {
            this._allNonPressedButtons.forEach((button) => {
                if (!button.isPressed) {
                    button.setEnabled(true);
                }
            })
            if (this._stateMachine.currentState !== StateMachine.PICKING_STATE) {
                this._stateMachine.setState(StateMachine.PICKING_STATE);
            }
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
            "stroke": "#240a00",
            "fontSize": 55,
            "strokeThickness": 2,
            "trim": false,
            "whiteSpace": "pre",
            "wordWrap": false
        })
    }
    protected get labelStyleTwo(): PIXI.TextStyle {
        return new PIXI.TextStyle({
            "align": "center",
            "dropShadow": true,
            "dropShadowAlpha": 0.8,
            "dropShadowAngle": 1.5,
            "dropShadowDistance": 2,
            "fill": ["0xcc0000", "#fdea35", "#ff9500"],
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