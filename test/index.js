const assert = require('assert');
let mutex = require('../');

describe('#basic', function () {
    it('[promise.all]', async function() {
        this.timeout(100000000);
        let [l1, l2] = await Promise.all([
            func('func1', 200),
            func('func2', 100),
        ])
        assert(l1 == 'func1' && l2 == 'func2', `promise.all failed`);
    });

    it('promise && setTimeout', async function() {
        this.timeout(100000000);
        let [l1, l2, l3, l4] = await new Promise(resolve => {
            let result = [];
            setTimeout(async () => {
                func('func3', 2000).then(l => result.push(l));
                func('func4', 1000).then(l => result.push(l));
            }, 1000)
            func('func1', 2000).then(l => result.push(l));
            func('func2', 1000).then(l => result.push(l));
            setInterval(() => {
                if (result.length == 4) resolve(result)
            }, 1000)
        })
        assert(l1 == 'func1' && l2 == 'func2' && l3 == 'func3' && l4 == 'func4', `promise && setTimeout failed`);
    });

    it('immediately && setTimeout', async function() {
        this.timeout(100000000);
        let [l1, l2] = await new Promise(async(resolve) => {
            let result = [];
            result.push(await func('func1', 4000));
            setTimeout(async () => {
                func('func2', 2000).then(l => result.push(l));
            }, 1000)
            setInterval(() => {
                if (result.length == 2) resolve(result)
            }, 1000)
        })
        assert(l1 == 'func1' && l2 == 'func2', `immediately && setTimeout failed`);
    });

    it('[one of throw error]', async function() {
        this.timeout(100000000);
        let [l1, l2] = await new Promise(resolve => {
            let result = [];
            func('func1', 2000).then(l => result.push(l));
            funcErr('func2', 1000).then(l => result.push(l)).catch(error => result.push(error));
            setInterval(() => {
                if (result.length == 2) resolve(result)
            }, 1000)
        })
        assert(l1 == 'func1' && l2 instanceof Error, `one of throw error failed`);
    });
})

let func = async (label, delay) => {
    return mutex.lock('func', async() => {
        //console.log(`execute func: ${label}`);
        await new Promise(resolve => setTimeout(() => resolve(), delay));
        //console.log(`func: ${label} done`);
        return label;
    })
}

let funcErr = async (label, delay) => {
    return mutex.lock('func', async() => {
        //console.log(`execute func: ${label}`);
        throw new Error('error');
    })
}