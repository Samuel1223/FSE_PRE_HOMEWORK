const socket = io('http://localhost:3000');

/*loginpage*/
const logincontainer = document.getElementById('logincontainer');
const loginbutton = document.getElementById('loginbutton');
const registerbutton = document.getElementById('registerbutton');

const Username = document.getElementById('Username');
const Password = document.getElementById('Password');




loginbutton.addEventListener('click', () => {
    const loginInfo = {
        username: Username.value,
        password: Password.value,
    };
    //test line
    console.log("click");
    
    //sessionstorage
    sessionStorage.setItem('username', loginInfo.username);

    socket.emit('loginInfoFromClient', loginInfo);


})

registerbutton.addEventListener('click',() => {
    const registerInfo = {
        username: Username.value,
        password: Password.value,
    };
    socket.emit('registerInfoFromClient', registerInfo); 

});


    
// Upon successful registration
socket.on('loginInfoFromServer', (response) => {
    console.log(response);

    if (response.success) {
        // Redirect to the chatting room page
        window.location.href = '../Frontend/chatRoom.html';
    } else {
        console.log(response.message);
    }
});


socket.on('connect', () => {
    console.log('Connected to the server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});
