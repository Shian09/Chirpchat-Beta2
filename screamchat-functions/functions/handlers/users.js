const { admin, db } = require("../util/admin");
const config = require("../util/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails,
} = require("../util/validators");

/******************SignUp**********************/
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) return res.status(400).json(errors);

  const noImg = "no-img.png";

  //Validate data
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "This handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        userId,
        messages: [{ notificationId: "", number: 0 }],
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "E-mail is already in use" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong. Please try again" });
      }
    });
};

/****************Login*****************/
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-email" ||
        err.code === "auth/user-not-found"
      ) {
        return res
          .status(403)
          .json({ general: "Wrong credentials, please try again" });
      } else return res.status(500).json({ error: err.code });
    });
};

/*****************Add more user details************/
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res.json({ message: "Details added succefully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

/******************Get any user's details*************************/
exports.getUserDetails = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.params.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection("screams")
          .where("userHandle", "==", req.params.handle)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status.json({ error: "User not found" });
      }
    })
    .then((data) => {
      userData.screams = [];
      data.forEach((doc) => {
        userData.screams.push({
          body: doc.data().body,
          type: doc.data().type,
          commentCount: doc.data().commentCount,
          createdAt: doc.data().createdAt,
          likeCount: doc.data().likeCount,
          userHandle: doc.data().userHandle,
          userImage: doc.data().userImage,
          screamId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

/*********Get all users registered***********/
exports.getAllUsers = (req, res) => {
  let users = [];
  let searchUsers = [];
  db.collection("/users")
    .get()
    .then((result) => {
      if (result.docs.length > 0) {
        users = [...result.docs];
        users.forEach((item, index) => {
          searchUsers.push({
            key: index,
            documentKey: item.id,
            id: item.data().userId,
            name: item.data().handle,
            messages: item.data().messages,
            URL: item.data().imageUrl,
            description: item.data().bio,
          });
        });
      } else {
        return res.status(204).json({ users: "No user found" });
      }
      return res.status(200).json(searchUsers);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

/**************Get own user details********************/
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection("likes")
          .where("userHandle", "==", req.user.handle)
          .get();
      } else {
        return res.status.json({ error: "User not found" });
      }
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });
      return db
        .collection("notifications")
        .where("recipient", "==", req.user.handle)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
    })
    .then((data) => {
      userData.notifications = [];
      data.forEach((doc) => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          createdAt: doc.data().createdAt,
          screamId: doc.data().screamId,
          type: doc.data().type,
          read: doc.data().read,
          notificationId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

/***********************Get my messages notification*******************/
exports.getNotificationOnMessage = (req, res) => {
  const currentUserMessages = [];
  db.doc(`/users/${req.params.handle}`)
    .get()
    .then((doc) => {
      doc.data().messages.forEach((item) => {
        currentUserMessages.push(item);
      });
      return res.status(200).json(currentUserMessages);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

/**********Update notificationId, number inside authenticated user's messages */
exports.updateMessageAfterNotificationErase = (req, res) => {
  const notificationMessagesErase = req.body;
  db.doc(`/users/${req.params.handle}`)
    .update({
      messages: notificationMessagesErase,
    })
    .then(() => {
      res.status(200).json({ Notification: "Notification has been erased" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

/*****************Upload a Profile Image*******************/
exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }
    //filename: my.image.png
    const splitt = filename.split("."); //[my, image, png]
    const imageExtension = splitt[filename.split(".").length - 1]; //png

    imageFileName = `${Math.round(
      Math.random() * 100000000000
    )}.${imageExtension}`; //imageFileName: 42858257.png

    const filepath = path.join(os.tmpdir(), imageFileName); //pushing 42858257.png to AppData\\Local\\Temp\\
    imageToBeUploaded = { filepath, mimetype }; //mimetype: image/png
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: "Image uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });
  busboy.end(req.rawBody);
};

/*******************Marking notifications read*********************/
exports.markNotificationsRead = (req, res) => {
  let batch = db.batch();
  //req.body will be an array of notificationId
  req.body.forEach((notificationId) => {
    const notification = db.doc(`/notifications/${notificationId}`);
    batch.update(notification, { read: true });
  });
  batch
    .commit()
    .then(() => {
      return res.json({ message: "Notifications marked read" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

/*********************Setting up messages********************************/
exports.setMessages = (req, res) => {
  const groupChatId = req.params.groupChatId;
  const itemMessage = req.body;

  db.collection("messages")
    .doc(groupChatId)
    .collection(groupChatId)
    .doc(itemMessage.timestamp)
    .set(itemMessage)
    .then(() => {
      return res.status(201).json(itemMessage);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
