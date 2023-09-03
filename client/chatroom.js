const socket = io('http://localhost:3000');

/*chatroompage*/
const typecontainform = document.getElementById('typecontainform');
const typeBox = document.getElementById('typeBox');
const messagecontainer = document.getElementById('messagecontainer');

/*logout*/
const LogoutButton = document.getElementById('LogoutButton');
LogoutButton.addEventListener('click', (e) => {
    window.location.href = '../Frontend/login.html';
});

/*received broadcast data*/
socket.on("broadCast", permessage => {
    console.log(permessage.text);
    console.log(permessage.name);
    console.log(permessage.time);

    // Create the message HTML using the data from permessage
    let messageHTML = `
    <div class="messageBlock" style="border:3px;">        
        <div class="messageMeta">
            <div class="Name"><b>${permessage.name}</b></div>
            <div class="timestemp">${permessage.text}</div>
        </div>
        <div class="messageText">
            <p>${permessage.time}</p>
        </div>
    </div>`;

    // Add the new message to the existing messages
    messagecontainer.innerHTML += messageHTML;
});




/*send message to server*/
typecontainform.addEventListener('submit', (e) => {
    e.preventDefault();
    const permessage = { "text": "",
                        "name": "",
                        "time": new Date().toLocaleTimeString()
                        };
    permessage.text = typeBox.value;
    //this line may have issue
    permessage.name = sessionStorage.getItem('username'); /*之後這邊要吃login page的form*/
    permessage.time = new Date().toLocaleTimeString();

    socket.emit('chatMessageFromClient', permessage);
    typeBox.value = '';
});



/*render messages in client*/
function appendMessage(data) {
    
    return  `
    <div class="messageBlock" style="border:3px;">
            
        <div class="messageMeta">
            <div class="Name"><b>${data.sender}</b></div>
            <div class="timestemp">${data.message}</div>

        </div>
        
        <div class="messageText">
            <p>${data.timestamp}</p>
        </div>
    
    </div>`
}

// Define a separate function to render the messages
function renderMessages() {
    messagecontainer.innerHTML = messages.map(appendMessage).join('');
}


let messages = [];
// Client-side
socket.on('chatroomFromServer', (data) => {

    for (let permessage of data) {

    messages.push(   
         {
        
            sender: permessage.sender,
            message: permessage.message,
            timestamp: permessage.timestamp
        
        } );
}
    renderMessages();
}
);