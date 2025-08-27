import { client } from "./index.js";

const getProductById = async (id) => {
  try {
    const {
      rows: [product],
    } = await client.query(
      `
           SELECT * FROM products
           WHERE id = $1;
        `,
      [id],
    );
    return product;
  } catch (error) {
    throw error;
  }
};

const getAllProducts = async () => {
  try {
    const { rows: products } = await client.query(`
            SELECT * FROM products;
        `);
    return products;
  } catch (error) {
    throw error;
  }
};

const createProduct = async ({
  name,
  description,
  price,
  imageURL,
  inStock,
  category,
}) => {
  try {
    const {
      rows: [product],
    } = await client.query(
      `
            INSERT INTO products(name, description, price, "imageURL", "inStock", category)
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
      [name, description, price, imageURL, inStock, category],
    );
    return product;
  } catch (error) {
    throw error;
  }
};

const updateProduct = async ({ id, ...fields }) => {
  const fieldKeys = Object.keys(fields)
    .map((fieldName, index) => `"${fieldName}"=$${index + 1}`)
    .join(", ");

  const setValues = Object.values(fields);

  if (fieldKeys.length === 0) {
    return;
  }

  setValues.push(id);

  try {
    const {
      rows: [product],
    } = await client.query(
      `
            UPDATE products
            SET ${fieldKeys}
            WHERE id = $${setValues.length}
            RETURNING *;
        `,
      setValues,
    );
    return product;
  } catch (error) {
    throw error;
  }
};

const destroyProduct = async (id) => {
  try {
    const { rows: order_products } = await client.query(
      `
			DELETE FROM order_products
			WHERE "productId" = $1
			AND "orderId" NOT IN
			(SELECT orders.id FROM orders
			JOIN order_products ON orders.id = order_products."orderId"
			WHERE orders.status = 'completed'
			and order_products."productId" = ${id})
			RETURNING *;
		  `,
      [id],
    );

    const { rows: product } = await client.query(
      `
		  	DELETE FROM products
        WHERE id = $1
        RETURNING *;
			`,
      [id],
    );
    return product;
  } catch (error) {
    throw error;
  }
};

export {
  destroyProduct,
  getProductById,
  getAllProducts,
  createProduct,
  updateProduct,
};
