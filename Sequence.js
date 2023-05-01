const EventEmitter = require('events');

class Sequence extends EventEmitter {


    constructor(saveData) {
        super();

        if (saveData) {
            Object.assign(this, saveData);
            this.currentInterval = this.firstInterval();
            this.currentSet = 1;
            this.indexIntervals();
            this.resting = false;
            this.offset = 0;

        } else {
            throw new Error('Initializd empty sequence');
        }

    }

    rest() {
        if(!this.resting) return;
        this.resting.diff = this.resting.duration - (((Date.now() - this.offset - this.resting.start) / 1000) | 0);
        if (this.resting.diff <= 0) {
            this.resting = false;
            clearInterval(this.jsInterval);
            this.offset = 0;
            this.start();
        }

    }

    timer() {
        this.currentInterval.diff = this.currentInterval.duration - (((Date.now() - this.offset - this.currentInterval.start) / 1000) | 0);
        console.log(this.currentInterval.diff);

        if (this.currentInterval.diff <= 0) {
            clearInterval(this.jsInterval);
            this.offset = 0;

            // If there is another interval
            if (this.nextInterval()) {
                // Rest before next interval
                this.resting = this.intervalRest;
                this.resting.start = Date.now();
                this.rest();
                this.emit('interval start', this.resting);

                this.jsInterval = setInterval(this.rest.bind(this), 1000);

                // if not we look for the next round    

            } else if (this.currentSet < this.numberOfSets) {
                this.emit('set start');
                this.currentSet++;
                this.currentInterval = this.firstInterval();
                if (this.setRest.duration > 0 ) {

                    this.resting = this.setRest;
                    this.resting.start = Date.now();
                    this.rest();

                    this.emit('interval start', this.resting);
                    this.jsInterval = setInterval(this.rest.bind(this), 1000);

                } else {
                    clearInterval(this.jsInterval);
                    this.offset = 0;
                    this.start();
                }

            } else {
                //It's over!
                this.emit('timer complete');
                console.log('timer complete');
            }

        }
    }

    // Gives each interval an index for easy reference
    indexIntervals() {
        for (let i = 0; i < this.intervals.length; i++) {
            this.intervals[i].index = i;
        }
    }

    firstInterval() {
        return this.intervals[0];
    }

    nextInterval() {
        let index = this.currentInterval.index;
        if (index < this.intervals.length - 1) {
            this.currentInterval = this.intervals[index + 1]
        } else {
            this.currentInterval = false;
        }
        return this.currentInterval;
    }

    getRemaining() {
        return this.diff;
    }

    start() {
        if (!this.currentInterval) {
            console.log('no active interval');
            return;
        }
        if (!this.currentInterval.duration) throw new Error('Interval has no duration');

        this.currentInterval.start = Date.now();
        this.emit('interval start', this.currentInterval);
        this.timer();
        this.jsInterval = setInterval(this.timer.bind(this), 1000);

    }
    pause() {
        clearInterval(this.jsInterval);
        this.pauseTime = Date.now();
    }

    resume() {
        this.offset = this.offset + (Date.now() - this.pauseTime);
        if (this.resting) {
            this.jsInterval = setInterval(this.rest.bind(this), 1000);
        } else {
            this.jsInterval = setInterval(this.timer.bind(this), 1000);
        }
    }

    reset() {
        clearInterval(this.jsInterval);
        this.jsInterval = false;
        this.currentInterval = this.firstInterval();
        this.currentSet = 1;
        this.resting = false;
    }
}

module.exports = { Sequence };