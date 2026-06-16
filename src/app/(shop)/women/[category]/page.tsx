// /women/[category] — Dynamic women's category page (e.g. /women/dresses)
type Props = { params: Promise<{ category: string }> };

export default async function WomenCategoryPage({ params }: Props) {
  const { category } = await params;
  return (
    <section className="container mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8 capitalize">{category}</h1>
      {/* TODO: <ProductGrid category={category} /> */}
    </section>
  );
}
