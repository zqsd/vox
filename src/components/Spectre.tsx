import { Component, RefObject, createRef } from 'react'
import { spectrogram } from '../controllers/Spectrogram';

export class Spectre extends Component {
    private _canvasRef: RefObject<HTMLCanvasElement>;
    padding = {top: 10, right: 30, bottom: 30, left: 10};
    maxFreq: number = 320;
    running: boolean = false;
    maxLine: number = 0.75;

    constructor(props: {width: number, height: number}) {
        super(props);
        this._canvasRef = createRef();
        this.updateCanvas = this.updateCanvas.bind(this);
    }

    componentDidMount() {
        //const height = this.divElement.clientHeight;
        //this.setState({ height });
        
        if(!this.running) {
            this.running = true;
            this.updateCanvas();
        }
    }

    componentDidUpdate() {
        this.running = false;
        //this.updateCanvas();
    }

    updateCanvas() {
        if(!this.running) return;

        const canvas = this._canvasRef?.current;
        if(!canvas) return;

        const ctx = this._canvasRef?.current?.getContext('2d');
        if(!ctx) return;

        const W = canvas.width,
              H = canvas.height;
        const w = W - this.padding.left - this.padding.right,
              h = H - this.padding.top - this.padding.bottom;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, W, H);

        // graph background
        ctx.translate(this.padding.left, this.padding.right);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.rect(0, 0, w, h);
        ctx.save();
        ctx.clip();

        function toX(timestamp: number) {
            return w - (now - timestamp) * w / spectrogram.maxDelay;
        }
        
        const maxFreq = this.maxFreq;
        function toY(freq: number) {
            //freq = Math.log10(-freq);
            return h - h * freq / maxFreq;
        }

        // target bands
        ctx.fillStyle = '#fdd';
        ctx.fillRect(0, toY(246.942), w, toY(311.127) - toY(246.942));
        ctx.fillStyle = '#ddf';
        ctx.fillRect(0, toY(123.471), w, toY(146.832) - toY(123.471));

        // graph notes
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#000';
        for (let f = 55; f < this.maxFreq; f = f * 2) {
            ctx.beginPath();
            const y = toY(f);
            ctx.moveTo(w - 5, y);
            ctx.lineTo(w, y);
            ctx.stroke();

            //
        }

        ctx.lineWidth = 2;
        ctx.fillStyle = '#800';
        ctx.strokeStyle = '#f80';
        const now = Date.now() / 1000;
        const points = Array.from(spectrogram.points.entries());
        for(let i = 0; i < points.length; i++) {
            const p = points[i];
            const x = toX(p[0]),
                  y = toY(p[1]);
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();

            if(i < points.length - 1) {
                const p2 = points[i + 1];

                if(p2[0] - p[0] <= this.maxLine) {
                    const x2 = toX(p2[0]),
                        y2 = toY(p2[1]);
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            }
        }

        ctx.restore();
        if(points.length > 0) {
            const [t, f] = points[points.length - 1];
            if(now - t <= this.maxLine) {
                ctx.fillStyle = '#f80';
                ctx.strokeStyle = '#f80';
                ctx.lineWidth = 3;
                const y = toY(f);
                ctx.fillText(`${Math.round(f)} Hz`, w + 6, y + 4);
                ctx.beginPath();
                ctx.moveTo(w - 5, y);
                ctx.lineTo(w + 5, y);
                ctx.stroke();
            }
        }

        window.requestAnimationFrame(this.updateCanvas);
    }

    render() {
        return (
            <div>
                <canvas ref={this._canvasRef} width={640} height={480} />
            </div>
        );
    }
}