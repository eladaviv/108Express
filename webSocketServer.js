const { WebSocketServer, WebSocket } = require('ws');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

const clients = {};
let loggedInClients = 0;

const webSocketServer = () => {
    const server = http.createServer();
    const wsServer = new WebSocketServer({ server });

    wsServer.on('connection', (connection) => {
        console.log('New Client connected');
        const clientId = uuidv4();
        clients[clientId] = { connection, clientId };

        connection.on('close', () => {
            if (clients[clientId]) {
                loggedInClients--;
                delete clients[clientId];
                console.log('Client Disconnected!');
                broadcastUserCount();
            }
        });

        connection.on('message', async (data, isBinary) => {
            console.log('Message Incoming');
            const message = isBinary ? data : data.toString();
            try {
                const messageJSON = JSON.parse(message);
                if (messageJSON.type === 'SIGN_IN') {
                    notifySignIn(clientId, messageJSON);
                }
                if (messageJSON.type === 'SIGN_OUT') {
                    notifySignOut(clientId);
                }
                if (messageJSON.type === 'ADMIN_READY') {
                    connectToAdmin(clientId);
                }
            } catch (ex) {
                console.error(ex);
            }
        });
    });

    server.listen(2309, () => {
        console.log('WebSocket server is up!');
    });
};

const broadcastUserCount = async () => {
    const currentLoggedInUsers = Object.values(clients).map((client) => {
        const { user } = client;
        if (!user) {
            return;
        }
        const { email, role, name } = user;
        return {
            email,
            name,
            role
        };
    });

    for (let client of Object.values(clients)) {
        console.log("client = ", client.user);
        if (client.user) {
            try {
                const user = client.user;
                if (client.isLoggedIn && user.role === 1 && client.connection.readyState === WebSocket.OPEN) {
                    console.log(`Notifying ${user.email} About Current User Count`);
                    client.connection.send(
                        JSON.stringify({
                            currentLoggedInUsers
                        })
                    );
                }
            } catch (ex) {
                if (ex.errorInfo && ex.errorInfo.code === 'auth/id-token-expired') {
                    console.log('Sending refresh token request');
                    client.connection.send(JSON.stringify({ type: 'REFRESH_TOKEN' }));
                    client.connection.terminate();
                    delete clients[client.clientId];
                }
                console.error(ex);
            }
        }
    }
};

const notifySignOut = (clientId) => {
    console.log("clientId signOut");
    clients[clientId].connection.terminate();
};

const notifySignIn = (clientId, messageJSON) => {
    clients[clientId] = {
        ...clients[clientId],
        ...{ isLoggedIn: true, user: messageJSON.user }
    };
    loggedInClients++;
    broadcastUserCount();
};

const connectToAdmin = async (clientId) => {
    broadcastUserCount();
};

webSocketServer();