import { Howl } from "howler"
/**
 * AudioManager
 * Handles all audio in game
 */
export class AudioManager {
    private sounds: Map<string, Howl> = new Map();
    private _context: PIXI.Container;
    public constructor(context: PIXI.Container) {
        this._context = context;
    }


    public addSound(name: string, audioFileMP3: string) {
        const sound = new Howl({ src: [audioFileMP3] })
        this.sounds.set(name, sound);
    }

    public playSound(name: string) {
        if (this.sounds.get(name)) {
            let sound = this.sounds.get(name)
            if (sound) {
                sound.play();
            }

        }
    }
}