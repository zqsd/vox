import { Component, createRef, RefObject } from 'react'
import './App.css'
import { Spectre } from './components/Spectre';
import { spectrogram } from './controllers/Spectrogram';

document.addEventListener("DOMContentLoaded", () => {
  spectrogram.start();
});

class App extends Component {
  _spectreRef: RefObject<Spectre>;

  constructor(props: {}) {
    super(props);
    this._spectreRef = createRef();

    this.start = this.start.bind(this);
  }

  componentDidMount(): void {
    this.start();
  }

  componentWillUnmount() {
  }

  async start(): Promise<void> {
    if (!spectrogram.running) {
      try {
        await spectrogram.start();
      }
      catch(e) {
        console.error('failed to create audio context + analyzer')
      }
    }
  }

  render() {
    return <Spectre ref={this._spectreRef} />;
  }
}

export default App
