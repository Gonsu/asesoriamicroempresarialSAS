import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Fill, LegalList, LegalPage, LegalSection } from "@/components/LegalPage";
import { mailtoUrl, site } from "@/config/site";
import { legal } from "@/config/legal";

/** Términos de uso del sitio. Borrador técnico: debe revisarlo un abogado. */
const Terminos = () => (
  <>
    <Seo path="/terminos" />
    <LegalPage eyebrow="Información legal" title="Términos de uso" intro={<>Última actualización: <Fill value={legal.termsUpdated} />.</>}>
      <LegalSection id="aceptacion" title="1. Aceptación">
        <p>
          Este sitio web es de {site.name} ({site.shortName}), NIT <Fill value={legal.nit} />, con domicilio en{" "}
          {site.address.city}, {site.address.region}. Al usarlo aceptas estos términos. Si no estás de acuerdo, te pedimos
          no usar el sitio.
        </p>
      </LegalSection>

      <LegalSection id="objeto" title="2. Objeto del sitio">
        <p>
          El sitio presenta información sobre la empresa, sus servicios de asesoría financiera, gestión administrativa y
          consultoría empresarial, y sus actividades, y ofrece medios de contacto.
        </p>
      </LegalSection>

      <LegalSection id="informacion" title="3. Carácter de la información">
        <p>
          Los contenidos son informativos y generales. <strong>No constituyen asesoría financiera, contable, tributaria o
          legal personalizada</strong>, ni una oferta o promesa de crédito. Para una recomendación aplicable a tu caso,
          contáctanos y evaluaremos tu situación. Procuramos mantener la información actualizada, pero puede contener
          errores u omisiones y puede cambiar sin previo aviso.
        </p>
      </LegalSection>

      <LegalSection id="propiedad" title="4. Propiedad intelectual">
        <p>
          Los textos, logotipos, imágenes y diseño del sitio son de {site.shortName} o se usan con autorización. No puedes
          reproducirlos, distribuirlos ni modificarlos con fines comerciales sin permiso escrito. Puedes compartir enlaces
          al sitio.
        </p>
      </LegalSection>

      <LegalSection id="uso" title="5. Uso permitido">
        <p>Al usar el sitio te comprometes a no:</p>
        <LegalList>
          <li>Enviar información falsa, ofensiva o de terceros sin su autorización a través del formulario.</li>
          <li>Enviar publicidad no solicitada (spam) o usar herramientas automáticas para enviar mensajes o visitar el sitio de forma masiva.</li>
          <li>Intentar acceder sin autorización al panel administrativo, a la base de datos o a cuentas de otras personas.</li>
          <li>Interferir con la seguridad o el funcionamiento del sitio.</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="terceros" title="6. Enlaces y servicios de terceros">
        <p>
          El sitio enlaza a WhatsApp, Facebook, Instagram y Google Maps, y usa Cloudflare Turnstile en el formulario de
          contacto. No controlamos esos servicios ni respondemos por su contenido o sus prácticas; se rigen por sus
          propios términos y políticas.
        </p>
      </LegalSection>

      <LegalSection id="responsabilidad" title="7. Responsabilidad">
        <p>
          En la medida permitida por la ley colombiana, {site.shortName} no responde por daños derivados de interrupciones
          del sitio, errores en los contenidos o decisiones tomadas solo con base en la información publicada. Nada de lo
          anterior limita los derechos que la ley reconoce a los consumidores.
        </p>
      </LegalSection>

      <LegalSection id="datos" title="8. Datos personales">
        <p>
          El tratamiento de tus datos se rige por la{" "}
          <Link to="/politica-de-datos" className="text-primary underline">
            Política de tratamiento de datos personales
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="cambios" title="9. Cambios">
        <p>Podemos modificar estos términos. La versión vigente es la publicada en esta página, con su fecha de actualización.</p>
      </LegalSection>

      <LegalSection id="ley" title="10. Ley aplicable y jurisdicción">
        <p>
          Estos términos se rigen por las leyes de la República de Colombia. Las controversias se resolverán ante los
          jueces de <Fill value={legal.jurisdictionCity} />, sin perjuicio de los derechos del consumidor.
        </p>
      </LegalSection>

      <LegalSection id="contacto" title="11. Contacto">
        <p>
          Escríbenos a{" "}
          <a href={mailtoUrl} className="text-primary underline">
            {site.email}
          </a>{" "}
          o al WhatsApp {site.phone.display}.
        </p>
      </LegalSection>
    </LegalPage>
  </>
);

export default Terminos;
