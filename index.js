const Task = require('./task');

class ProcessKeyMutex {
    constructor() {
        if (global._processKeyMutex == undefined) global._processKeyMutex = new Map();
    }

    async lock(key, task) {
        return await new Promise((resolve, reject) => {
            let newTask = new Task(task, resolve, reject, () => _processKeyMutex.delete(key));
            if (_processKeyMutex.has(key)) {
                let _ = _processKeyMutex.get(key);
                _.nextTask = newTask;
                _processKeyMutex.set(key, newTask);
            }
            else {
                _processKeyMutex.set(key, newTask);
                newTask.do();
            }
        })
    }
}

module.exports = new ProcessKeyMutex();