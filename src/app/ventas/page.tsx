import { getProfileCookie } from "@/app/actions/profile";
import { VentasVermut } from "./components/VentasVermut";
import { VentasGranel } from "./components/VentasGranel";

export default async function VentasPage() {
  const profile = await getProfileCookie();

  if (profile === "GRANEL_PREMIUM") {
    return <VentasGranel />;
  }

  return <VentasVermut />;
}
