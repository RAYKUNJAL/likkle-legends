// @ts-nocheck
function asMs(samples, sampleRate) {
    return (samples * 1000 / sampleRate).toFixed(1);
}

function asSamples(mili, sampleRate) {
    return Math.round(mili * sampleRate / 1000);
}

class MoshiProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        // Default sample rate if global not available (though it should be in AudioWorkletGlobalScope)
        this.sampleRate = sampleRate || 24000;

        console.log("Moshi processor initialized");

        // Buffer length definitions
        let frameSize = asSamples(80, this.sampleRate);
        this.initialBufferSamples = 1 * frameSize;
        this.partialBufferSamples = asSamples(10, this.sampleRate);
        this.maxBufferSamples = asSamples(10, this.sampleRate);

        // increments
        this.partialBufferIncrement = asSamples(5, this.sampleRate);
        this.maxPartialWithIncrements = asSamples(80, this.sampleRate);
        this.maxBufferSamplesIncrement = asSamples(5, this.sampleRate);
        this.maxMaxBufferWithIncrements = asSamples(80, this.sampleRate);

        // State and metrics
        this.initState();

        this.port.onmessage = (event) => {
            if (event.data.type == "reset") {
                console.log("Reset audio processor state.");
                this.initState();
                return;
            }
            let frame = event.data.frame;
            if (frame) {
                this.frames.push(frame);
                if (this.currentSamples() >= this.initialBufferSamples && !this.started) {
                    this.start();
                }
            }
        };
    }

    initState() {
        this.frames = new Array();
        this.offsetInFirstBuffer = 0;
        this.firstOut = false;
        this.remainingPartialBufferSamples = 0;
        this.timeInStream = 0.;
        this.resetStart();

        // Metrics
        this.totalAudioPlayed = 0.;
        this.actualAudioPlayed = 0.;
        this.maxDelay = 0.;
        this.minDelay = 2000.;
        // Debug
        this.pidx = 0;

        this.partialBufferSamples = asSamples(10, this.sampleRate);
        this.maxBufferSamples = asSamples(10, this.sampleRate);
    }

    currentSamples() {
        let samples = 0;
        for (let k = 0; k < this.frames.length; k++) {
            samples += this.frames[k].length
        }
        samples -= this.offsetInFirstBuffer;
        return samples;
    }

    resetStart() {
        this.started = false;
    }

    start() {
        this.started = true;
        this.remainingPartialBufferSamples = this.partialBufferSamples;
        this.firstOut = true;
    }

    canPlay() {
        return this.started && this.frames.length > 0 && this.remainingPartialBufferSamples <= 0;
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0][0];
        if (!output) return true;

        if (!this.canPlay()) {
            // If we can't play, output silence
            if (this.actualAudioPlayed > 0) {
                this.totalAudioPlayed += output.length / this.sampleRate;
            }
            this.remainingPartialBufferSamples -= output.length;
            return true;
        }

        let out_idx = 0;
        while (out_idx < output.length && this.frames.length) {
            let first = this.frames[0];
            let to_copy = Math.min(first.length - this.offsetInFirstBuffer, output.length - out_idx);
            output.set(first.subarray(this.offsetInFirstBuffer, this.offsetInFirstBuffer + to_copy), out_idx);
            this.offsetInFirstBuffer += to_copy;
            out_idx += to_copy;
            if (this.offsetInFirstBuffer == first.length) {
                this.offsetInFirstBuffer = 0;
                this.frames.shift();
            }
        }

        // Fill remaining with silence and fade out if we ran out
        if (out_idx < output.length) {
            this.resetStart();
            // Fade out slightly to avoid clicks
            for (let i = 0; i < out_idx; i++) {
                output[i] *= (out_idx - i) / out_idx;
            }
        }

        this.totalAudioPlayed += output.length / this.sampleRate;
        this.actualAudioPlayed += out_idx / this.sampleRate;
        this.timeInStream += out_idx / this.sampleRate;

        return true;
    }
}

registerProcessor("moshi-processor", MoshiProcessor);
