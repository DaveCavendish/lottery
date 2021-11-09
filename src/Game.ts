import gsap from 'gsap/all';
import * as PIXI from 'pixi.js';
import { Button } from './Button';
import { GameSettings } from './GameSettings';
import { GameUi } from './GameUi';
import { LotteryPad } from './LotteryPad';
import { StateMachine } from './States';
import { WinPresentation } from './WinPresentation';
/**
 * Game
 */
export class Game {

    private _stage: PIXI.Container;
    private _playButton: Button = new Button();
    private _pickRandomButton: Button = new Button();
    private _resetButton: Button = new Button();
    private _stateMachine: StateMachine;
    private _pad: LotteryPad;
    private readonly renderer: PIXI.Renderer;
    private _winPresentation: WinPresentation;
    private _gameUI: GameUi = GameUi.getInstance();

    constructor(stage: PIXI.Container, renderer: PIXI.Renderer) {
        this._stage = stage;
        this.renderer = renderer;
        this._playButton.enabled = true;
        this._stateMachine = new StateMachine(this._stage);
        this._pad = new LotteryPad(this._stateMachine)
        this._winPresentation = new WinPresentation(this._pad, this._stateMachine);
    }

    public async init() {
        this._gameUI.init();
        this._gameUI.updateBalance(1000);
        this.addBackground();
        this.createButtons();
        this.addEventListeners();
        this._stage.addChild(this._pad);
        this._pad.init();
        this._winPresentation._lottoBallsContainer.x = 1600; this._winPresentation._lottoBallsContainer.y = - 200;
        this._stage.addChild(this._gameUI);
        this.createDropTube();
        this._stage.addChild(this._winPresentation);
    }

    //ensure that this is called every tick so the stage updates constantly
    public render() {
        this.renderer.render(this._stage);
    }

    //add a simple background to the game
    public addBackground() {
        let texture = PIXI.Texture.from(`assets/polly-background-1631651.jpg`);
        let background = new PIXI.Sprite(texture);
        background.width = 1920;
        background.height = 1080;
        this._stage.addChild(background);
    }

    //listen for state changes so that we can change button states, allow gameflow to proceed etc.
    protected addEventListeners(): void
    {
        this._stage.addListener(StateMachine.PICKING_STATE, () => {
            this._playButton.setEnabled(false);
            this._pad.setEnabled(true);
            this._resetButton.setEnabled(false);
            this._pickRandomButton.setEnabled(true);
            this._resetButton.visible = false;
            gsap.to(this._playButton, {alpha: 1, duration: 0.5})
        })

        this._stage.addListener(StateMachine.READY_STATE, () => {
            this._playButton.setEnabled(true);
            this._playButton.interactive = true;
            this._pad.setEnabled(true);
            this._playButton.on("pointerdown", (e: PIXI.interaction.InteractionEvent): void => this._play());
        })

        this._stage.addListener(StateMachine.PLAYING_STATE, () => {
            this._playButton.setEnabled(false);
            this._pickRandomButton.setEnabled(false);
            this._pad.setEnabled(false);
        })

        this._stage.addListener(StateMachine.WIN_PRESENTATION, () => {
            gsap.to(this._playButton, {alpha: 0, duration: 0.5})
            this._resetButton.on("pointerdown", (e: PIXI.interaction.InteractionEvent): void => this._reset());
            gsap.delayedCall(1, ()=>{
                this._resetButton.alpha = 0;
                gsap.to(this._resetButton, {alpha: 1, duration: 0.5})
                this._resetButton.setEnabled(true);
                this._resetButton.visible = true;
            })
            this._winPresentation.startWinPresentation();
        })
    }

    //create the buttons that will be used in this game, play, reset and random (lucky dip)
    protected createButtons(): void {
        //create the spin button
        this._playButton = this.createButton(0xb1b1b1, 0x878787, 0x4c4c4c);
        this._stage.addChild(this._playButton);
        this._playButton.x = this._stage.width/2 - this._playButton.width/2;
        this._playButton.y = 900;
        this._playButton.addLabel("PLAY", -68, 30);
        this._playButton.setEnabled(false);
        //create the pickRand button
        this._pickRandomButton = this.createButton(0xFBB640, 0xFBB640, 0xFBB640);
        this._pickRandomButton.x = 200;
        this._pickRandomButton.y = 450;
        this._pickRandomButton.addLabel("RANDOM", -100, 30);
        this._stage.addChild(this._pickRandomButton);
        this._pickRandomButton.on("pointerdown", (e: PIXI.interaction.InteractionEvent): void => this._onButtonDown(e, this._pickRandomButton))
        // create reset button
        this._resetButton = this.createButton(0xcc0000, 0xcc0000, 0xcc0000);
        this._stage.addChild(this._resetButton);
        this._resetButton.x = this._stage.width/2 - this._playButton.width/2;
        this._resetButton.y = 900;
        this._resetButton.addLabel("RESET", -85, 30);
        this._resetButton.setEnabled(false);
        this._resetButton.visible = false;
    }


    protected createButton(enabledColour: number, pressedColour: number, hoverColour:number): Button
    {
        let enabled = new PIXI.Graphics();
        enabled.beginFill(enabledColour);
        enabled.drawCircle(0, 0, 50);
        enabled.name = "play_default"
        let pressed = new PIXI.Graphics();
        pressed.beginFill(pressedColour);
        pressed.drawCircle(0, 0, 50);
        pressed.name = "play_pressed"
        let hover = new PIXI.Graphics();
        hover.name = "play_hover"
        hover.beginFill(hoverColour);
        hover.drawCircle(0, 0, 50);
        let disabled = new PIXI.Graphics();
        disabled.beginFill(enabledColour);
        disabled.drawCircle(0, 0, 50);
        disabled.name = "play_disabled"
        let button = new Button()
        button.addChild(enabled, pressed, hover, disabled);
        return button;
    }

    //initialise the play state
    protected _play(): void
    {
        this._pad.disableAll(true);
        //reset win meter to 0
        this._gameUI.updateWin(0);
        //check we are in ready state (i.e  6 numbers have been picked)
        if(this._stateMachine.currentState === StateMachine.READY_STATE)
        {
            //check we have the balance to play
            if(this._gameUI.getBalance() > GameSettings.BET)
            {
                this._stateMachine.setState(StateMachine.PLAYING_STATE);
                this._winPresentation.play();
                this._gameUI.updateBalance(this._gameUI.getBalance() - GameSettings.BET);
            }
            //insufficient funds
            else{
                console.log("not enough funds:")
            }
        }
    }

    //reset the game after gameflow has completed
    protected _reset(): void
    {
        if(this._stateMachine.currentState === StateMachine.WIN_PRESENTATION)
        {
            this._pad.disableAll(false);
            this._stateMachine.setState(StateMachine.PICKING_STATE);
            this._pad.reset();
            this._winPresentation.clear();
        }
    }

    // creates a simple drop tube graphic object to display on screen so that the user knows where the balls will fall.
    protected createDropTube(): void 
    {
        let length: number = 160*6 + 100;
        let tube = new PIXI.Graphics();
        tube.lineStyle(2, 0x00FF00)
        tube.beginFill(0xFFFFFF, 0.3);
        tube.drawRoundedRect(0, 0, 170, length, 85);
        this._stage.addChild(tube);
        tube.pivot.x = tube.width / 2;
        tube.pivot.y = tube.height / 2;
        tube.x = 1600;
        tube.y = 500;
    }

    protected _onButtonDown(e: PIXI.interaction.InteractionEvent, button: Button) {
        this._pad.pickRandom();
        if(button.isPressed)
        {
            button.setPicked();
        }
        else{
            button.setUnpicked();
        }

    }

}