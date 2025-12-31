import { MainPage } from "@/components/hanzi-crafter/MainPage";
import { RADICALS, CHARACTERS, CHALLENGES } from "@/lib/data";

export default function Home() {
  return (
    <MainPage
      charactersData={CHARACTERS}
      radicalsData={RADICALS}
      challengesData={CHALLENGES}
    />
  );
}
