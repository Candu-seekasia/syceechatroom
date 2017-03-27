angular.module('starter.services', [])

.factory("Auth", ["$rootScope",
    function($rootScope) {
        return auth;
    }
])

.factory('Chats', ['$rootScope', 'Rooms', '$ionicPopup', function($rootScope, Rooms, $ionicPopup) {

    var selectedRoomId;
    var selectUserRoomKeyId;
    var ref = mainApp;
    var chats;
    var userChats;
    $rootScope.chatsGetRoom = [];
    $rootScope.userChatsMessage=[];
    $rootScope.userPorfiles={};
    // use for multiple apply
    $rootScope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };



    return {
        all: function() {
            return chats;
        },
        remove: function(chat) {
            if (displayNames == chat.from) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Delete Message',
                    template: 'Are you sure you want to delete this message?'
                });

                confirmPopup.then(function(res) {
                    if (res) {
                        chats.child(chat.genKey).remove(function(success) {});
                    } else {}
                });
            } else if (displayNames == 'noname') {
                alert('Please login first!!!');
            } else {
                alert('This is not the your message');
            }

        },
        get: function(chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].id === parseInt(chatId)) {
                    return chats[i];
                }
            }
            return null;
        },
        getSelectedRoomName: function() {
            var selectedRoom;
            $rootScope.roomSelected = '';
            if (selectedRoomId && selectedRoomId != null) {
                selectedRoom = Rooms.get(selectedRoomId);
                if (selectedRoom)
                    selectedRoom.then(function(data) {
                        $rootScope.safeApply(function() {
                            $rootScope.roomSelected = data.val().name;
                        });
                    });
                else
                    return null;
            } else
                return null;
        },
        selectRoom: function(roomId) {
            selectedRoomId = roomId;
            if (!isNaN(roomId)) {
                chats = rootRef.child('rooms').child(selectedRoomId).child('chats');
                rootRef.child('rooms').child(selectedRoomId).child('chats').on('value', function(data) {
                    if (data.val() === null) {
                        $rootScope.safeApply(function() {
                            $rootScope.chatsGetRoom = [];
                        });
                    } else {
                        $rootScope.chatsGetRoom = [];
                        data.forEach(function(dataChild) {
                          //Rooms.getUserProfile(dataChild.val().from);
                          console.log("come from:"+$rootScope.userPorfiles[dataChild.val().from]);
                            $rootScope.safeApply(function() {
                                $rootScope.chatsGetRoom.push({
                                    genKey: dataChild.val().genKey,
                                    from: dataChild.val().from,
                                    message: dataChild.val().message,
                                    createdAt: dataChild.val().createdAt,
                                    myProfileImage:$rootScope.userPorfiles[dataChild.val().from],
                                    photo:dataChild.val().photo
                                })
                            })
                        });
                    }
                });
            }
        },
        selectUserRoom:function (senderKey ,recipientKey) {

          selectUserRoomKeyId = senderKey+"_"+recipientKey;
          var diffSenderAndRecipient = recipientKey+"_"+senderKey;
          console.log(selectUserRoomKeyId);
          if (senderKey!=''&&recipientKey!='') {

            rootRef.child('one-one').once('value', function(snap) {
              if (!snap.child(selectUserRoomKeyId).exists()) {
                  selectUserRoomKeyId=diffSenderAndRecipient;
              }
              userChats = rootRef.child('one-one').child(selectUserRoomKeyId).child('chats');
              rootRef.child('one-one').child(selectUserRoomKeyId).child('chats').on('value',function (data) {
                if (data.val() === null) {
                  $rootScope.safeApply(function() {
                    $rootScope.userChatsMessage = [];
                  });
                } else {
                  $rootScope.userChatsMessage = [];
                  data.forEach(function(dataChild) {
                    //Rooms.getUserProfile(dataChild.val().from);
                    console.log("come from:"+$rootScope.userPorfiles[dataChild.val().from]);
                    $rootScope.safeApply(function() {
                      $rootScope.userChatsMessage.push({
                        genKey: dataChild.val().genKey,
                        from: dataChild.val().from,
                        message: dataChild.val().message,
                        createdAt: dataChild.val().createdAt,
                        myProfileImage:$rootScope.userPorfiles[dataChild.val().from],
                        photo:dataChild.val().photo
                      })
                    })
                  });
                }
              })
            });


          }
        },

        send: function(from, message,type) {
            if (from && message) {
                if(type==='room')
                {
                  console.log(chats);
                    var genKey = chats.push().key;
                    rootRef.child('rooms').child(selectedRoomId).child('chats/' + genKey).set({
                      genKey: genKey,
                      from: from,
                      message: message,
                      createdAt: firebase.database.ServerValue.TIMESTAMP

                    });
                }
                else if(type==='user')
                {
                  console.log(userChats);
                    var genKey = userChats.push().key;
                    rootRef.child('one-one').child(selectUserRoomKeyId).child('chats/' + genKey).set({
                        genKey: genKey,
                        from: from,
                        message: message,
                        createdAt: firebase.database.ServerValue.TIMESTAMP

                    });
                }

            }
        },
        sendImage: function(from, imageUrl,type) {
          if (from && imageUrl) {
            if(type==='room') {
                var genKey = chats.push().key;
                rootRef.child('rooms').child(selectedRoomId).child('chats/' + genKey).set({
                  genKey: genKey,
                  from: from,
                  photo: imageUrl,
                  createdAt: firebase.database.ServerValue.TIMESTAMP

                });
            }
            else if(type==='user'){
                var genKey = userChats.push().key;
                rootRef.child('one-one').child(selectUserRoomKeyId).child('chats/' + genKey).set({
                  genKey: genKey,
                  from: from,
                  photo: imageUrl,
                  createdAt: firebase.database.ServerValue.TIMESTAMP

                });
            }

          }
        }
    }
}])

/**
 * Simple Service which returns Rooms collection as Array from Salesforce & binds to the Scope in Controller
 */
.factory('Rooms', function($rootScope) {
/*
    //Created data Rooms
    var dataRooms = [{
        id: 1,
        icon: 'ion-university',
        name: 'Academics'
    },{
        id: 2,
        icon: 'ion-camera',
        name: 'Photography'
    },{
        id: 3,
        icon: 'ion-music-note',
        name: 'Music'
    },{
        id: 4,
        icon: 'ion-woman',
        name: 'Fashion'
    },{
        id: 5,
        icon: 'ion-plane',
        name: 'Travel'
    }];
    for (var i = 0; i < dataRooms.length; i++) {
        var newPostKey = rootRef.child('rooms').push().key;
        rootRef.child('rooms/' + dataRooms[i].id).set({
            id: dataRooms[i].id,
            codeId: newPostKey,
            icon: dataRooms[i].icon,
            name: dataRooms[i].name
        }).then(function(data){
            //console.log(data);
        },function(err){
            //console.log(err);
        });
    }
    //End Created Data rooms
*/
    var allRoom = rootRef.child("rooms").once('value');

    return {
        all: function() {
            // get all room
            return allRoom;
        },
        get: function(roomId) {
            // Simple index lookup
            return rootRef.child("rooms/" + roomId).once('value');
        },


    }
})
  .factory('Users',  ['$rootScope','Chats', function($rootScope,Chats) {
    //$rootScope.allUsers = {};
    return{
      all:function () {
        return  rootRef.child('users').once('value');
      },
      getAllUsers:function () {

        rootRef.child('users').once('value', function (snap) {
          for (var userkey in snap.val()) {                //console.log(snap1.val()[p].myProfileImage);
            $rootScope.userPorfiles[snap.val()[userkey].displayName] = snap.val()[userkey].myProfileImage == null ? profileDefaultImageUrl : snap.val()[userkey].myProfileImage;
            //$rootScope.allUsers[userkey]=snap.val()[userkey];

          }
          console.log($rootScope.userPorfiles)
          //console.log($rootScope.allUsers)
          return $rootScope.userPorfiles;
        })
        return $rootScope.userPorfiles;
      },
      getUserProfile:function (displayName) {
          if ($rootScope.userPorfiles[displayName] != null) {
            //console.log( displayName)
              return;
          }
          rootRef.child('users').orderByChild('displayName').equalTo(displayName).once('value', function (snap1) {
            var profileDefaultImageUrl = "https://firebasestorage.googleapis.com/v0/b/testdb-45e50.appspot.com/o/ionic.png?alt=media";
            for (var userkey in snap1.val()) {                //console.log(snap1.val()[p].myProfileImage);
              $rootScope.userPorfiles[displayName] = snap1.val()[userkey].myProfileImage == null ? profileDefaultImageUrl : snap1.val()[userkey].myProfileImage;
            }
            console.log($rootScope.userPorfiles)

          })
      },
      uploadAndSend:function (element,isSend,type) {
          //var deferred = $q.defer();
          console.log(element.files[0]);
          var fileName=element.files[0].name;
          console.log(fileName);
          var fileRef = storageRef.child(fileName);
          var uploadTask = fileRef.put(element.files[0]);

          uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            function(snapshot) {
              var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');
              switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED:
                  console.log('Upload is paused');
                  break;
                case firebase.storage.TaskState.RUNNING:
                  console.log('Upload is running');
                  break;
              }
            },
            function(error) {
              switch (error.code) {
                case 'storage/unauthorized':
                  console.log('User does not have permission to access the object.');
                  break;
                case 'storage/canceled':
                  console.log('User canceled the upload.');
                  break;
                case 'storage/unknown':
                  console.log(' Unknown error occurred, Please try later.');
                  break;
              }
            }, function() {
              profileImageUrl=uploadTask.snapshot.downloadURL;
              console.log(uploadTask.snapshot.downloadURL);
              if(isSend)
              {
                Chats.sendImage(displayNames,profileImageUrl,type);
              }
            });

           return element.files[0].name;
      },
    }
  }])
;
