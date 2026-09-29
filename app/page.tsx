import { Configurator } from "@/components/configurator";
import { backdropSrc, catalog, initialConfiguration } from "@/lib/catalog";
import { assertValidCatalog } from "@/lib/validate-catalog";

export default function Home() {
  // Runs during the static prerender, so an invalid catalog fails the build
  // and never reaches users (03 §11, 05 §12).
  assertValidCatalog({ products: catalog, initialConfiguration, backdropSrc });

  return (
    <Configurator catalog={catalog} initialConfiguration={initialConfiguration} backdropSrc={backdropSrc} />
  );
}
