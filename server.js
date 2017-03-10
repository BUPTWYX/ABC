var express = require('express'), //引入express模块
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),//引入socket.io模块并绑定到服务器
    users=[];//保存所有在线用户的昵称 

app.use('/', express.static(__dirname + '/views')); //指定静态HTML文件的位置

server.listen(3000);
console.log('server started at port 3000...');

//socket部分
 io.on('connection', function(socket) {
    
    // //接收并处理客户端发送的foo事件
    // socket.on('foo', function(data) {
    //     //将消息输出到控制台
    //     console.log(data);
    // });

    //用户登录的事件
     socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');//给自己发送nick Existed事件
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
        };
    });

    //断开连接的事件
     socket.on('disconnect', function() {    
        users.splice(socket.userIndex, 1);//将断开连接的用户从users中删除    
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');//通知除自己以外的所有人
    });

    //接收新消息
     socket.on('postMsg', function(msg) {
        //将消息发送到除自己外的所有用户
         socket.broadcast.emit('newMsg', socket.nickname, msg);
    });

    //接收用户发来的图片
     socket.on('img', function(imgData) {
        //通过一个newImg事件分发到除自己外的每个用户
         socket.broadcast.emit('newImg', socket.nickname, imgData);
    });


});

