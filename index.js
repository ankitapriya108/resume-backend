import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import "dotenv/config";


const app = express();
const port = 'https://resume-backend-7ze5.onrender.com';
const username = process.env.MONGO_USERNAME;
const password = encodeURIComponent(process.env.MONGO_PASSWORD);
app.use(express.json());
app.use(cors({
  origin: "*"
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



app.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    const updatedProfile = await dbModel.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

mongoose.connect(
  "mongodb+srv://"+ username+":"+password+"@cluster0.r2vrqr2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/resume"

).then(() => app.listen(port, () => {
    console.log("Server started");
  }))
  .catch((error) => {
    console.log(error);
  });






