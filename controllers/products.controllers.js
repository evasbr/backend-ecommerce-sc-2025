const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addNewProduct(req, res) {
  try {
    const id = req.params.id;

    const {
      product_name,
      product_description,
      product_categories,
      product_variations,
    } = req.body;

    // Buat produk baru dengan relasi ke kategori dan variasi
    const newProduct = await prisma.product.create({
      data: {
        product_name,
        product_description,
        product_thumbnail: req.file ? req.file.path.replace(/\\/g, "/") : null,
        created_at: new Date(),
        updated_at: new Date(),

        store: {
          connect: { id_store: id },
        },

        ProductCategory: {
          create: product_categories.map((categoryId) => ({
            category: {
              connect: { id_category: categoryId },
            },
          })),
        },

        variations: {
          create: product_variations.map((variation) => ({
            variation_name: variation.name,
            variation_price: parseInt(variation.price),
          })),
        },
      },
      include: {
        ProductCategory: {
          include: {
            category: true,
          },
        },
        variations: true,
      },
    });

    return res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred",
    });
  }
}

async function searchProduct(req, res) {
  try {
    const { category, name, priceRange } = req.query;

    let where = {};

    if (name) {
      where.product_name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (category) {
      where.ProductCategory = {
        some: {
          category: {
            category_name: {
              contains: category,
              mode: "insensitive",
            },
          },
        },
      };
    }

    // 10000,20000
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split(",");
      where.variations = {
        some: {
          variation_price: {
            gte: parseInt(minPrice),
            lte: parseInt(maxPrice),
          },
        },
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        ProductCategory: {
          include: {
            category: true,
          },
        },
        variations: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Data berhasil diambil",
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = { addNewProduct, searchProduct };
