window.onload = function() {
    //实例并初始化我们的hichat程序
    var hichat = new HiChat();
    hichat.init();
};

//定义我们的hichat类
 var HiChat = function() {
    this.socket = null;
};

//向原型添加业务方法
 HiChat.prototype = {
    init: function() {//此方法初始化程序
        var that = this;
        //建立到服务器的socket连接
         this.socket = io.connect();
        
        //监听socket的connect事件，此事件表示连接已经建立
         this.socket.on('connect', function() {
            //连接到服务器后，显示昵称输入框
             document.getElementById('info').textContent = 'get yourself a nickname :)';
             document.getElementById('nickWrapper').style.display = 'block';
             document.getElementById('nicknameInput').focus();
        });
        
        //如果昵称已经存在
         this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '!nickname is taken, choose another pls'; //显示昵称被占用的提示
        });

        //如果昵称不存在
         this.socket.on('loginSuccess', function() {
            document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
            document.getElementById('messageInput').focus();//让消息输入框获得焦点
        });

        //监听socket的system事件
         this.socket.on('system', function(nickName, userCount, type) {
            //判断用户是连接还是离开以显示不同的信息
             var msg = nickName + (type == 'login' ? ' joined' : ' left');
             that._displayNewMsg('system ',msg,'red');

            //将在线人数显示到页面顶部
             document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });
        
        //昵称设置的确定按钮
         document.getElementById('loginBtn').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            //检查昵称输入框是否为空
             if (nickName.trim().length != 0) {
                //不为空，则发起一个login事件并将输入的昵称发送到服务器
                 that.socket.emit('login', nickName);
            } else {
                //否则输入框获得焦点
                 document.getElementById('nicknameInput').focus();
            };
        }, false);

        //发送消息send按钮
         document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput'),
            msg = messageInput.value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg); //把消息发送到服务器
                that._displayNewMsg('me', msg); //把自己的消息显示到自己的窗口中
            };
        }, false);

        //监听新消息
         this.socket.on('newMsg', function(user, msg) {
            that._displayNewMsg(user, msg);
        });

        //发送图片的image按钮
          document.getElementById('sendImage').addEventListener('change', function() {
            //检查是否有文件被选中
             if (this.files.length != 0) {
                //获取文件并用FileReader进行读取
                 var file = this.files[0],
                 reader = new FileReader();
                 if (!reader) {
                    that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                 };
                reader.onload = function(e) {
                    //读取成功，显示到页面并发送到服务器
                     this.value = '';
                     that.socket.emit('img', e.target.result);
                     that._displayImage('me', e.target.result);
                };
            reader.readAsDataURL(file);
            };
         }, false);       

        //监听新图片
         this.socket.on('newImg', function(user, img) {
         that._displayImage(user, img);
        }); 
        


    
    },

    //聊天框中显示新消息
    _displayNewMsg: function(user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);

        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },

    //聊天框中显示新图片
     _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
            
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },


};

