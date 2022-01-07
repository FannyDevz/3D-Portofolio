const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: "*"
    }
});

const IDs = [];

io.on("connection", (socket) => {
    socket.on("offer", (e) => {
        const { id, sdp } = e;
        console.log("someone give offer");
        io.to(id).emit("offer", { id: socket.id, sdp }); //id unecessary
    })
    socket.on("answer", (e) => {
        const { id, sdp } = e;
        io.to(id).emit("answer", { id: socket.id, sdp }); //id unecessary
    })
    socket.on("candidate", ({ id, candidate }) => {
        console.log("someone give candidate");
        io.to(id).emit("candidate", { id: socket.id, candidate });
        // socket.broadcast.emit("candidate", { candidate });
    })
    socket.on("join", () => {
        socket.broadcast.emit("join", socket.id);
        // const cloneIDs = { ...IDs };
        // console.log({ cloneIDs })
        // cloneIDs[socket.id] = false;
        // socket.emit("players", cloneIDs);
    })
    socket.on("init", (id_target) => {
        io.to(id_target).emit("init", ({ id: socket.id }));
    }) //please init peerconnection first before offering because u cannot recieve icecandidate before new RTCpeerconnection
    socket.on("disconnect", () => {
        socket.broadcast.emit("left", socket.id);
        delete IDs[socket.id];
    })
    socket.on("player_count", () => {
        socket.emit("player_count", io.engine.clientsCount);
    })
    socket.on("cl_ready", (id) => {
        io.to(id).emit("cl_ready", socket.id);
    })
    socket.on("rm_ready",(id)=>{
        io.to(id).emit("rm_ready", socket.id);

    })
    socket.emit("id", socket.id);
    IDs[socket.id] = true;
    console.log({ IDs })
    console.log(`someone made connection ${socket.id}`)
});
io.listen(2000)