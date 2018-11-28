module.exports = class {
    constructor(task, resolve, reject, empty) {
        this._task = task;
        this._resolve = resolve;
        this._reject = reject;
        this._empty = empty;
        this._nextTask = null;
    }

    async do() {
        try {
            this._resolve(await this._task());
        }
        catch(error) {
            this._reject(error);
        }
        finally {
            if (this._nextTask != undefined) {
                this._nextTask.do();
            }
            else {
                this._empty();
            }
        } 
    }

    set nextTask(nextTask) {
        this._nextTask = nextTask;
    }

    get nextTask() {
        return this._nextTask;
    }
}