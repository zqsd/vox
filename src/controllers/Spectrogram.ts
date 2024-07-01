import PitchyAnalyzer from "../PitchyAnalyzer";

export class Spectrogram {
    points: Map<number, number> = new Map<number, number>();
    maxDelay: number;
    audioContext?: AudioContext;
    analyserNode?: AnalyserNode;
    source?: MediaStreamAudioSourceNode;
    pitchAnalyzer?: PitchyAnalyzer;

    constructor(maxDelay: number = 10) {
        this.maxDelay = maxDelay;
    }

    get running() {
        return !!this.source && !!this.pitchAnalyzer;
    }

    async start() {
        if (!this.source) {
            const audio = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.audioContext = new AudioContext();
            this.analyserNode = this.audioContext.createAnalyser();
            this.source = this.audioContext.createMediaStreamSource(audio);
            this.source.connect(this.analyserNode);
        }

        if(!this.pitchAnalyzer) {
            this.pitchAnalyzer = new PitchyAnalyzer(this.audioContext!, this.analyserNode!);
            this.pitchAnalyzer.addEventListerner((pitch) => {
                this.put(pitch);
            });
        }
    }

    put(pitch: number, timestamp?: number) {
        if (!timestamp) timestamp = Date.now();
        this.points.set(timestamp / 1000, pitch);

        this.clean();
    }

    clean() {
        const now = Date.now() / 1000,
              timeout = now - this.maxDelay;
        for (const key of this.points.keys()) {
            if (key < timeout) {
                this.points.delete(key);
            }
        }
    }
}

export const spectrogram = new Spectrogram();