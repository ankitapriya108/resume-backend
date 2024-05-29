import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

const app = express();
const port = 8000;
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.urlencoded({ extended: true }));
const dbSchema = new mongoose.Schema({
  mydetails: [
    {
      image: {
        type: String,
      },
      name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
      totalExp: {
        type: Number,
        required: true,
      },
    },
  ],
  aboutme: [
    {
      about: {
        type: String,
        required: true,
      },
      aboutPoint: {
        type: Array,
        required: true,
      },
    },
  ],
  skills: [
    {
      data: {
        type: Array,
      },
    },
  ],
  work: [
    {
      workExperience: {
        type: Array,
      },
    },
  ],
});

const dbModel = mongoose.model("information", dbSchema);

app.get("/getdata", async (req, res) => {
  const data = await dbModel.find();
  res.send(data);
  console.log(data);
});

// app.post("/send",async(req,res)=>{
//     const dataTosave = new dbModel(req.body);
//     await dataTosave.save();
//     res.send("Data found");
//     console.log(dataTosave)
// });

//..............multer.................//
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./photos");
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
    },
  });
  
  const upload = multer({ storage });


app.post("/upload", upload.single("photo"), async (req, res) => {
    const image = req.file;
    
    if (!image) {
      return res.status(400).send({ message: "No file uploaded" });
    }
    res.status(200).send({ message: "File uploaded successfully", file: image });
  });



// app.post("/send", upload.single("image"), async (req, res) => {
//     const { mydetails, aboutme, skills, work } = req.body;
//     try {
//         const dataTosave = new dbModel({mydetails, aboutme, skills, work });
//         await dataTosave.save();
//         res.send("Data saved successfully");
//         console.log(dataTosave);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error saving data");
//     }
// });

app.post("/send", upload.single("image"), async (req, res) => {
    const { name, role, totalExp, about, aboutPoint, data, workExperience } = req.body;
    const image = req.file ? req.file.filename : null;
  
    console.log("Uploaded Image:", req.file); 

    try {
      const dataToSave = new dbModel({
        mydetails: [{ image, name, role, totalExp }],
        aboutme: [{ about, aboutPoint }],
        skills: [{ data }],
        work: [{ workExperience }],
      });
      await dataToSave.save();
      res.status(200).json({ message: "Data saved successfully", data: dataToSave });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error saving data" });
    }
  });
  

const rgSchema = new mongoose.Schema({
  image: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  createPassword: {
    type: String,
  },
  confirmPassword: {
    type: String,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
});

const rgModel = mongoose.model("registeration", rgSchema);

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
      return res.status(400).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashcreatePassword = await bcrypt.hash(user.createPassword, salt);
    user.createPassword = hashcreatePassword;

    const hashconfirmPassword = await bcrypt.hash(user.confirmPassword, salt);
    user.confirmPassword = hashconfirmPassword;

    const registerUser = new rgModel(user);
    await registerUser.save();
    res
      .status(200)
      .json({ message: "registeration successfull", registerUser });
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

mongoose
  .connect("mongodb://127.0.0.1:27017/resumebuilder")
  .then((response) =>
    app.listen(port, () => {
      console.log("server start");
    })
  )
  .catch((error) => {
    console.log(error);
  });
