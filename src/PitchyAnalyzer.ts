import { PitchDetector } from "pitchy";

export default class PitchyAnalyzer {
    context: AudioContext;
    node: AnalyserNode;
    detector: PitchDetector<Float32Array>;
    input: Float32Array;
    timerId?: number;
    _callbacks: { (pitch: number): void; }[] = [];
    minClarity: number = 0.6;
    minVolumeDecibels: number = -50;

    constructor(context: AudioContext, node: AnalyserNode) {
        this.context = context;
        this.node = node;

        this.detector = PitchDetector.forFloat32Array(node.fftSize);
        this.detector.minVolumeDecibels = this.minVolumeDecibels;
        this.input = new Float32Array(this.detector.inputLength);

        this.tick = this.tick.bind(this);
        this.tick();
    }

    stop() {
        if(this.timerId) {
            clearTimeout(this.timerId);
        }
    }

    tick() {
        this.node.getFloatTimeDomainData(this.input);
        const [pitch, clarity] = this.detector.findPitch(this.input, this.context.sampleRate);

        //console.log(`pitch: ${pitch} (clarity: ${Math.round(clarity*100)}%)`);
        if(clarity >= this.minClarity) {
            for(const f of this._callbacks) {
                f(pitch);
            }
        }

        this.timerId = window.setTimeout(this.tick, 500);
    }

    addEventListerner(f: (pitch: number) => void) {
        this._callbacks.push(f);
    }
}