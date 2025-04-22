const { PrismaClient } = require("@prisma/client");
const uploadToCloudinary = require("../utils/upload-to-cloudinary.js");
const deleteFromCloudinary = require("../utils/delete-from-cloudinary.js");
const extractPublicId = require("../utils/extract-cloudinary-publicid.js");

const prisma = new PrismaClient();

async function addNewProduct(req, res) {
  let imageUrl = null;
  try {
    const storeData = await prisma.store.findUnique({
      where: {
        id_user: req.user.id_user,
      },
    });

    const {
      product_name,
      product_description,
      categories, // array of category name
      variations, // aray of product's variations
    } = req.body;

    const product_categories = JSON.parse(categories); // ["Fashion", "Pria"]
    const product_variations = JSON.parse(variations);

    if (
      !product_name ||
      !product_categories ||
      product_categories.length == 0 ||
      !product_variations ||
      product_variations.length == 0
    ) {
      throw new Error(
        "Product name, atleast one category, and one variations is required."
      );
    }

    // Olah nama category menjadi id category
    // Ubah nama kategori menjadi lowercase
    const inputNames = product_categories.map((name) => name.toLowerCase());

    // check apakah kategori sudah ada di database
    const existingCategories = await prisma.category.findMany({
      where: {
        category_name: {
          in: inputNames,
          mode: "insensitive",
        },
      },
    });

    // Ubah semua category name hasil prisma menjadi lower case
    const existingNames = existingCategories.map((cat) =>
      cat.category_name.toLowerCase()
    );

    // Kumpulkan kategori yang belum ada di database
    // Caranya lihat mana kategori yang ada di inputNames tapi tidak ada di existing names
    const newNames = inputNames.filter((name) => !existingNames.includes(name));

    // Buat smeua kategori yang ada pada newNames
    const newCategories = await Promise.all(
      newNames.map((name) =>
        prisma.category.create({
          data: { category_name: name },
        })
      )
    );

    // Combine all category IDs
    const allCategoryIds = [
      ...existingCategories.map((cat) => cat.id_category),
      ...newCategories.map((cat) => cat.id_category),
    ];

    if (req.file && req.file.buffer) {
      imageUrl = await uploadToCloudinary(
        req.file.buffer,
        "product_thumbnail",
        req.file.originalname
      );
    }

    // Buat produk baru dengan relasi ke kategori dan variasi
    const newProduct = await prisma.product.create({
      data: {
        product_name,
        product_description,
        product_thumbnail: imageUrl ? imageUrl : null,
        created_at: new Date(),
        updated_at: new Date(),

        store: {
          connect: { id_store: storeData.id_store },
        },

        ProductCategory: {
          create: allCategoryIds.map((categoryId) => ({
            category: {
              connect: { id_category: categoryId },
            },
          })),
        },

        variations: {
          create: product_variations.map((variation) => ({
            variation_name: variation.variation_name,
            variation_price: parseInt(variation.variation_price),
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
    if (imageUrl) {
      const publicId = extractPublicId(imageUrl);
      deleteFromCloudinary(publicId);
    }
    return res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred",
    });
  }
}

async function searchProduct(req, res) {
  try {
    const { category, name, priceRange } = req.query;

    let where = {
      deleted_at: null,
    };

    if (name) {
      where.product_name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (category) {
      const categoryList = category.split(",").map((cat) => cat.trim());

      where.ProductCategory = {
        some: {
          category: {
            OR: categoryList.map((cat) => ({
              category_name: {
                equals: cat,
                mode: "insensitive",
              },
            })),
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

    const productsRaw = await prisma.product.findMany({
      where,
      select: {
        id_product: true,
        product_name: true,
        product_thumbnail: true,
        variations: true,
        ProductCategory: {
          select: {
            category: true,
          },
        },
        store: {
          select: {
            id_store: true,
            store_name: true,
            store_picture: true,
          },
        },
      },
    });

    // Hitung range harga
    const products = productsRaw.map((product) => {
      const prices = product.variations.map((v) => v.variation_price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      delete product.variations;

      return {
        ...product,
        price_range: `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`,
      };
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

async function getProductDetail(req, res) {
  try {
    const productId = req.params.productId;

    let productData = await prisma.product.findUnique({
      where: {
        id_product: productId,
        deleted_at: null,
      },

      select: {
        id_product: true,
        product_name: true,
        product_description: true,
        product_thumbnail: true,
        ProductCategory: {
          select: {
            category: {
              select: {
                category_name: true,
              },
            },
          },
        },
        store: {
          select: {
            store_name: true,
            store_picture: true,
          },
        },
        variations: {
          select: {
            variation_name: true,
            variation_price: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: productData,
    });
  } catch (error) {
    console.log("getProductDetail ", error.message);
    res.status(400).json({
      success: false,
      message: "Failed to fetch store's products",
    });
  }
}

module.exports = { addNewProduct, searchProduct, getProductDetail };
