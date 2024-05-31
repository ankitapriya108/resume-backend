


import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";


const app = express();
const port = 8000;
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.urlencoded({ extended: true }));

const dbSchema = new mongoose.Schema({
  mydetails: [
    {
      image: {
        type: String,
      },
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      role: {
        type: String,
        required: true
      },
      totalExp: {
        type: Number,
        required: true
      },
    }
  ],
  aboutme: [
    {
      about: {
        type: String,
        required: true
      },
      aboutPoint: {
        type: Array,
        required: true
      },
    }
  ],
  skills: [
    {
      data: {
        type: Array
      }
    }
  ],
  work: [
    {
      workExperience: {
        type: Array
      }
    }
  ]
});

const dbModel = mongoose.model("information", dbSchema);

app.get("/", async (req, res) => {
  const data = await dbModel.find();
  res.send(data);
  console.log(data);
});

app.post("/send", async (req, res) => {
  const dataToSave = new dbModel(req.body);
  await dataToSave.save();
  res.send("Data saved");
  console.log(dataToSave);
});

const rgSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  createPassword: {
    type: String
  },
  confirmPassword: {
    type: String
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

const rgModel = mongoose.model("register", rgSchema);

app.get("/register", async (req, res) => {
  const user = await rgModel.find();
  res.send(user);
  console.log(user);
});

app.post("/datasave", async (req, res) => {
  const user = req.body;
  console.log(req.body);

  try {
    const userExist = await rgModel.findOne({ email: user.email });
    if (userExist) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashCreatePassword = await bcrypt.hash(user.createPassword, salt);
    user.createPassword = hashCreatePassword;

    const hashConfirmPassword = await bcrypt.hash(user.confirmPassword, salt);
    user.confirmPassword = hashConfirmPassword;

    const registerUser = new rgModel(user);
    await registerUser.save();
    res.status(200).json({ message: "Registration successful", registerUser });
    console.log(registerUser);
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await rgModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not registered" });
    }

    const passwordMatch = await bcrypt.compare(password, user.createPassword);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error(error);
  }
});

// app.get("/userData", async (req, res) => {
//   const { email } = req.query;
//   try {
//     const user = await rgModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.status(200).json({ user });
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });



app.get("/userData", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await rgModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resumeProfiles = await dbModel.find({ "mydetails.email": email });
    res.status(200).json({ user, resumeProfiles });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.delete("/delete/:id", async (req, res) => {
  try {
      const idToDelete = req.params.id;
      console.log("id", idToDelete);
      await dbModel.deleteOne({ _id: idToDelete });
      res.status(200).send("Successfully deleted");
  } catch (error) {
      console.error("error:", error);
      res.status(400).json({ message: error.message });
  }
});


// app.put("/update/:id", async (req, res) => {
//   const idToUpdate = req.params.id;
//   try {
//       const updatedData = req.body; 
//       const updatedItem = await dbModel.updateOne({ _id: idToUpdate }, updatedData);
//       // if (!updatedItem) {
//       //     return res.status(404).json({ error: "Item not found" });
//       // }
//       res.status(200).json({ message: "Item updated successfully", updatedItem });
//   } catch (error) {
//       console.error("Error updating item:", error);
//       res.status(500).json({ error: "Failed to update item" });
//   }
// });




// app.put("/edit/:id", async (req, res) => {
//   try {
//     const idToEdit = req.params.id;
//     const updateDetails = req.body; 
//     const update = await YourModel.updateOne({ _id: idToEdit }, updateDetails);

//     if (update.nModified === 0) {
//       return res.status(404).json({ message: "Profile not found or not updated" });
//     }

//     res.status(200).json({ message: "Profile updated successfully" });
//   } catch (error) {
//     console.error("error", error);
//     res.status(400).json({ message: error.message });
//   }
// });






// app.put("/edit/:id", async (req, res) => {
//   try {
//     const idToEdit = req.params.id;
//     console.log("id", idToEdit);
//     const updates = req.body; // assuming you're sending the updates in the request body
//     const response = await axios.put(`http://localhost:8000/userData/${idToEdit}`, updates);
//     res.send(response.data);
//   } catch (error) {
//     console.error("Error editing profile:", error);
//     res.status(500).send({ message: "Error editing profile" });
//   }
// });


// GET endpoint to fetch data by ID
app.get('/get/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Resume.findById(id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ message: 'Data not found' });
  }
});

// PUT endpoint to update data
app.put('/update/:id', async (req, res) => {
  try {
    const { id, updatedData } = req.body;
    const updatedResume = await Resume.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(updatedResume);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update data' });
  }
});

mongoose.connect("mongodb://127.0.0.1:27017/resume")
  .then(() => app.listen(port, () => {
    console.log("Server started");
  }))
  .catch((error) => {
    console.log(error);
  });









// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import bcrypt from "bcrypt";
// import multer from "multer";
// import path from "path";

// const app = express();
// const port = 8000;

// app.use(express.json());
// app.use(cors({
//   origin: "http://localhost:5173"
// }));
// app.use(express.urlencoded({ extended: true }));

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// // Make the uploads folder publicly accessible
// app.use('/uploads', express.static('uploads'));

// const dbSchema = new mongoose.Schema({
//   mydetails: [
//     {
//       image: {
//         type: String,
//       },
//       name: {
//         type: String,
//         required: true
//       },
//       email: {
//         type: String,
//         required: true
//       },
//       role: {
//         type: String,
//         required: true
//       },
//       totalExp: {
//         type: Number,
//         required: true
//       },
//     }
//   ],
//   aboutme: [
//     {
//       about: {
//         type: String,
//         required: true
//       },
//       aboutPoint: {
//         type: Array,
//         required: true
//       },
//     }
//   ],
//   skills: [
//     {
//       data: {
//         type: Array
//       }
//     }
//   ],
//   work: [
//     {
//       workExperience: {
//         type: Array
//       }
//     }
//   ]
// });

// const dbModel = mongoose.model("information", dbSchema);

// app.get("/", async (req, res) => {
//   const data = await dbModel.find();
//   res.send(data);
//   console.log(data);
// });

// app.post("/send", upload.single('image'), async (req, res) => {
//   const image = req.file ? req.file.path : null;
//   const mydetails = { ...req.body, image };
//   const dataToSave = new dbModel({ mydetails });
//   await dataToSave.save();
//   res.send("Data saved");
//   console.log(dataToSave);
// });

// const rgSchema = new mongoose.Schema({
//   name: {
//     type: String
//   },
//   email: {
//     type: String
//   },
//   createPassword: {
//     type: String
//   },
//   confirmPassword: {
//     type: String
//   },
//   lastLogin: {
//     type: Date,
//     default: null
//   }
// });

// const rgModel = mongoose.model("register", rgSchema);

// app.get("/register", async (req, res) => {
//   const user = await rgModel.find();
//   res.send(user);
//   console.log(user);
// });

// app.post("/datasave", async (req, res) => {
//   const user = req.body;
//   console.log(req.body);

//   try {
//     const userExist = await rgModel.findOne({ email: user.email });
//     if (userExist) {
//       return res.status(400).json({ message: 'Email already in use' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashCreatePassword = await bcrypt.hash(user.createPassword, salt);
//     user.createPassword = hashCreatePassword;

//     const hashConfirmPassword = await bcrypt.hash(user.confirmPassword, salt);
//     user.confirmPassword = hashConfirmPassword;

//     const registerUser = new rgModel(user);
//     await registerUser.save();
//     res.status(200).json({ message: "Registration successful", registerUser });
//     console.log(registerUser);
//   } catch (error) {
//     console.log(error);
//   }
// });

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await rgModel.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Email not registered" });
//     }

//     const passwordMatch = await bcrypt.compare(password, user.createPassword);
//     if (!passwordMatch) {
//       return res.status(401).json({ message: "Incorrect password" });
//     }
//     user.lastLogin = new Date();
//     await user.save();

//     res.status(200).json({ message: "Login successful", user });
//   } catch (error) {
//     console.error(error);
//   }
// });

// app.get("/userData", async (req, res) => {
//   const { email } = req.query;
//   try {
//     const user = await rgModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const resumeProfiles = await dbModel.find({ "mydetails.email": email });
//     res.status(200).json({ user, resumeProfiles });
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.delete("/delete/:id", async (req, res) => {
//   try {
//     const idToDelete = req.params.id;
//     console.log("id", idToDelete);
//     await dbModel.deleteOne({ _id: idToDelete });
//     res.status(200).send("Successfully deleted");
//   } catch (error) {
//     console.error("error:", error);
//     res.status(400).json({ message: error.message });
//   }
// });

// mongoose.connect("mongodb://127.0.0.1:27017/resume")
//   .then(() => app.listen(port, () => {
//     console.log("Server started");
//   }))
//   .catch((error) => {
//     console.log(error);
//   });
