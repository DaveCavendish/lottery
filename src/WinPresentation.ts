import * as PIXI from 'pixi.js';
import { LotteryBall } from './LotteryBall';
import { LotteryPad } from './LotteryPad';
import { gsap } from "gsap";
import CustomBounce from 'gsap/CustomBounce';
import { StateMachine } from './States';
import { GameUi } from './GameUi';
import { GameSettings } from './GameSettings';
/**
 * Responsible for dropping the balls into place and displaying the winning labels on screen.
 */
export class WinPresentation extends PIXI.Container
{

    private _lotteryPad: LotteryPad;
    private _winningBalls: LotteryBall[] = [];
    private _stateMachine: StateMachine;
    private _lottoNumbers: number[] = [];
    private _lottoColours: number[] = [0x2298D3, 0xD2BDD1, 0x040101, 0xA41E9E, 0xCFD22E, 0x2298D3];
    private _winLabel: PIXI.Text = new PIXI.Text("WINNER!", this.labelStyle);
    private _lossLabel: PIXI.Text = new PIXI.Text("Better luck next time.", this.labelStyleLoss);
    public _lottoBallsContainer = new PIXI.Container();
    private _gameUI: GameUi = GameUi.getInstance();

    constructor(lotteryPad: LotteryPad, stateMachine: StateMachine)
    {
        super();
        this._lotteryPad = lotteryPad;
        this._stateMachine = stateMachine;
        this.addChild(this._lottoBallsContainer);
        this._winLabel.alpha = 0;
        this._winLabel.x = 1920/2 - this._winLabel.width/2;
        this._winLabel.y = 1080/2 - this._winLabel.height/2
        this._lossLabel.x = 1920/2 - this._lossLabel.width/2;
        this._lossLabel.y = 1080/2 - this._lossLabel.height/2
        this._lossLabel.alpha = 0;
        this.addChild(this._winLabel, this._lossLabel);
        for(let i: number = 1; i < GameSettings.LOTTO_NUMBERS; i++)
        {
            this._lottoNumbers.push(i);
        }
    }

    //initialises the play
    public play()
    {
        this.shuffleArray(this._lottoNumbers);
        this.generateWinningBalls();
        this.dropBalls(0);
    }

    //drops all balls into the view
    private dropBalls(index: number)
    {
        if(index > 5)
        {
            this._stateMachine.setState(StateMachine.WIN_PRESENTATION);
            return;
            //change state here. Game has completed, no more balls to drop.
        }
        else{
            // NOTE: Should have these numbers held in a settings/config file. Ideally we'd remove these magic numbers but for now leave them
            let delay = 0.25;
            let distance = 1140 - this._winningBalls[0].height  * index;
            if(index === 0)
            {
                gsap.delayedCall(delay, ()=>{
                    gsap.to(this._winningBalls[index], {duration: 0.5, y: distance, ease: "Bounce.easeOut", onComplete: ()=>{
                        this._lotteryPad.highLightWins(this._winningBalls[index]);
                        index++;
                        this.dropBalls(index);
                    }});
                })
            }
            else{
                gsap.delayedCall(delay, ()=>{
                    gsap.to(this._winningBalls[index], {duration: 0.5, y: distance, ease: "Bounce.easeOut", onComplete: ()=>{
                        this._lotteryPad.highLightWins(this._winningBalls[index]);
                        index++;
                        this.dropBalls(index);
                    }});
                })
            }
        }
    }

    /**
     * generate random winning balls from the shuffled array.
     */
    private generateWinningBalls()
    {
        for(let i: number = 0; i < 6; i++)
        {
            let lottoBall = new LotteryBall(this._lottoNumbers[i], this._lottoColours[i]);
            this._winningBalls.push(lottoBall);
            this._lottoBallsContainer.addChild(lottoBall);
        }
    }

    public startWinPresentation()
    {
        const chosenNumbers = this._lotteryPad.getChosenNumbers();
        let total: number = 0;
        //loop through all of the winning balls and also the chosen numbers, if they share the same name then increase the total correct numbers.
        chosenNumbers.forEach((button)=>{
            this._winningBalls.forEach((container)=>{
                if(button.name === container.ball.name)
                {
                    total++;
                }
            })
        })
        //if total is greater or equal than the minimum required to win then display a win, else display a NON win.
        if(total >= GameSettings.MINIMUM_NUMBERS_MATCH)
        {
            let totalWin = this.getTotalWin(total);
            this.displayWin(true, totalWin)
        }
        else{
            this.displayWin(false, 0);
        }
    }

    /**
     * cleanup for when the game resets, removes and resets all variables, arrays and graphics
     */
    public clear()
    {
        for(let i: number = 0; i < this._lottoBallsContainer.children.length; i++){
            let child = this._lottoBallsContainer.getChildAt(i);
            child.destroy();
        }
        this._lottoBallsContainer.removeChildren();
        this._winningBalls = [];
        this._winLabel.alpha = 0;
        this._lossLabel.alpha = 0;

    }

    /**
     * returns the total win based upon how many numbers are correct.
     */
    private getTotalWin(total: number): number
    {
        switch(total)
        {
            case 3:
                return GameSettings.THREE_REWARD;
            case 4:
                return GameSettings.THREE_REWARD;
            case 5:
                return GameSettings.THREE_REWARD;
            case 6:
                return GameSettings.THREE_REWARD;
            default:
                return 0;
        }
    }
    /**
     * displays whether you won/lost on the game and updates the balance/win meters accordingly.
     */
    private displayWin(isWin: boolean, total: number)
    {
        if(isWin)
        {
            this._gameUI.updateBalance(this._gameUI.getBalance() + total);
            this._gameUI.updateWin(total);
            gsap.to(this._winLabel, {duration: 0.5, alpha: 1});
        }
        else{
            //no win handle
            gsap.to(this._lossLabel, {duration: 0.5, alpha: 1})
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
            "fontSize": 300,
            "strokeThickness": 2,
            "trim": false,
            "whiteSpace": "pre",
            "wordWrap": false
        })
    }

    protected get labelStyleLoss(): PIXI.TextStyle {
        return new PIXI.TextStyle({
            "align": "center",
            "dropShadow": true,
            "dropShadowAlpha": 0.8,
            "dropShadowAngle": 1.5,
            "dropShadowDistance": 2,
            "fill": ["#2a4858", "#156979", "#16a48f"],
            "fillGradientStops": [0.3, 0.6, 0.9],
            "stroke": "#240a00",
            "fontSize": 200,
            "strokeThickness": 2,
            "trim": false,
            "whiteSpace": "pre",
            "wordWrap": false
        })
    }

}