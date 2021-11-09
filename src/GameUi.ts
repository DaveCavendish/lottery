import { Meter } from "./Meter";
import * as PIXI from 'pixi.js';
import { Game } from "./Game";
import { GameSettings } from "./GameSettings";
/**
 * Responsible for the three ui meters on screen and updating them. Singleton class to prevent multiple.
 */
export class GameUi extends PIXI.Container
{
    private static instance: GameUi;
    private _balance: number = 0;
    private _balaceMeter: Meter = new Meter(350, 75, "balance:");
    private _winMeter: Meter = new Meter(250, 75, "win:");
    private _betMeter: Meter = new Meter(250, 75, "bet:");

    static getInstance(): GameUi
    {
        if(!GameUi.instance)
        {
            GameUi.instance = new GameUi();
        }
        return GameUi.instance;
    }

    //position all the meters and initialise the bet meter value
    public init()
    {
        this._balaceMeter.x = 100;
        this._balaceMeter.y = 860;
        this._betMeter.x = 100+this._balaceMeter.width;
        this._betMeter.y = 860;
        this._winMeter.x = 100;
        this._winMeter.y = 860+this._betMeter.height;
        this.addChild(this._balaceMeter, this._winMeter, this._betMeter);
        this._betMeter.update(GameSettings.BET);
    }


    public updateBalance(value: number)
    {
        this._balance = value;
        if(this._balaceMeter)
        {
            this._balaceMeter.update(value);
        }
    }

    public updateWin(value: number)
    {
        if(this._winMeter)
        {
            this._winMeter.update(value);
        }
    }

    public getBalance()
    {
        return this._balance;
    }

}