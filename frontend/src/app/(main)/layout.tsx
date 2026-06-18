import { Header, Footer } from "@/shared/ui";
import { TrainingPlanSurveyProvider } from "@/modules/trainingPlanSurvey";
import logo from "@/assets/logo.png";
import avatar from "@/assets/default_avatar.png";

/** Оболочка основных страниц: шапка, контент, подвал и модалка опросника. */
export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <TrainingPlanSurveyProvider>
      <Header
        username="Юлия"
        logo={{ image: logo }}
        avatar={{ image: avatar }}
      />
      <main className="content">{children}</main>
      <Footer />
    </TrainingPlanSurveyProvider>
  );
}
