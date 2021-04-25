const socket = io();
let connectionsUsers = [];
let connectionUsersSupport = []

socket.on("admin_list_users_support", (connections) => {
  if (connections.length > 0) {
    connectionUsersSupport = connections;
  
    const template = document.getElementById("admin_template").innerHTML;

    connectionUsersSupport.forEach((connection) => {
      const rendered = Mustache.render(template, {
        email: connection.user.email,
        id: connection.user_id,
      });

      let params = {
        user_id: connection.user_id
      }

      document.getElementById("supports").innerHTML += rendered;
      
      socket.emit("admin_list_messages_by_user", params, (messages) => {
        const divMessages = document.getElementById(
          `allMessages${connection.user_id}`
        );
  
        messages.forEach((message) => {
          const createDiv = document.createElement("div");
    
          if (message.admin_id === null) {
            createDiv.className = "admin_message_client";
    
            createDiv.innerHTML = `<span>${connection.user.email} </span>`;
            createDiv.innerHTML += `<span>${message.text}</span>`;
            createDiv.innerHTML += `<span class="admin_date">${dayjs(
              message.created_at
            ).format("DD/MM/YYYY HH:mm:ss")}</span>`;
          } else {
            createDiv.className = "admin_message_admin";
    
            createDiv.innerHTML = `Atendente: <span>${message.text}</span>`;
            createDiv.innerHTML += `<span class="admin_date>${dayjs(
              message.created_at
            ).format("DD/MM/YYYY HH:mm:ss")}`;
          }
    
          divMessages.appendChild(createDiv);
        });
      });
    });
  }
});

socket.on("admin_list_all_users", (connections) => {
  if (connections.length > 0) {
    connectionsUsers = connections;
  }

  document.getElementById("list_users").innerHTML = "";

  let template = document.getElementById("template").innerHTML;

  connections.forEach((connection) => {
    const rendered = Mustache.render(template, {
      email: connection.user.email,
      id: connection.socket_id,
    });

    document.getElementById("list_users").innerHTML += rendered;
  });
});

function call(id) {
  let connection = null;
  if (connectionsUsers.length > 0) {
    connection = connectionsUsers.find(
      (connection) => connection.socket_id === id
    );
  } else {
    connection = connectionUsersSupport.find(
      (connection) => connection.socket_id === id
    );
  }

  const template = document.getElementById("admin_template").innerHTML;

  const rendered = Mustache.render(template, {
    email: connection.user.email,
    id: connection.user_id,
  });

  document.getElementById("supports").innerHTML += rendered;

  const params = {
    user_id: connection.user_id,
  };

  socket.emit("admin_user_in_support", params);

  socket.emit("admin_list_messages_by_user", params, (messages) => {
    const divMessages = document.getElementById(
      `allMessages${connection.user_id}`
    );

    messages.forEach((message) => {
      const createDiv = document.createElement("div");

      if (message.admin_id === null) {
        createDiv.className = "admin_message_client";

        createDiv.innerHTML = `<span>${connection.user.email} </span>`;
        createDiv.innerHTML += `<span>${message.text}</span>`;
        createDiv.innerHTML += `<span class="admin_date">${dayjs(
          message.created_at
        ).format("DD/MM/YYYY HH:mm:ss")}</span>`;
      } else {
        createDiv.className = "admin_message_admin";

        createDiv.innerHTML = `Atendente: <span>${message.text}</span>`;
        createDiv.innerHTML += `<span class="admin_date>${dayjs(
          message.created_at
        ).format("DD/MM/YYYY HH:mm:ss")}`;
      }

      divMessages.appendChild(createDiv);
    });
  });
}

function cancel(id) {
  const params = {
    user_id: id
  };

  socket.emit("admin_cancel_support", params);

  window.location.reload();
}

function sendMessage(id) {
  const text = document.getElementById(`send_message_${id}`);

  const params = {
    text: text.value,
    user_id: id,
  };

  socket.emit("admin_send_message", params);

  const divMessages = document.getElementById(`allMessages${id}`);

  const createDiv = document.createElement("div");
  createDiv.className = "admin_message_admin";
  createDiv.innerHTML = `Atendente: <span>${params.text}</span>`;
  createDiv.innerHTML += `<span class="admin_date>${dayjs().format(
    "DD/MM/YYYY HH:mm:ss"
  )}`;

  divMessages.appendChild(createDiv);

  text.value = "";

  let scrollPosicao = document.getElementById(`allMessages${id}`);

  scrollPosicao.scrollTop = scrollPosicao.scrollHeight;
}

socket.on("admin_receive_message", (data) => {
  console.log(data);
  let connection = null;
  if (connectionsUsers.length > 0) {
    connection = connectionsUsers.find(
      (connection) => (connection.socket_id === data.socket_id)
    );
  } else {
    connection = connectionUsersSupport.find(
      (connection) => (connection.socket_id === data.socket_id)
    );
  }

  const divMessages = document.getElementById(
    `allMessages${connection.user_id}`
  );

  const createDiv = document.createElement("div");

  createDiv.className = "admin_message_client";
  createDiv.innerHTML = `<span>${connection.user.email} </span>`;
  createDiv.innerHTML += `<span>${data.message.text}</span>`;
  createDiv.innerHTML += `<span class="admin_date">${dayjs(
    data.message.created_at
  ).format("DD/MM/YYYY HH:mm:ss")}</span>`;

  divMessages.appendChild(createDiv);

  let scrollPosicao = document.getElementById(`allMessages${data.message.user_id}`);

  scrollPosicao.scrollTop = scrollPosicao.scrollHeight;
});

document.getElementById("exit").addEventListener("click", function () {
  window.sessionStorage.removeItem("login");
  window.location.href="http://localhost:3333/pages/client";
});
