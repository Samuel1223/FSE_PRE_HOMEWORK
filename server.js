const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const mongoose = require('mongoose');
const { consumers } = require('stream');
const { Console } = require('console');



//connect to DB
const uri = "mongodb+srv://samueltoyu:Ms19970825@cluster0.tk1xr8s.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
console.log('Connected to the database');
  });



//define for login schema
const loginSchema = new mongoose.Schema({
    username: String,
    password: String,
  });
  
const loginData = mongoose.model('loginData', loginSchema);

//print out all login data
/*loginData.find({})
    .then(data => {
        console.log('All loginData:', data);
    })
    .catch(err => {
        console.error('Error retrieving data:', err);
    });
*/

//define for chatroom schema
const chatSchema = new mongoose.Schema({
    sender: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
  });
  
const ChatMessage = mongoose.model('ChatMessage', chatSchema);




//retrieve all messages, and test it in console

ChatMessage.find({}).exec()
    .then(messages => {
        console.log('Retrieved messages:', messages);
    })
    .catch(error => {
        console.error('Error retrieving messages:', error);
    });




//create server, and use socketIo
const app = express()
const server = http.createServer(app)

const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})


io.on('connection', (socket) => {


    //register function
    socket.on('registerInfoFromClient', async (registerinfo) => {
                // Create a new chat message instance
                const newLogin = new loginData({
                    username: registerinfo.username,
                    password: registerinfo.password,
                });

                try {
                    // Use async/await to save the message to the database
                    const savedLogin = await newLogin.save(); 
                    console.log('User registered:', savedLogin);
                } catch (error) {
                    console.error('Error saving message:', error);
                }     
            console.log(registerinfo.username)
            console.log(registerinfo.password)
            });


    //login function
    const userMap = new Map();
    socket.on('loginInfoFromClient', async(loginInfo) => {
        try {


            let user = await loginData.findOne({ username: loginInfo.username, password: loginInfo.password });
            if (user) {
                // User found
                io.emit('loginInfoFromServer', { success: true, message: 'Login successful', username: loginInfo.username  });
                console.log('user successful');
                
                //emit chatroom data to client
                let chatroom = await ChatMessage.find({}).exec();
                console.log("****************")
                console.log(chatroom)
                console.log("****************")
                console.log("****************")
                console.log("****************")
                console.log("****************")
                console.log(loginInfo.username)

                console.log("****************")
                console.log("****************")
                console.log("****************")


                io.emit('chatroomFromServer', chatroom);
                console.log('chatroom successful');



            } else {
                // User not found
                io.emit('loginInfoFromServer', { success: false, message: 'Login failed' });
                console.log('Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            // Emit error message back to client
            socket.emit('loginInfoFromServer', { success: false, message: 'An error occurred' });
        }
    });
    
    


    //chatting function
    socket.on('chatMessageFromClient', async (permessage) => {
        console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")
        console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")
        console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")
        console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")
        console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")
        console.log(permessage.text)

        //store chat message in database
        const newMessage = new ChatMessage({
            sender: permessage.name,
            message: permessage.text,
        });
    
        try {
            // Use async/await to save the message to the database
            const savedMessage = await newMessage.save();
            console.log('Message saved:', savedMessage);
        } catch (error) {
            console.error('Error saving message:', error);
        }
 



        io.emit("broadCast", permessage)
    })

    socket.on('disconnect', () => {
        userMap.delete(socket.id);
    });
              
        
}
)




server.listen(3000, () => {
    console.log('listening on port 3000')
})


//clean db
async function clearChatMessages() {
    try {
        // Clear all chat messages from the database
        await ChatMessage.deleteMany({});
        console.log('All chat messages cleared');
    } catch (error) {
        console.error('Error clearing chat messages:', error);
    }
}


//clearChatMessages()
          
