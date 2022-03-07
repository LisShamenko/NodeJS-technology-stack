const zmq = require("zeromq");

(async () => {

    // 
    console.log('--- 1 --- create PULL --- tcp://127.0.0.1:3000');
    const sock = new zmq.Pull;
    sock.connect("tcp://127.0.0.1:3000");

    // 
    console.log('--- 2 --- while');
    for await (const [msg] of sock) {

        // 
        console.log("--- 3 --- work: " + msg.toString());
    }
})();