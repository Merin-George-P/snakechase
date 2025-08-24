// Audio system using Web Audio API for retro sound effects
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.sounds = {};
        this.musicGain = null;
        this.sfxGain = null;
        this.isMuted = false;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            
            // Create separate gain nodes for music and SFX
            this.musicGain = this.audioContext.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = 0.3;
            
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = 0.7;
            
            // Generate sound effects
            this.generateSounds();
            this.isInitialized = true;
            
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    generateSounds() {
        // Generate retro-style sound effects using oscillators
        this.sounds = {
            catch: this.createCatchSound(),
            move: this.createMoveSound(),
            boost: this.createBoostSound(),
            gameOver: this.createGameOverSound(),
            backgroundMusic: this.createBackgroundMusic()
        };
    }

    createCatchSound() {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            // Create a rising tone
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.type = 'square';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    createMoveSound() {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.type = 'square';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }

    createBoostSound() {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            // Create a whoosh effect
            oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.type = 'sawtooth';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createGameOverSound() {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            // Create a descending tone
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 1);
            
            gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
            
            oscillator.type = 'triangle';
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 1);
        };
    }

    createBackgroundMusic() {
        return {
            start: () => {
                if (!this.audioContext || this.isMuted) return;
                
                // Create a simple background loop with multiple oscillators
                this.backgroundOscillators = [];
                
                // Bass line
                const bass = this.audioContext.createOscillator();
                const bassGain = this.audioContext.createGain();
                bass.connect(bassGain);
                bassGain.connect(this.musicGain);
                bass.frequency.value = 110;
                bass.type = 'square';
                bassGain.gain.value = 0.1;
                bass.start();
                this.backgroundOscillators.push(bass);
                
                // Melody
                const melody = this.audioContext.createOscillator();
                const melodyGain = this.audioContext.createGain();
                melody.connect(melodyGain);
                melodyGain.connect(this.musicGain);
                melody.frequency.value = 440;
                melody.type = 'triangle';
                melodyGain.gain.value = 0.05;
                melody.start();
                this.backgroundOscillators.push(melody);
                
                // Create a simple melody pattern
                this.createMelodyPattern(melody);
            },
            stop: () => {
                if (this.backgroundOscillators) {
                    this.backgroundOscillators.forEach(osc => osc.stop());
                    this.backgroundOscillators = null;
                }
            }
        };
    }

    createMelodyPattern(oscillator) {
        if (!this.audioContext) return;
        
        const notes = [440, 523, 587, 523, 440, 349, 440];
        let noteIndex = 0;
        const noteInterval = 0.5; // Half second per note
        
        const playNextNote = () => {
            if (this.backgroundOscillators && oscillator) {
                oscillator.frequency.setValueAtTime(notes[noteIndex], this.audioContext.currentTime);
                noteIndex = (noteIndex + 1) % notes.length;
                setTimeout(playNextNote, noteInterval * 1000);
            }
        };
        
        playNextNote();
    }

    async playSound(soundName) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    async playBackgroundMusic() {
        if (!this.isInitialized) {
            await this.init();
        }
        
        if (this.sounds.backgroundMusic) {
            this.sounds.backgroundMusic.start();
        }
    }

    stopBackgroundMusic() {
        if (this.sounds.backgroundMusic) {
            this.sounds.backgroundMusic.stop();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : 1;
        }
        
        // Update UI
        const soundBtn = document.getElementById('sound-btn');
        soundBtn.textContent = this.isMuted ? '🔇' : '🔊';
        
        // If unmuting, resume audio context if needed
        if (!this.isMuted && this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Create global audio manager instance
const audioManager = new AudioManager();

// Global audio functions for game.js
async function playSound(soundName) {
    await audioManager.playSound(soundName);
}

async function playBackgroundMusic() {
    await audioManager.playBackgroundMusic();
}

function stopBackgroundMusic() {
    audioManager.stopBackgroundMusic();
}

function toggleSound() {
    audioManager.toggleMute();
}

// Initialize audio on first user interaction
document.addEventListener('click', async () => {
    if (!audioManager.isInitialized) {
        await audioManager.init();
    }
}, { once: true });

document.addEventListener('keydown', async () => {
    if (!audioManager.isInitialized) {
        await audioManager.init();
    }
}, { once: true });

document.addEventListener('touchstart', async () => {
    if (!audioManager.isInitialized) {
        await audioManager.init();
    }
}, { once: true });
