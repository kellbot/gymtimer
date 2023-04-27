const EventEmitter = require('events');

class Sequence extends EventEmitter {
    

    constructor (saveData, fileId) {
        super();

        if (saveData) {
            Object.assign(this, saveData);
            this.id = fileId;
            this.currentInterval = this.firstInterval();
            this.currentSet = 0;
            this.indexIntervals();
            this.resting = false;

        } else {
            throw new Error('Initializd empty sequence');
        }

    }

    rest() {
        this.resting.diff = this.resting.duration - ( ( (Date.now() - this.resting.start) / 1000 ) | 0 );
        console.log(this.resting.diff);
        if (this.resting.diff <= 0) {
            clearInterval(this.jsInterval);
            // start next interval
            console.log(`starting interval ${this.currentInterval.index + 1}`);
            this.start();
        }

    }

    timer() {
        this.currentInterval.diff = this.currentInterval.duration - (((Date.now() - this.currentInterval.start) / 1000) | 0);
        console.log(this.currentInterval.diff);

        if (this.currentInterval.diff <= 0) {          
            clearInterval(this.jsInterval);

            // If there is another interval
            if (this.nextInterval()) {
                // Rest before next interval
                this.resting = {start: Date.now(), duration: this.intervalRest.duration};
                this.rest();
                this.emit('interval start', {duration: this.resting.duration, name: 'Rest'});
                
                this.jsInterval = setInterval(this.rest.bind(this), 1000);

            // if not we look for the next round    
            } else {
                if (this.currentSet < this.numberOfSets) {
                    this.currentSet++;
                    this.currentInterval = this.firstInterval();
                    this.start();
                }
            }

        }
    }

    // Gives each interval an index for easy reference
    indexIntervals() {
        for ( let i = 0; i < this.intervals.length; i++) {
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
}

module.exports = { Sequence };