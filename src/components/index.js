// for (let i = 0; i < 3; i++)
// {
//     send();
// }
// for (let i = 0; i < 3; i++)
// {
//     await send();
// }







// this function waits for ms milliseconds and then returns the value
function wait(ms, returnValue)
{
    return new Promise((resolve, reject) =>
    {
        setTimeout(() => resolve(returnValue), ms);
    });
}



// this function waits for ms milliseconds and then rejects with the value
// reject usually means an error happened
function waitAndReject(ms, rejectValue)
{
    return new Promise((resolve, reject) =>
    {
        setTimeout(() => reject(rejectValue), ms);
    });
}

// example1 and example2 are the same semantically
function example1()
{
    console.log('example1 sync code');
    return wait(1000, 'foo').then((value) =>
    {
        console.log('example1', value);
    });
}

// example1()

async function example2()
{
    console.log('example2 sync code');
    const value = await wait(1000, 'foo');
    console.log('example2', value);
}

// example2()

// the return value of a then chain is a promise
// the return value of an async function is a promise
// note the order of execution
async function example3()
{
    const tx1 = example1();
    const tx2 = example2();

    console.log('tx1 created', tx1);
    // console.log('tx1 created', example1());
    console.log('tx2 created', tx2);
}

// example3()

// you can think of the function passed to then as a callback, executed once the async operation is complete
// you can chain multiple callbacks just like in a normal callback code
async function example4()
{
    wait(1000, 'foo')
        .then(val1 =>
        { // first callback

            console.log(val1);

            wait(1000, 'bar')
                .then(val2 =>
                { // second callback

                    console.log(val2);

                });

        })
}

// example4()

// the advantage of promises is that you can return a promise from a callback
// this allows you to chain multiple async operations without nesting
// example4 and example5 are equivalent!
async function example5()
{
    wait(1000, 'foo')
        .then(val1 =>
        { // first callback
            console.log(val1);
            return wait(1000, 'bar');
        })
        .then(val2 =>
        { // second callback
            console.log(val2);
        })
}

// example5()

// the same thing again, using await
async function exampleAnother5()
{
    const val1 = await wait(1000, 'foo');
    console.log(val1);
    const val2 = await wait(1000, 'bar');
    console.log(val2);
}

async function waitAndLog(ms, value)
{
    await wait(ms, value);
    console.log(value);
    return value;
}

// waitAndLog(1000, 'hi')

// note the difference between calling with await and without
async function example6()
{
    waitAndLog(1500, '1');
    waitAndLog(500, '2');
    waitAndLog(1000, '3');
}

// example6()

async function example7()
{
    await waitAndLog(1500, '1');
    await waitAndLog(500, '2');
    await waitAndLog(1000, '3');
}

// example7()


// note the difference between calling with await and without in catch
async function example8()
{
    try
    {
        await waitAndReject(1000, 'error1');
    } catch (e)
    {
        console.log('catch', e);
    }
}

// example8()

async function example9()
{
    const tx = waitAndLog(1000, 'foo');
    console.log('tx created', tx);
    const value = await tx;
    console.log('tx awaited', value);
}
example9()

async function example10()
{
    const tx = waitAndReject(1000, 'error1');
    try
    {
        await tx;
        console.log('tx awaited', tx);
    } catch (e)
    {
        console.log('catch', e);
    }
}
// example10()


// some more complicated examples to test your understanding
// try to guess what they will log, use pen and paper if you need to
async function example11()
{
    const foo = waitAndLog(1500, 'foo');
    const bar = waitAndLog(1000, 'bar');
    const baz = waitAndLog(500, 'baz');
    const qux = waitAndLog(2000, 'qux');

    const tx1 = Promise.all([foo, bar]);
    const tx2 = Promise.all([foo, baz]);
    const tx3 = Promise.all([bar, baz]);
    const tx4 = Promise.all([tx1, baz]);

    console.log(await tx4);
}
// example11();

async function test()
{
    const call = waitAndLog(1000, 'hey')
    console.log(call);
}
// test()


async function example12()
{
    let tx;

    async function f()
    {
        await waitAndLog(500, 'f1');
        tx = waitAndLog(1600, 'f2');
        await waitAndLog(700, 'f3');
    }

    async function g()
    {
        await waitAndLog(800, 'g1');
        await tx;
        await waitAndLog(900, 'g3');
    }

    f();
    g();
}

// example12();



const addresses = ['one', 'two', 'three']
const th = async (ms, value) =>
{
    try
    {
        await wait(ms, value);
        console.log(value)
    } catch (error)
    {
        console.error(error)
    }
}

for (const address of addresses)
{
    const tx = th(1000, address)
}