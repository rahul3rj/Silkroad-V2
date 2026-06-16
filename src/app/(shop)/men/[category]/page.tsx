// /men/[category] — Dynamic men's category page (e.g. /men/shirts)
// TODO: Fetch products filtered by category slug
type Props = { params: Promise<{ category: string }> };

export default async function MenCategoryPage({ params }: Props) {
  const { category } = await params;
  return (
    <section className="container mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8 capitalize">{category}</h1>
      {/* TODO: <ProductGrid category={category} /> */}
    </section>
  );
}
