import {
    random
} from "/src/scripts/lib.js";

const AUDIO = {
    audioContext: new AudioContext(),
    audioBuffers: {},
    themePlaying: false,
    lastTrackPlayed: undefined,
    volume: undefined
};
AUDIO.gainNode = AUDIO.audioContext.createGain();
AUDIO.gainNode.connect(AUDIO.audioContext.destination);
AUDIO.gainNode.gain.setValueAtTime($SETTINGS.volume, AUDIO.audioContext.currentTime);

function AudioAsset(name, src) {
    return new Promise((res, rej) => {
        let audio = new Audio(src);
        audio.start = function() {
            if (AUDIO.lastTrackPlayed !== audio) {
                if (AUDIO.lastTrackPlayed === undefined) {
                    audio.play();
                    audio.volume = $SETTINGS.volume;
                    AUDIO.lastTrackPlayed = audio;
                } else {
                    setTimeout(() => {
                        audio.play();
                        audio.volume = $SETTINGS.volume;
                        AUDIO.lastTrackPlayed = audio;
                    }, 20000);
                }
            } else {
                AUDIO.playNextTrack();
            }
        }
        audio.onended = function() {
            AUDIO.playNextTrack();
        }
        audio.oncanplaythrough = () => {
            AUDIO[name] = audio;
            res(audio);
        }
    });
}

AUDIO.addSound = function(name, url) {
    fetch(url).then(res => res.arrayBuffer()).then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer)).then(buffer => {
        this.audioBuffers[name] = buffer;
    });
}

AUDIO.playSound = function(name) {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffers[name];
    source.connect(AUDIO.gainNode);
    source.start();
}

AUDIO.playNextTrack = function() {
    let track = random(9);
    AUDIO[String(track)].start();
}

AUDIO.addSound("pistol-shot", "/public/audio/sounds/pistol.mp3");
AUDIO.addSound("pistol-shot-2", "/public/audio/sounds/pistol-2.mp3");
AUDIO.addSound("pistol-shot-3", "/public/audio/sounds/pistol-3.mp3");
AUDIO.addSound("pistol-shot-4", "/public/audio/sounds/pistol-4.mp3");
AUDIO.addSound("pistol-shot-5", "/public/audio/sounds/pistol-5.mp3");
AUDIO.addSound("pistol-shot-6", "/public/audio/sounds/pistol-shot-6.mp3");
AUDIO.addSound("pistol-shot-7", "/public/audio/sounds/pistol-7.mp3");
AUDIO.addSound("pistol-shot-8", "/public/audio/sounds/pistol-shot-8.mp3");
AUDIO.addSound("shotgun-shot-1", "/public/audio/sounds/shotgun-1.mp3");
AUDIO.addSound("shotgun-shot-2", "/public/audio/sounds/shotgun-2.mp3");
AUDIO.addSound("shotgun-shot-3", "/public/audio/sounds/shotgun-3.mp3");
AUDIO.addSound("shotgun-shot-4", "/public/audio/sounds/shotgun-4.mp3");
AUDIO.addSound("shotgun-shot-5", "/public/audio/sounds/shotgun-shot-5.mp3");
AUDIO.addSound("shotgun-shot-6", "/public/audio/sounds/shotgun-shot-6.mp3");
AUDIO.addSound("shotgun-shot-7", "/public/audio/sounds/shotgun-shot-7.mp3");
AUDIO.addSound("bulletshell", "/public/audio/sounds/bulletshell.mp3");
AUDIO.addSound("pistol-reload", "/public/audio/sounds/pistol-reload.mp3");
AUDIO.addSound("revolver-reload", "/public/audio/sounds/revolver-reload.mp3");
AUDIO.addSound("shotgun-reload", "/public/audio/sounds/shotgun-reload.mp3");
AUDIO.addSound("bullet-impact-1", "/public/audio/sounds/bullet-impact-1.mp3");
AUDIO.addSound("bullet-impact-2", "/public/audio/sounds/bullet-impact-2.mp3");
AUDIO.addSound("bullet-body-impact", "/public/audio/sounds/bullet-body-impact.mp3");
AUDIO.addSound("swing-1", "/public/audio/sounds/swing-1.mp3");
AUDIO.addSound("swing-2", "/public/audio/sounds/swing-2.mp3");
AUDIO.addSound("knife-1", "/public/audio/sounds/knife-1.mp3");
AUDIO.addSound("knife-2", "/public/audio/sounds/knife-2.mp3");
AUDIO.addSound("punch", "/public/audio/sounds/punch.mp3");
AUDIO.addSound("equip", "/public/audio/sounds/item-equip.mp3");
AUDIO.addSound("empty-shot", "/public/audio/sounds/empty-gun-shot.mp3");
AUDIO.addSound("explosion", "/public/audio/sounds/explosion.mp3");
AUDIO.addSound("light-switch", "/public/audio/sounds/light-switch.mp3");
AUDIO.addSound("door-close", "/public/audio/sounds/door-close.mp3");
AUDIO.addSound("click", "/public/audio/sounds/click.mp3");
AUDIO.addSound("gun-loaded", "/public/audio/sounds/gun-loaded.mp3");
AUDIO.addSound("money-sound", "/public/audio/sounds/money-sound.mp3");
AUDIO.addSound("bomb-beep", "/public/audio/sounds/bomb-beep.mp3");

new AudioAsset("0", "/public/audio/music/main-theme.wav");
new AudioAsset("1", "/public/audio/music/track-1.wav");
new AudioAsset("2", "/public/audio/music/track-2.wav");
new AudioAsset("3", "/public/audio/music/track-3.wav");
new AudioAsset("4", "/public/audio/music/track-4.wav");
new AudioAsset("5", "/public/audio/music/track-5.wav");
new AudioAsset("6", "/public/audio/music/track-6.wav");
new AudioAsset("7", "/public/audio/music/track-7.wav");
new AudioAsset("8", "/public/audio/music/track-8.wav");

window.$AUDIO = AUDIO;