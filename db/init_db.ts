import { client } from "./index.js";
import {
  createOrderProduct,
  createProduct,
  createOrder,
  createUser,
  setUserAsAdmin,
} from "./utils.js";

async function buildTables() {
  try {
    console.log("Dropping All Tables...");
    await client.query(`
    DROP TABLE IF EXISTS order_products;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS users;
    DROP TYPE IF EXISTS STATUS_ENUMS;
    `);

    console.log("Starting to build tables...");
    await client.query(`
    CREATE TYPE STATUS_ENUMS AS ENUM('created', 'cancelled', 'completed', 'processing');

    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      "firstName" VARCHAR(255) NOT NULL,
      "lastName" VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      "imageURL" TEXT DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg',
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      "isAdmin" BOOLEAN NOT NULL DEFAULT false
    );
    CREATE TABLE orders(
      id SERIAL PRIMARY KEY,
      status STATUS_ENUMS DEFAULT 'created',
      "userId" INTEGER REFERENCES users(id),
      "datePlaced" DATE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE products(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      "imageURL" TEXT DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg',
      "inStock" BOOLEAN NOT NULL DEFAULT false,
      category VARCHAR(255) NOT NULL
    );
    CREATE TABLE order_products(
      id SERIAL PRIMARY KEY,
      "productId" INTEGER REFERENCES products(id),
      "orderId" INTEGER REFERENCES orders(id),
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      UNIQUE ("productId", "orderId")
    );
    `);
  } catch (error) {
    console.error(error);
  }
}

async function populateInitialData() {
  try {
    // create useful starting data
    console.log("starting to create initial product!");

    const productsToCreate = [
      {
        id: 1,
        name: "PSA grade 10 Base set Charzard",
        description:
          "Charzard, the fire type pokemon. It spits fire that is hot enough to melt boulders. It may cause forest fires by blowing flames.",
        price: 399995,
        imageURL:
          "https://goldinauctions.com/ItemImages/000051/51339a_med.jpeg",
        inStock: true,
        category: "Pokemon Cards",
      },
      {
        id: 2,
        name: "PSA grade 10 Base set Blastoise",
        description:
          "Blastoise the water type pokemon. The cannons on its back is as powerful as a tank gun. Its tough legs and back enable it to withstand the recoil from firing the cannon.",
        price: 349995,
        imageURL:
          "https://d1w8cc2yygc27j.cloudfront.net/-6057793498564273079/7643880271689788165.jpg",
        inStock: true,
        category: "Pokemon Cards",
      },
      {
        id: 3,
        name: "PSA grade 10 Base set Venusaur",
        description:
          "Venusaur the plant type pokemon. In battle, this Pokémon swings around two thick vines. If these vines slammed into a 10-story building, they could easily topple it.",
        price: 339995,
        imageURL:
          "https://d9nvuahg4xykp.cloudfront.net/2175094541022248778/2533966137030091563.jpg",
        inStock: true,
        category: "Pokemon Cards",
      },
      {
        id: 4,
        name: "PSA grade 10 Base set Mew",
        description:
          "Thought to be the oldest pokemon. Mew is said to have the DNA of every single Pokémon contained within its body, allowing Mew to learn and use any attack.",
        price: 299999,
        imageURL: "https://i.ebayimg.com/images/g/kacAAOSwX-BfmKOL/s-l400.jpg",
        inStock: true,
        category: "Pokemon Cards",
      },
      {
        id: 5,
        name: "PSA grade 10 Base set MewTwo",
        description:
          "Cloned from Mew, with mans intent to create the perfect pokemon. With a mere thought, it can smash a skyscraper to smithereens.",
        price: 299999,
        imageURL:
          "https://images.psacard.com/s3/cu-psa/cardfacts/1999-pokemon-game-10-mewtwo-holo-1st-edition-gem-mt-69935.jpg?h=1000&format=png&s.roundcorners=10",
        inStock: true,
        category: "Pokemon Cards",
      },
      {
        id: 6,
        name: "Pokemon Jungle 1st Edition Box(Sealed)",
        description:
          "In perfect condition, this original set was realised in the year 1995 shortly after the first based set.",
        price: 2400099,
        imageURL:
          "https://assets.catawiki.nl/assets/2017/2/9/5/a/d/5ada6bef-9993-4143-8d95-048fa7db6f5a.jpg",
        inStock: true,
        category: "Pokemon Cards",
      },
      {
        id: 7,
        name: "Pokemon Fossil 1st Edition Box(Sealed)",
        description:
          "In perfect condition, this original set was realised in the year 1997 shortly after the second based set.",
        price: 1800099,
        imageURL:
          "https://52f4e29a8321344e30ae-0f55c9129972ac85d6b1f4e703468e6b.ssl.cf2.rackcdn.com/products/pictures/1109930.jpg",
        inStock: true,
        category: "Pokemon Cards",
      },
      {
        id: 8,
        name: "Pokemon Base Set 1st Edition Box(Sealed)",
        description:
          "In perfect condition, this original set was realised in the year 1993 shortly after gaining popular demand by the original Pokemon tv show released in the US.",
        price: 4000099,
        imageURL:
          "https://dyn1.heritagestatic.com/lf?set=path%5B2%2F0%2F3%2F6%2F8%2F20368081%5D%2Csizedata%5B850x600%5D&call=url%5Bfile%3Aproduct.chain%5D",
        inStock: true,
        category: "Pokemon Cards",
      },
      {
        id: 9,
        name: "Pokemon Mystery Box",
        description:
          "This mystery box, will contain several originally sealed packs along with the chance of pulling a original first edition holo based card.",
        price: 4599,
        imageURL: "https://i.ebayimg.com/images/g/5aoAAOSwOghfnj31/s-l400.jpg",
        inStock: true,
        category: "Pokemon Cards",
      },
    ];
    const products = await Promise.all(
      productsToCreate.map((product) => createProduct(product)),
    );
    console.log("products created: ", products);

    // ---------

    const usersToCreate = [
      {
        firstName: "elmar",
        lastName: "fudd",
        email: "elmarisawesome@me.com",
        username: "elmarisme",
        password: "elmar12345",
      },

      {
        firstName: "dougy",
        lastName: "fresh",
        email: "dougIstheman@me.com",
        username: "dougIsMe",
        password: "dougy12345",
      },
    ];
    const users = await Promise.all(
      usersToCreate.map((user) => createUser(user)),
    );
    await setUserAsAdmin(2);

    // ------

    const ordersToCreate = [
      {
        status: "created",
        userId: 1,
      },
      {
        status: "completed",
        userId: 1,
      },
    ];
    const orders = await Promise.all(
      ordersToCreate.map((order) => createOrder(order)),
    );
    console.log("order created:", orders);

    // -----------

    const orderProductsToCreate = [
      {
        productId: 1,
        orderId: 1,
        price: 5000,
        quantity: 1,
      },
      {
        productId: 2,
        orderId: 1,
        price: 5001,
        quantity: 1,
      },
      {
        productId: 3,
        orderId: 1,
        price: 5002,
        quantity: 1,
      },
    ];
    const order_product = await Promise.all(
      orderProductsToCreate.map((order_product) =>
        createOrderProduct(order_product),
      ),
    );
    console.log("order_product created:", order_product);
  } catch (error) {
    console.error(error);
  }
}

client
  .connect()
  .then(buildTables)
  .then(populateInitialData)
  .catch(console.error)
  .finally(() => client.end());

export { buildTables, populateInitialData };
