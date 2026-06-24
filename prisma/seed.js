const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();

const WASTE_CATEGORIES = [
  {idKategoriSampah: 1, nama: 'Limbah B3', emisiKarbon: 0.6},
  {
    idKategoriSampah: 2,
    nama: 'Sampah Organik (Mudah Terurai)',
    emisiKarbon: 0.2,
  },
  {
    idKategoriSampah: 3,
    nama: 'Sampah Anorganik (Plastik)',
    emisiKarbon: 0.5,
  },
  {
    idKategoriSampah: 4,
    nama: 'Sampah Anorganik (Kertas)',
    emisiKarbon: 0.7,
  },
  {
    idKategoriSampah: 5,
    nama: 'Sampah Anorganik (Logam)',
    emisiKarbon: 0.9,
  },
  {
    idKategoriSampah: 6,
    nama: 'Sampah Anorganik (Kaca)',
    emisiKarbon: 0.8,
  },
  {
    idKategoriSampah: 7,
    nama: 'Sampah Anorganik (Karet)',
    emisiKarbon: 0.4,
  },
  {
    idKategoriSampah: 8,
    nama: 'Sampah Anorganik (Tekstil)',
    emisiKarbon: 0.3,
  },
];

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('id-ID');
}

function inferCategoryName(name, currentCategory) {
  const normalizedCategory = normalize(currentCategory);
  const exactCategory = WASTE_CATEGORIES.find(
    category => normalize(category.nama) === normalizedCategory,
  );
  if (exactCategory) {
    return exactCategory.nama;
  }

  const value = `${normalize(name)} ${normalizedCategory}`;
  const rules = [
    {pattern: /\b(b3|jelantah|elektronik)\b/, categoryIndex: 0},
    {pattern: /\b(plastik|pet)\b/, categoryIndex: 2},
    {pattern: /\b(kertas|karton)\b/, categoryIndex: 3},
    {pattern: /\b(logam|besi|aluminium|kaleng)\b/, categoryIndex: 4},
    {pattern: /\b(kaca)\b/, categoryIndex: 5},
    {pattern: /\b(karet|ban)\b/, categoryIndex: 6},
    {pattern: /\b(tekstil|kain)\b/, categoryIndex: 7},
    {
      pattern: /\b(organik|daun|sisa makanan|mudah terurai)\b/,
      categoryIndex: 1,
    },
  ];

  const rule = rules.find(candidate => candidate.pattern.test(value));
  return rule ? WASTE_CATEGORIES[rule.categoryIndex].nama : null;
}

async function seedWasteCategories() {
  return prisma.$transaction(async tx => {
    await tx.mstrkategorisampah.deleteMany();
    await tx.mstrkategorisampah.createMany({data: WASTE_CATEGORIES});

    const wasteTypes = await tx.jenissampah.findMany({
      select: {
        idJenisSampah: true,
        nama: true,
        kategori: true,
      },
    });

    const skipped = [];
    let normalizedCount = 0;

    for (const wasteType of wasteTypes) {
      const category = inferCategoryName(wasteType.nama, wasteType.kategori);
      if (!category) {
        skipped.push(`${wasteType.idJenisSampah}: ${wasteType.nama}`);
        continue;
      }
      if (category === wasteType.kategori) {
        continue;
      }

      await tx.jenissampah.update({
        where: {idJenisSampah: wasteType.idJenisSampah},
        data: {kategori: category},
      });
      normalizedCount += 1;
    }

    return {normalizedCount, skipped};
  });
}

async function main() {
  const result = await seedWasteCategories();
  console.log(`Seeded ${WASTE_CATEGORIES.length} waste categories.`);
  console.log(`Normalized ${result.normalizedCount} existing waste types.`);
  if (result.skipped.length > 0) {
    console.warn(
      `Skipped ${result.skipped.length} unrecognized waste types: ${result.skipped.join(
        ', ',
      )}`,
    );
  }
}

if (require.main === module) {
  main()
    .catch(error => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = {
  WASTE_CATEGORIES,
  inferCategoryName,
  seedWasteCategories,
};
