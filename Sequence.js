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

    timer() {
        this.currentInterval.diff = this.currentInterval.duration - (((Date.now() - this.offset - this.currentInterval.start) / 1000) | 0);
        console.log(this.currentInterval.diff);

        if (this.currentInterval.diff <= 0) {
            clearInterval(this.jsInterval);
            this.offset = 0;
            let index = this.currentInterval.index;

            // Are there more intervals?
            if (this.nextInterval()) {
                this.start();

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
        // Is the next interval a rest?
        if (this.getRestInterval()) {

            this.currentInterval = this.getRestInterval();
            this.currentInterval.index = index;
        // are there are more intervals in this set?
        } else if (index < this.intervals.length - 1) {
            this.currentInterval = this.intervals[index + 1]
        // is there another set?
        } else if (this.currentSet < this.numberOfSets) {
            this.currentSet++;
            this.currentInterval = this.firstInterval();
        } else {
            this.currentInterval = false;
        }
        return this.currentInterval;
    }

    getRemaining() {
        return this.diff;
    }

    // Fetch the appropriate rest interval
    getRestInterval(){
        // don't rest if we're already resting
        if (this.currentInterval.rest) return false;
        let isLastInterval = (this.currentInterval.index >= this.intervals.length - 1);
        // last interval of last set, no rest
        if (isLastInterval && this.currentSet >= this.numberOfSets) {
            return false;
        } 

        // which interval do we want?
        let rest = isLastInterval ? this.setRest : this.intervalRest;

        if (rest.duration > 0) {
            return rest;
        } else {
            return false;
        }
       
    }

    start() {
        if (!this.currentInterval) {
            console.log('no active interval');
            return;
        }
        if (!this.currentInterval.duration) throw new Error('Interval has no duration');

        this.currentInterval.start = Date.now();
        if (this.currentInterval.index == 0) this.emit('set start');
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