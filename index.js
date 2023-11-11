const express = require('express');
const app = express();
const cors = require('cors');
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE']
  }
  app.use(cors())
  app.use(express.json())
  
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port= process.env.PORT || 5000


const uri = "mongodb+srv://rifat43:ggNnjhmr1RAfQ3iG@cluster0.d0x6rpk.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const dataBase = client.db('locationDB');
    const locationCollection = dataBase.collection('location');
    const locationCartCollection = dataBase.collection('locationCart')


    app.post('/products', async (req, res) => {
      const newProducts = req.body;
      const result = await locationCollection.insertOne(newProducts)
      res.send(result)
    })

    app.get('/products', async (req, res) => {
      const cursor =await locationCollection.find();
      const result = await cursor.toArray();
      res.send(result)

    })





    app.get('/products/id/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await locationCollection.findOne(query)
      res.send(result)
    })

    app.get('/products/brand/:brandName', async (req, res) => {
      const brandName = req.params.brandName;
      const query = { brandName }
      const result = await locationCollection.find(query).toArray()
      res.send(result)
    })


    // add cart system

    app.post('/carts', async (req, res) => {
      const cartProduct = req.body;
      const productDetails=await locationCartCollection.findOne({id:cartProduct.id,email:cartProduct.email})
      if(productDetails){
       return res.send({msg:'Already Added'})
      }
      
      const result = await locationCartCollection.insertOne(cartProduct)
        res.send(result)
    })

    app.get('/carts/:email', async (req, res) => {
      // const cursor =await locationCartCollection.find();
      const email=req.params.email;
      console.log(email)
      const carts=await locationCartCollection.find({email}).toArray()
      // const result = await cursor.toArray();
      if(!carts){
       return res.send([])
      }
      res.send(carts)
    })

    // update product

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await locationCollection.findOne(query)
      res.send(result)
    })

    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateProduct = req.body;
      const product = {
        $set: {
          image: updateProduct.image,
          name: updateProduct.name,
          brandName: updateProduct.brandName,
          type: updateProduct.type,
          price: updateProduct.price,
          shortDescription: updateProduct.shortDescription,
          rating: updateProduct.rating,
        }
      }

      const result=await locationCollection.updateOne(filter,product,options)
      res.send(result)
    })


    // delete item

    app.delete('/carts/:id/:email',async(req,res)=>{
      const id=req.params.id;
      const email=req.params.email;
      const query={id,email}
      const result=await locationCartCollection.deleteOne(query)
      res.send(result)
    })

    app.get('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { id }
      const result = await locationCartCollection.findOne(query).toArray()
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Brand Shop Server')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})