import express from "express";
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from "path";

import './database';
import { routes } from './routes';

const app = express();

app.use(express.static(path.join(__dirname, "..", "public")));
app.set("views", path.join(__dirname, "..", "public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.get("/pages/client", (request, response) => {
  return response.render("html/client.html");
});

app.get("/pages/admin", (request, response) => {
  return response.render("html/admin.html");
});

app.get("/pages/login", (request, response) => {
  return response.render("html/login.html");
});


const http = createServer(app); // Criando protocolo http
const io = new Server(http); // Criando protocolo websocket

io.on("connection", (socket: Socket) => {
  //console.log("Se conectou: ", socket.id);
});

app.use(express.json());

/**
 * MÉTODOS HTTP
 * GET = BUSCAS
 * POST = CRIAÇÃO
 * PUT = ALTERAÇÃO
 * DELETE = DELETAR
 * PATCH = ALTERAR UMA INFORMAÇÃO ESPECÍFICA
 */

app.use(routes);

export { http, io }