/** Минимальная оболочка для страниц авторизации без шапки и подвала. */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
