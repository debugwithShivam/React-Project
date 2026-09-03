import express from 'express'
import {Server} from "socket.io"
import cors from 'cors'
import http from 'http'


const app = express()
const server = http.createServer(app)

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map() 

const io = new Server(server,{
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }});

io.on("connection",(socket)=>{
    // console.log(socket)
    socket.on("room:join",(data)=>{
        const {email,room} = data
        emailToSocketIdMap.set(email,socket.id);
        socketIdToEmailMap.set(socket.id,email);
        socket.to("room:join",data)
    })
})

server.listen(8000)