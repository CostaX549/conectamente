export const metadata = {
  title: "Ache médicos - ConectaMente",
  description: "Navegue e agende consultas com os melhores profissionais de saúde",
};

export default async function DoctorsLayout({ children }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
}