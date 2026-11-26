import Container from '@/components/layout/container';
import {
  GuideFaqSection,
  GuideStepCard,
} from '@/components/page/guide-sections';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  graphJsonLd,
  jsonLdScript,
} from '@/lib/structured-data';
import { getPathWithLocale } from '@/lib/urls';
import { cn } from '@/lib/utils';
import { JUEGOS_PARA_CLASE_FAQS } from '@/pages/guide-faq-content';
import { IconArrowRight, IconDeviceGamepad2 } from '@tabler/icons-react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';

const path = '/juegos-para-clase';
const title = 'Juegos para clase: crea uno con tu contenido en minutos';
const description =
  'Crea juegos para clase con tus propias preguntas, parejas y palabras. Comparte un enlace para el alumnado, sin cuentas, y consulta los resultados.';

export const Route = createFileRoute('/juegos-para-clase')({
  loader: () => {
    if (getLocale() !== 'es') throw notFound();
    return null;
  },
  head: () => ({
    ...seo(path, {
      title,
      description,
      alternateLocales: ['es'],
      canonicalLocale: 'es',
    }),
    scripts: [
      jsonLdScript(
        graphJsonLd([
          breadcrumbJsonLd([
            { name: 'Plantillas de juegos', path: Routes.Templates },
            { name: 'Juegos para clase', path },
          ]),
          faqPageJsonLd({ faqs: JUEGOS_PARA_CLASE_FAQS, path }),
        ])
      ),
    ],
  }),
  component: JuegosParaClasePage,
});

const FORMATOS = [
  {
    nombre: 'Cuestionario',
    detalle:
      'Preguntas con una respuesta clara: datos, definiciones o gramática. El alumnado ve una pregunta cada vez.',
  },
  {
    nombre: 'Encontrar parejas y relacionar',
    detalle:
      'Términos y sus significados, palabras y traducciones. Se escriben una vez y se juegan de varias formas.',
  },
  {
    nombre: 'Relacionar con líneas',
    detalle:
      'El formato clásico de ficha de dos columnas, para completar en el navegador.',
  },
  {
    nombre: 'Clasificar en grupos',
    detalle:
      'Categorías, tipos de palabra o conceptos. Cada elemento va al grupo que le corresponde.',
  },
  {
    nombre: 'Completar la frase',
    detalle: 'Frases con una palabra que falta, para gramática y vocabulario.',
  },
  {
    nombre: 'Comprensión auditiva y abrir la caja',
    detalle:
      'Audios para dictado y escucha, o cajas numeradas para repasar en voz alta con toda la clase.',
  },
] as const;

function JuegosParaClasePage() {
  return (
    <Container className="px-4 py-10 md:py-16">
      <div className="mx-auto max-w-6xl space-y-16 pb-16">
        <section className="space-y-6 border-b pb-14">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconDeviceGamepad2 className="size-3.5" />
            Guía para docentes
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Juegos para clase: conviértelos en actividades que el alumnado
              juega
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Escribe tu contenido una vez, elige un formato y comparte un
              enlace. El alumnado juega en el navegador sin crear una cuenta, y
              tú ves los resultados cuando terminan.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className={cn(buttonVariants({ size: 'lg' }), 'w-fit rounded-lg')}
              to={getPathWithLocale(Routes.Create)}
              search={{ source: 'templates', template: 'quiz' }}
            >
              Crear un juego para clase
              <IconArrowRight className="size-4" />
            </Link>
            <Link
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'w-fit rounded-lg bg-background'
              )}
              to={getPathWithLocale(Routes.Templates)}
            >
              Ver las plantillas
            </Link>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Guardar tu actividad y publicar un enlace requiere una cuenta de
            docente.
          </p>
        </section>

        <section aria-labelledby="juegos-pasos" className="space-y-7">
          <div className="max-w-3xl space-y-3">
            <h2 id="juegos-pasos" className="text-3xl font-semibold">
              Cómo crear un juego para tu clase en tres pasos
            </h2>
            <p className="leading-7 text-muted-foreground">
              Un juego corto, de cinco a diez minutos, es fácil de repetir y los
              resultados te dicen qué repasar después.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <GuideStepCard
              number="01"
              title="Elige una plantilla"
              detail="Cada plantilla se abre con un ejemplo editable. Escoge la que encaja con tu contenido: preguntas, parejas o grupos."
            />
            <GuideStepCard
              number="02"
              title="Sustituye el ejemplo"
              detail="Escribe tus propias preguntas, parejas de palabras o grupos y guarda la actividad en tu espacio de docente."
            />
            <GuideStepCard
              number="03"
              title="Comparte el enlace"
              detail="Publica una tarea y comparte el enlace. Después consulta las puntuaciones y lo que más les costó al grupo."
            />
          </div>
        </section>

        <section aria-labelledby="juegos-formatos" className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <h2 id="juegos-formatos" className="text-3xl font-semibold">
              Formatos de juegos para clase
            </h2>
            <p className="leading-7 text-muted-foreground">
              El mismo contenido puede pasar de una plantilla a otra que use el
              mismo tipo de datos, así que puedes probar otro formato sin volver
              a escribirlo.
            </p>
          </div>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {FORMATOS.map((formato) => (
              <li
                className="rounded-lg border bg-card p-4"
                key={formato.nombre}
              >
                <span className="font-semibold">{formato.nombre}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {formato.detalle}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 rounded-xl border bg-muted/30 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Una idea para mañana</h2>
          <p className="max-w-3xl leading-7 text-muted-foreground">
            Elige diez palabras o ideas de la unidad, crea un cuestionario corto
            y compártelo al empezar la clase. Mientras el alumnado juega, nadie
            espera al más lento. Al terminar, abre los resultados, escoge los
            dos elementos que más se fallaron y dedica los siguientes minutos a
            repasarlos. Si prefieres una versión en papel, genera la{' '}
            <Link
              className="font-medium text-primary underline-offset-4 hover:underline"
              to={getPathWithLocale(Routes.Worksheets)}
            >
              ficha de emparejar
            </Link>{' '}
            con el mismo contenido.
          </p>
        </section>

        <GuideFaqSection
          faqs={JUEGOS_PARA_CLASE_FAQS}
          headingId="juegos-faq"
          title="Preguntas frecuentes"
        />
      </div>
    </Container>
  );
}
