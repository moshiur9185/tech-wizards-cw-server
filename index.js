const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

//module package
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
const ObjectID = require("mongodb").ObjectID;
const MongoClient = require('mongodb').MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vakyo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const port = 5050;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("computerService").collection("services");
  const bookingCollection = client.db("computerService").collection("booking");
  const bookListCollection = client.db("computerService").collection("bookingList");
  const reviewCollection = client.db("computerService").collection("review");
  const adminCollection = client.db("computerService").collection("admin");
  const blogsCollection = client.db("computerService").collection("blogs");
  
  //service post
  app.post("/addService", (req, res) => {
      const file = req.files.file;
      const name = req.body.name;
      const price = req.body.price;
      const description = req.body.description;
      const newImg = file.data;
    const encImg = newImg.toString("base64");

    let image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    serviceCollection.insertOne({ name, price, description, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  })

  //service get
  app.get("/services", (req, res) => {
    serviceCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
      // console.log(err,documents)
    });
  });


  //add booking
  app.post("/addBook", (req, res) => {
    const booking = req.body;
    // console.log(booking);
    bookingCollection.insertOne(booking).then((result) => {
      res.send(result);
    });
  });

  // get booking
  app.get('/bookingService/:email', (req, res) => {
    const { email } = req.params
    bookingCollection.find({ email })
        .toArray((error, result) => {
            res.send(result)
            // console.log(result);
        })
  })

  app.post('/serviceById', async (req, res) => {
    const serviceId = await req.body
    const serviceDetail = serviceId.map(item => {
        return ObjectID(item)
    })
    serviceCollection.find({ _id: { $in: serviceDetail } })
        .toArray((error, result) => {
            console.log(error);
            res.send(result)
        })
})
  
app.post('/payBooking', (req, res) => {
  bookListCollection.insertOne(req.body)
  .then(result => {
    console.log('added', result);
    bookingCollection.deleteMany({ email: req.body.email })
        .then(result => {
            console.log( result);
        })
  })
})

//get book service 
app.get('/getBook/:email', (req, res) => {
  const { email } = req.params
  bookListCollection.find({ email })
      .toArray((error, result) => {
          res.send(result)
      })
})

//get all booking list
app.get('/allBookingList', (req, res) => {
  bookListCollection.find()
      .toArray((error, result) => {
          res.send(result)
      })
})

  //review post
  app.post("/addReview", (req, res) => {
    const review = req.body;
    // console.log(review);
    reviewCollection.insertOne(review).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //review get
  app.get("/reviews", (req, res) => {
    reviewCollection.find({})
    .toArray((err, docs) => {
      res.send(docs);
      // console.log(docs)
    });
  });

 //delete product
 app.delete("/deleteEvent/:id", (req, res) => {
  const id = ObjectID(req.params.id);
  console.log("delete", id);
  serviceCollection.findOneAndDelete({ _id: id })
  .then( docs => {
    res.send(!!docs.value[0])
  });
});


//Make admin
app.post("/makeAdmin", (req, res) => {
  const admin = req.body;
  // console.log("admin",admin);
  adminCollection.insertOne(admin).then((result) => {
    res.send(result.insertedCount > 0);
  });
});

app.post("/isAdmin", (req, res) => {
  const admin = req.body;
  // console.log(date.date);
  const email = req.body.email;
  adminCollection.find({ email: email })
  .toArray((err, admins) => {
    res.send(admins.length > 0)
  });
});

  //blogs add
  app.post("/addBlog", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const title = req.body.title;
    const category = req.body.category;
    const description = req.body.description;
    const newImg = file.data;
  const encImg = newImg.toString("base64");

  let image = {
    contentType: file.mimetype,
    size: file.size,
    img: Buffer.from(encImg, "base64"),
  };

  blogsCollection.insertOne({name, category, title, description, image }).then((result) => {
    res.send(result.insertedCount > 0);
  });
})

//get blogs
app.get("/blogs", (req, res) => {
  blogsCollection.find({})
  .toArray((err, documents) => {
    res.send(documents);
    // console.log(err,documents)
  });
});

  
});



app.get("/", (req, res) => {
    res.send("Working db for assignment 11");
  });
  
  app.listen(process.env.PORT || port);