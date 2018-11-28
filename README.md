Process-Key-Mutex
==============
基于当前进程内存，对当前进程内同一个key绑定的函数执行进行加锁操作．
- 多个方法绑定同个key的话，同个时间只会执行一个，其他的按照绑定时间顺延执行．
- 实现方式: Promise & 链表
## 使用方式:
```js
let mutex = require('process-key-mutex');
console.log(
    await mutex.lock('mutexKey', async() => {
        await new Promise(resolve => setTimeout(() => resolve(), 1000));
        return 'hi';
    })
) 

// hi
```
## 测试样例:
```js
const assert = require('assert');
let mutex = require('process-key-mutex');

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
```