const zmq = require("zeromq");

(async () => {

    // 
    console.log('--- 1 --- create PUSH --- tcp://127.0.0.1:3000');
    const sock = new zmq.Push;
    await sock.bind("tcp://127.0.0.1:3000");

    // 
    console.log('--- 2 --- while');
    let i = 0;
    while (true) {

        // 
        console.log('--- 3 --- iteration: ' + i++);
        await sock.send("some work");
        await new Promise(resolve => setTimeout(resolve, 500));
    }
})();