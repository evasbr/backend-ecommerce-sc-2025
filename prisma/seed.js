const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const userNames = ["Eva", "Putu", "Dewi", "Andi", "Lina"];
  const owners = [
    {
      name: "Teguh",
      email: "teguh@mail.com",
      store: {
        name: "Gramedia Corner",
        theme: ["Buku", "novel"],
        products: [
          "Laskar Pelangi",
          "Dilan 1990",
          "Negeri 5 Menara",
          "Atomic Habits",
          "Filosofi Teras",
        ],
      },
    },
    {
      name: "Sinta",
      email: "sinta@mail.com",
      store: {
        name: "Rumah Idaman",
        theme: ["Peralatan Rumah Tangga", "Home"],
        products: [
          "Panci Stainless",
          "Setrika Uap",
          "Dispenser Air",
          "Rice Cooker",
          "Blender Mini",
        ],
      },
    },
    {
      name: "Bayu",
      email: "bayu@mail.com",
      store: {
        name: "Tekno Mart",
        theme: ["Elektronik", "Teknologi"],
        products: [
          "Smart TV 50 Inch",
          "Wireless Earbuds",
          "Laptop Gaming",
          "Smartwatch Fit",
          "Kamera Mirrorless",
        ],
      },
    },
  ];

  const storeData = []; // simpan info store dan category untuk tahap 2

  // =======================
  // Tahap 1: Transaksi cepat
  // =======================
  await prisma.$transaction(async (tx) => {
    const [userLevel, storeOwnerLevel] = await Promise.all([
      tx.userLevel.upsert({
        where: { id: "100011" },
        update: {},
        create: { name: "User", id: "100011" },
      }),
      tx.userLevel.upsert({
        where: { id: "200111" },
        update: {},
        create: { name: "Store_owner", id: "200111" },
      }),
    ]);

    // Buat user biasa
    for (const name of userNames) {
      await tx.user.create({
        data: {
          user_name: name,
          user_birthday: new Date("1995-01-01"),
          user_email: `${name.toLowerCase()}@mail.com`,
          user_password: `${name}12345678910`,
          created_at: new Date(),
          id_level: userLevel.id,
        },
      });
    }

    // Buat store owner, store, dan kategori
    for (const ownerData of owners) {
      const owner = await tx.user.create({
        data: {
          user_name: ownerData.name,
          user_birthday: new Date("1990-01-01"),
          user_email: ownerData.email,
          user_password: `${ownerData.name}123456789`,
          created_at: new Date(),
          id_level: storeOwnerLevel.id,
        },
      });

      const store = await tx.store.create({
        data: {
          id_user: owner.id_user,
          store_name: ownerData.store.name,
          created_at: new Date(),
        },
      });

      const categories = await Promise.all(
        ownerData.store.theme.map((cat) =>
          tx.category.create({
            data: { category_name: cat },
          })
        )
      );

      // Simpan data untuk tahap 2
      storeData.push({
        store,
        categories,
        products: ownerData.store.products,
      });
    }
  });

  // =======================
  // Tahap 2: Insert produk & variasi (di luar transaksi)
  // =======================
  for (const data of storeData) {
    for (const productName of data.products) {
      const product = await prisma.product.create({
        data: {
          id_store: data.store.id_store,
          product_name: productName,
          product_thumbnail:
            "https://res.cloudinary.com/dz7cmgdpj/image/upload/v1745326046/product_thumbnail/1745326044032_atomic%20habits.jpg",
          created_at: new Date(),
          ProductCategory: {
            create: data.categories.map((cat) => ({
              id_category: cat.id_category,
            })),
          },
        },
      });

      await prisma.productVariation.create({
        data: {
          id_product: product.id_product,
          variation_name: "Standard",
          variation_price: Math.floor(Math.random() * 100000) + 50000,
        },
      });
    }
  }

  console.log("✅ Semua data berhasil disimpan tanpa timeout!");
}

main()
  .catch((e) => {
    console.error("❌ Gagal menyimpan data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
