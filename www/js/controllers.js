angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})


.controller('LoginCtrl', ['$scope', '$rootScope', '$ionicModal', '$ionicLoading', '$state','Users','$window', function($scope, $rootScope, $ionicModal, $ionicLoading, $state,Users,$window) {
    $rootScope.userName="";
    $rootScope.tabName="Room";
    $rootScope.uid;
    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.profileImageUrl=""
    $scope.createUser = function(user) {
        if (user && user.email && user.password && user.displayname) {
            $ionicLoading.show({
                template: 'Signing Up...'
            });
            auth.createUserWithEmailAndPassword(user.email, user.password).then(function(userData) {
                alert("User created successfully!");
                rootRef.child("users").child(userData.uid).set({
                    email: user.email,
                    displayName: user.displayname,
                    myProfileImage:profileImageUrl
                });
                $ionicLoading.hide();
                $scope.modal.hide();
            }, function(error) {
                alert("Error: " + error);
                $ionicLoading.hide();
            });
        } else
            alert("Please fill all details");
    }

  $scope.upload=function(element) {
      Users.uploadAndSend(element,false);
  }

    $scope.signIn = function(user) {
        if (user && user.email && user.pwdForLogin) {
            $ionicLoading.show({
                template: 'Signing In...'
            });
            auth.signInWithEmailAndPassword(user.email, user.pwdForLogin).then(function(authData) {
                rootRef.child("users").child(authData.uid).on('value', function(snapshot) {
                    // To Update AngularJS $scope either use $apply or $timeout
                    displayNames = snapshot.val().displayName;
                    $rootScope.userName=displayNames;
                    $window.localStorage['userName'] = displayNames;
                    $window.localStorage['uid'] = authData.uid;
                    $rootScope.uid = authData.uid;
                    Users.getAllUsers();
                });
                $ionicLoading.hide();
                $state.go('app.rooms');

            }, function(error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    }
}])

.controller('ChatCtrl', ['$rootScope', '$scope','Users', 'Chats', '$state', function($rootScope, $scope,Users, Chats, $state) {

    $scope.IM = {
        textMessage: ""
    };
    if($rootScope.userName.length>0)
    {
        displayNames=$rootScope.userName;
    }
    if (displayNames === "noname") {
      auth.signOut().then(function(data) {
        $state.go('login');
        // Sign-out successful.
      }, function(error) {
        // An error
      });
    }
    //Users.getAllUsers();
    Chats.selectRoom($state.params.roomId);

    var roomName = Chats.getSelectedRoomName();

    // Fetching Chat Records only if a Room is Selected
    $scope.sendMessage = function(msg) {
        if (displayNames === "noname") {
            auth.signOut().then(function(data) {
                $state.go('login');
                // Sign-out successful.
            }, function(error) {
                // An error
            });
        } else {
            Chats.send(displayNames, msg,'room');
            $scope.IM.textMessage = "";
        }

    }
    $scope.sendImage=function(element) {
          Users.uploadAndSend(element,true,'room');
    }

    $scope.remove = function(chat) {
        Chats.remove(chat);
    }
}])

.controller('RoomsCtrl', ['$scope', '$rootScope', '$state', 'Rooms', 'Chats','Users','$window', function($scope, $rootScope, $state, Rooms, Chats,Users,$window) {
    $rootScope.userName=$window.localStorage['userName'];

    $rootScope.tabIndex=1;
    $rootScope.datakuboss = [];
    $scope.get_promise_rooms = Rooms.all();
    $scope.get_promise_rooms.then(successGet);
    $rootScope.allUsers=[];
    $scope.get_promise_users = Users.all();
    $scope.get_promise_users.then(successUserGet);
    if($rootScope.uid)
    {
      $rootScope.uid = $window.localStorage['uid'];
    }
    function successGet(data) {
        for (var i = 0; i < data.val().length; i++) {
            $scope.$apply(function() {
                $rootScope.datakuboss.push({
                    id: data.val()[i].id,
                    name: data.val()[i].name,
                    icon: data.val()[i].icon
                });
            });

        }
        Users.getAllUsers();

    }
    function successUserGet(data) {

      for (var userkey in data.val()) {
        console.log(userkey);
        $scope.$apply(function() {
          $rootScope.allUsers.push({
            id: userkey,
            user:data.val()[userkey]

          });
        });
        console.log(data.val());
      }


    }

    $scope.openChatRoom = function(roomId) {
        $state.go('app.chat', {
            roomId: roomId
        });
    }
    $scope.openUserChatRoom = function (senderKey ,recipientKey) {
        $state.go('app.user_chat', {
          senderKey: senderKey,
          recipientKey:recipientKey
        });
    }
    $scope.switchTad=function(indexTab)
   {
       $rootScope.tabIndex=indexTab;
       switch (indexTab){
         case 1:
           $rootScope.tabName="Room";
           break;
         case 2:
           $rootScope.tabName="User";
           break;
         case 3:
           $rootScope.tabName="Setting";
           break;
       }
   }
}])

.controller('SignoutCtrl', function($scope, $ionicLoading, $state, $ionicPlatform, $ionicPopup) {
    $scope.logoutNow = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Logout',
            template: 'Are you sure you want to logout?'
        });

        confirmPopup.then(function(res) {
            if (res) {
                auth.signOut().then(function(data) {
                    $state.go('login');
                    // Sign-out successful.
                }, function(error) {});
            } else {}
        });
    }
})
  .controller('UserChatCtrl', ['$rootScope', '$scope','Users', 'Chats', '$state', function($rootScope, $scope,Users, Chats, $state) {

    $scope.IM = {
      textMessage: ""
    };
    if($rootScope.userName)
    {
      displayNames=$rootScope.userName;
    }
    if (displayNames === "noname") {
      auth.signOut().then(function(data) {
        $state.go('login');
        // Sign-out successful.
      }, function(error) {
        // An error
      });
    }
    //Users.getAllUsers();
    console.log($state.params);
    Chats.selectUserRoom($state.params.senderKey,$state.params.recipientKey);

    var roomName = "";

    // Fetching Chat Records only if a Room is Selected
    $scope.sendMessage = function(msg) {
      if (displayNames === "noname") {
        auth.signOut().then(function(data) {
          $state.go('login');
          // Sign-out successful.
        }, function(error) {
          // An error
        });
      } else {
        Chats.send(displayNames, msg,'user');
        $scope.IM.textMessage = "";
      }

    }
    $scope.sendImage=function(element) {
      Users.uploadAndSend(element,true,'user');
    }

    $scope.remove = function(chat) {
      Chats.remove(chat);
    }
  }])
;
