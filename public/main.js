(function () {

    let user = {},
        $loginPage = $('.login-page'),
        $chatPage = $('.chat'),
        $loginBtn = $('.loginBtn'),
        $usernameInput = $('#username'),
        $nameInput = $('#name');


    var socket = io();

    const setUsername = () => {
        user = {
            username: cleanInput($usernameInput.val().trim()),
            name: cleanInput($nameInput.val().trim()),

        };


        if (user.username) {


            socket.emit('newUser', user);
            console.log(user)
        }
    };


    socket.on('login', () => {
        $loginPage.fadeOut();
        $chatPage.show();
        $loginPage.off('click');
        socket.emit('receiveHistory');
        socket.emit('receiveUsers');
    });

    socket.on('message', addMessage);
    socket.on('global', global);
    socket.on('userIsTyping', userIsTyping);


    $loginBtn.click(function () {

        setUsername()


    });


    function userIsTyping(message) {

        let statusarea = document.getElementById('status');

        message.username = encodeHTML(message.username);
        status = encodeHTML(message.status);

        if (status == 'typing') {


            statusarea.innerHTML = message.username + " is " + message.status


        } else {
            statusarea.innerHTML = '';

        }


    }

    function global(message) {

        message.username = encodeHTML(message.username);


        var html = `
            <li>
               
                <div class="message my-message" dir="auto">${message.username} Joined</div>
            </li>`;

        $(html).hide().appendTo('.chat-history ul').slideDown(200);

        $(".chat-history").animate({scrollTop: $('.chat-history')[0].scrollHeight}, 1000);
    }

    function addMessage(message) {
        message.date = (new Date(message.date)).toLocaleString();
        message.username = encodeHTML(message.username);
        message.content = encodeHTML(message.content);
        myname = encodeHTML(user.username);
        console.log(myname);


        let li = createNode("li"),
            message_data = createNode("div"),
            message_data_name = createNode("span"),
            message_data_time = createNode("span"),
            message_data_content = createNode("div");

        li.setAttribute("class", "");
        message_data.setAttribute("class", "message-data");
        message_data_name.setAttribute("class", "message-data-name");
        message_data_time.setAttribute("class", "message_data_time");
        message_data_content.setAttribute("class", "message my-message");
        if (message.content.includes('@' + myname)) {
            li.setAttribute("class", "tome");
        }
        message_data_name.innerHTML = message.username;
        message_data_time.innerHTML = message.date;
        message_data_content.innerHTML = message.content;

        append(message_data, message_data_name);
        append(message_data, message_data_time);
        append(li, message_data);
        append(li, message_data_content);


        $(li).hide().appendTo('.chat-history ul').slideDown(200);

        $(".chat-history").animate({scrollTop: $('.chat-history')[0].scrollHeight}, 500);


    }


    $('.chat-message button').on('click', e => {
        e.preventDefault();

        let selector = $("textarea[name='message']");
        let messageContent = selector.val().trim();
        console.log(messageContent);
        if (messageContent !== '') {
            socket.emit('msg', messageContent, user);
            selector.val('');
        }
    });
    $('#typing').keydown(function (e) {

        if (e.which != 13 && e.keyCode != 13) {
            onKeyDownNotEnter()
        }
    });


    socket.on('history', messages => {
        for (let message of messages) {
            addMessage(message);
        }
    });

    socket.on('users', users => {
        console.log(users);
        users.forEach(function (user) {
            addUser(user);
        })

    });
    socket.on('addUser', user => {

        singlUser(user)

    });

    function addUser(user) {

        user.username = encodeHTML(user.username);


        var html = `
            <li>
                <div class="user">
                    <span class="name">${user.username}</span>
              
                </div>
                
            </li>`;

        $(html).hide().appendTo('.chat-users ul').slideDown(200);

        $(".chat-users").animate({scrollTop: $('.chat-users')[0].scrollHeight}, 1000);
    }

    function singlUser(user) {

        user.username = encodeHTML(user.username);


        var html = `
            <li>
                <div class="user">
                    <span class="name">${user.username}</span>
              
                </div>
                
            </li>`;

        $(html).hide().appendTo('.chat-users ul').slideDown(200);

        $(".chat-users").animate({scrollTop: $('.chat-users')[0].scrollHeight}, 1000);
    }


    var typing = false;
    var timeout = undefined;

    function timeoutFunction() {
        typing = false;
        socket.emit('noLongerTypingMessage');
    }

    function onKeyDownNotEnter() {
        if (typing == false) {
            typing = true;
            socket.emit('typingMessage');

            timeout = setTimeout(timeoutFunction, 5000);
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(timeoutFunction, 5000);
        }

    }


    function createNode(element) {
        return document.createElement(element);
    }

    function append(parent, el) {
        return parent.appendChild(el);
    }


    function encodeHTML(str) {
        return $('<div />').text(str).html();
    }

    const cleanInput = (input) => {
        return $('<div/>').text(input).html();
    }

})();


