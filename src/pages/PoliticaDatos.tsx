import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Fill, LegalList, LegalPage, LegalSection, LegalTable } from "@/components/LegalPage";
import { mailtoUrl, site } from "@/config/site";
import { dataLocation, legal, PRIVACY_POLICY_VERSION, retention } from "@/config/legal";
import { useConsent } from "@/features/consent/useConsent";

const address = `${site.address.street}, ${site.address.neighborhood}, ${site.address.city}, ${site.address.region}, Colombia`;

/**
 * Política de tratamiento de datos personales (Ley 1581 de 2012 y Decreto 1377 de 2013,
 * compilado en el Decreto 1074 de 2015). Borrador técnico: debe revisarlo un abogado.
 */
const PoliticaDatos = () => {
  const { openSettings } = useConsent();
  const email = (
    <a href={mailtoUrl} className="text-primary underline">
      {site.email}
    </a>
  );

  return (
    <>
      <Seo path="/politica-de-datos" />
      <LegalPage
        eyebrow="Información legal"
        title="Política de tratamiento de datos personales"
        intro={`Versión ${PRIVACY_POLICY_VERSION}. Conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.`}
      >
        <LegalSection id="responsable" title="1. Responsable del tratamiento">
          <LegalList>
            <li>
              <strong>Razón social:</strong> {site.name} ({site.shortName})
            </li>
            <li>
              <strong>NIT:</strong> <Fill value={legal.nit} />
            </li>
            <li>
              <strong>Domicilio:</strong> {address}
            </li>
            <li>
              <strong>Correo electrónico:</strong> {email}
            </li>
            <li>
              <strong>Teléfono / WhatsApp:</strong> {site.phone.display}
            </li>
            <li>
              <strong>Sitio web:</strong> {site.url || "este sitio"}
            </li>
          </LegalList>
        </LegalSection>

        <LegalSection id="marco" title="2. Marco legal y alcance">
          <p>
            Esta política aplica a los datos personales que {site.shortName} trata a través de este sitio web. Se rige por
            el artículo 15 de la Constitución Política, la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013
            (compilado en el Decreto Único 1074 de 2015) y las demás normas que los modifiquen o complementen.
          </p>
          <p>
            <strong>Titular</strong> es la persona cuyos datos se tratan. <strong>Tratamiento</strong> es cualquier
            operación sobre datos personales: recolección, almacenamiento, uso, circulación o supresión.{" "}
            <strong>Encargado</strong> es quien trata datos por cuenta del responsable.
          </p>
        </LegalSection>

        <LegalSection id="datos" title="3. Qué datos tratamos, para qué y por cuánto tiempo">
          <LegalTable
            head={["Datos", "Finalidad", "Conservación"]}
            rows={[
              [
                "Formulario de contacto: nombre, correo electrónico, mensaje, y fecha y versión de esta política que aceptaste.",
                "Responder tu solicitud y contactarte sobre ella. Conservar la prueba de tu autorización.",
                `${retention.contactMessagesMonths} meses desde el envío; después se borra automáticamente.`,
              ],
              [
                "Visitas: página visitada, fecha y hora, y tipo de navegador (user agent). Solo si aceptas las estadísticas: un identificador anónimo guardado en tu navegador.",
                "Estadísticas agregadas de uso del sitio (visitas y visitantes únicos). No se usan para publicidad ni para identificarte.",
                `${retention.pageViewsMonths} meses; después se borran automáticamente.`,
              ],
              [
                "Seguridad: tu dirección IP, convertida en un hash irreversible (SHA-256 con una clave secreta). La IP en claro no se guarda en nuestra base de datos.",
                "Limitar el número de envíos por hora para prevenir abuso y spam en las visitas y el formulario.",
                `Como máximo ${retention.rateLimitHours} horas.`,
              ],
              [
                "Administradores del sitio: correo electrónico y datos de sesión.",
                "Dar acceso al panel administrativo.",
                "Mientras la cuenta esté activa.",
              ],
            ]}
          />
          <p>
            No solicitamos datos sensibles (salud, origen étnico, opiniones políticas, datos biométricos, etc.) ni datos
            de niños, niñas o adolescentes. El sitio no está dirigido a menores de edad. Si nos escribes, te pedimos no
            incluir datos sensibles en el mensaje.
          </p>
        </LegalSection>

        <LegalSection id="autorizacion" title="4. Autorización">
          <p>
            Para enviar el formulario de contacto debes autorizar el tratamiento de tus datos marcando la casilla
            correspondiente, que enlaza a esta política. Guardamos la fecha y hora de la autorización y la versión de la
            política que aceptaste, como prueba de ella. Puedes revocarla en cualquier momento (ver sección 8).
          </p>
          <p>
            El registro de visitas sin identificador (página, fecha y navegador) se hace sin pedir autorización porque no
            permite identificarte. El identificador anónimo y la carga de Google Maps solo se activan si los aceptas en el
            aviso de cookies.
          </p>
        </LegalSection>

        <LegalSection id="encargados" title="5. Encargados, terceros y transferencia internacional">
          <p>Para operar el sitio usamos estos proveedores, que tratan datos por nuestra cuenta o como terceros:</p>
          <LegalList>
            <li>
              <strong>Supabase, Inc.</strong> (encargado): base de datos, autenticación, almacenamiento de imágenes y
              funciones del servidor. Los datos se guardan en servidores ubicados en <strong>{dataLocation}</strong>. Esto
              implica una <strong>transmisión internacional de datos</strong> a Estados Unidos, que autorizas al aceptar
              esta política.
            </li>
            <li>
              <strong>Cloudflare, Inc.</strong> (encargado): aloja y entrega el sitio, y su servicio{" "}
              <strong>Turnstile</strong> verifica que quien envía el formulario de contacto sea una persona. Para ello
              procesa tu IP y características técnicas del navegador. Es necesario para la seguridad del formulario y se
              carga solo en la página de Contacto.
            </li>
            <li>
              <strong>Google LLC</strong> (tercero): si aceptas la categoría «Mapas» y pulsas «Ver mapa», tu navegador
              carga Google Maps. Google recibe tu IP y puede usar sus propias cookies según su política de privacidad. Sin
              ese paso, no hay conexión con Google.
            </li>
            <li>
              <strong>WhatsApp, Facebook e Instagram</strong> (terceros): solo si haces clic en sus enlaces. A partir de
              ahí aplican sus propias políticas.
            </li>
          </LegalList>
          <p>
            No vendemos ni cedemos tus datos personales a terceros con fines comerciales.
          </p>
        </LegalSection>

        <LegalSection id="cookies" title="6. Cookies y almacenamiento local">
          <p>
            Este sitio no crea cookies propias. Usa el almacenamiento local de tu navegador (localStorage) para lo
            siguiente:
          </p>
          <LegalTable
            head={["Nombre", "Para qué", "Tipo"]}
            rows={[
              [<code key="c">ame_consent</code>, "Recordar tu elección en el aviso de cookies.", "Necesario"],
              [<code key="c">waTooltipSeen</code>, "No volver a mostrar el globo del botón de WhatsApp.", "Necesario (preferencia)"],
              [<code key="c">sb-…-auth-token</code>, "Sesión del panel administrativo (solo administradores).", "Necesario"],
              [<code key="c">ame_admin_last_activity</code>, "Cerrar la sesión del panel tras 30 minutos sin actividad.", "Necesario"],
              [<code key="c">ame_visitor_id</code>, "Identificador anónimo para contar visitantes únicos.", "Estadísticas (con permiso)"],
            ]}
          />
          <p>
            Cloudflare Turnstile y Google Maps funcionan dentro de sus propios marcos (iframes) y pueden usar cookies de
            sus dominios. Puedes cambiar tu elección cuando quieras en{" "}
            <button type="button" onClick={openSettings} className="text-primary underline">
              Preferencias de cookies
            </button>{" "}
            (también en el pie de página). Al retirar el permiso de estadísticas se borra el identificador.
          </p>
        </LegalSection>

        <LegalSection id="seguridad" title="7. Seguridad de la información">
          <p>
            Aplicamos medidas técnicas y administrativas razonables: conexión cifrada (HTTPS), control de acceso por
            roles en la base de datos, acceso al panel solo para administradores con cierre de sesión por inactividad,
            IP guardadas solo como hash, protección anti-spam y borrado automático de los datos al vencer sus plazos.
            Ningún sistema es completamente infalible; si detectamos un incidente que afecte tus datos, actuaremos según
            la ley e informaremos a la Superintendencia de Industria y Comercio cuando corresponda.
          </p>
        </LegalSection>

        <LegalSection id="derechos" title="8. Tus derechos como titular">
          <p>Según el artículo 8 de la Ley 1581 de 2012, tienes derecho a:</p>
          <LegalList>
            <li>Conocer, actualizar y rectificar tus datos personales.</li>
            <li>Solicitar prueba de la autorización que nos diste.</li>
            <li>Ser informado, previa solicitud, del uso que les hemos dado.</li>
            <li>
              Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley, una vez
              agotado el trámite de consulta o reclamo ante nosotros.
            </li>
            <li>
              Revocar la autorización y pedir la supresión de tus datos cuando no se respeten los principios, derechos y
              garantías legales, salvo que exista un deber legal o contractual de conservarlos.
            </li>
            <li>Acceder gratuitamente a tus datos personales.</li>
          </LegalList>
        </LegalSection>

        <LegalSection id="procedimiento" title="9. Consultas y reclamos">
          <p>
            <strong>Responsable de atenderlos:</strong> <Fill value={legal.dataOfficer} />.{" "}
            <strong>Canal:</strong> {email}, con el asunto «Datos personales». También puedes escribir a la dirección
            del domicilio.
          </p>
          <p>
            <strong>Requisitos:</strong> nombre completo e identificación del titular (o acreditación de su
            representante o causahabiente), descripción de lo que solicitas, dirección o correo para responderte y los
            documentos que quieras hacer valer.
          </p>
          <p>
            <strong>Consultas</strong> (conocer tus datos o su uso): respondemos en máximo <strong>diez (10) días
            hábiles</strong> desde su recibo. Si no es posible, te informaremos el motivo y la nueva fecha, que no superará
            cinco (5) días hábiles adicionales.
          </p>
          <p>
            <strong>Reclamos</strong> (corregir, actualizar, suprimir o revocar, o advertir un incumplimiento): si el
            reclamo está incompleto, te pediremos completarlo dentro de los cinco (5) días hábiles siguientes; si pasan dos
            (2) meses sin respuesta, se entenderá que desististe. Una vez completo, incluiremos en la base la leyenda
            «reclamo en trámite» y lo resolveremos en máximo <strong>quince (15) días hábiles</strong>, prorrogables por
            ocho (8) días hábiles más, informándote el motivo.
          </p>
          <p>
            Antes de acudir a la SIC debes agotar este trámite (requisito de procedibilidad del artículo 16 de la Ley
            1581 de 2012).
          </p>
        </LegalSection>

        <LegalSection id="vigencia" title="10. Vigencia y cambios">
          <p>
            Esta política rige desde el <Fill value={legal.effectiveDate} /> (versión {PRIVACY_POLICY_VERSION}). Las
            bases de datos se conservarán durante los plazos indicados en la sección 3 o mientras sea necesario para
            cumplir las finalidades y los deberes legales. Si hacemos cambios sustanciales, publicaremos la nueva versión
            en esta página y volveremos a pedir tu elección en el aviso de cookies; para nuevos envíos del formulario se
            pedirá la autorización con la nueva versión.
          </p>
          <p>
            Consulta también los <Link to="/terminos" className="text-primary underline">Términos de uso</Link>.
          </p>
        </LegalSection>
      </LegalPage>
    </>
  );
};

export default PoliticaDatos;
