const intervalComplete = new Event("intervalComplete");

class Sequence {
    

    constructor (saveData, fileId) {
        if (saveData) {
            Object.assign(this, saveData);
            this.id = fileId;

        } else {
            throw new Error('Initializd empty sequence');
        }
        this.addEventListener(
            "intervalComplete",
            (e) => {
              /* … */
            },
            false
          );
    }

    timer() {
        this.currentInterval.diff = this.currentInterval.duration - (((Date.now() - this.currentInterval.start) / 1000) | 0);

        if (this.currentInterval.diff <= 0) {
            this.dispatchEvent(intervalComplete);
            clearInterval(this.jsInterval);
        //   this.endInterval();
        //   if (round < totalRounds) {
        //     round++;
        //     start = Date.now() + 1000;
            
        //     clearInterval(interval);
        //     interval = setInterval(timer, 1000);
        //   } else {

        //     display.classList.remove('active')
        //     clearInterval(interval);
        //   }
        }
    }

    firstInterval() {
        return this.intervals[0];
    }

    getRemaining() {
        return this.diff;
    }

    start() {
        this.currentInterval = this.firstInterval();
        console.log(this.currentInterval);
        if (!this.currentInterval.duration) throw new Error('Interval has no duration');
        this.currentSet = 0;

        this.currentInterval.start = Date.now();

        this.timer();
        this.jsInterval = setInterval(this.timer.bind(this), 1000);
    }
}

module.exports = { Sequence };