import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { Event } from "@/events/entities/event.entity";
import { EventTranslation } from "@/i18n/entities";

const eventTemplates = [
  {
    name: {
      en: "Start of 1st Year/Master classes",
      pt: "Início das aulas 1º ano/Mestrado",
    },
    description: {
      en: "Start of classes for 1st year and Master students.",
      pt: "Início das aulas para estudantes do 1º ano e Mestrado.",
    },
    startDate: "2025-09-22T09:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: { en: "Start of classes, others", pt: "Início das aulas, restantes" },
    description: {
      en: "Start of classes for all other students.",
      pt: "Início das aulas para todos os restantes estudantes.",
    },
    startDate: "2025-09-15T09:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: {
      en: "FEUP Project Week (1st year/Bachelor)",
      pt: "Semana de Projetos FEUP (1º ano/Licenciatura)",
    },
    description: {
      en: "A week dedicated to FEUP projects for 1st year Bachelor students.",
      pt: "Semana dedicada aos projetos FEUP para estudantes de 1º ano de Licenciatura.",
    },
    startDate: "2025-09-15T09:00:00Z",
    endDate: "2025-09-19T18:00:00Z",
    year: null,
  },
  {
    name: { en: "New Masters Celebration", pt: "Celebração Novos Mestres" },
    description: {
      en: "Celebration event for new Masters graduates.",
      pt: "Evento de celebração para novos Mestres.",
    },
    startDate: "2025-11-22T17:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: { en: "FEUP Day", pt: "Dia da FEUP" },
    description: {
      en: "Annual FEUP Day celebration. Date to be defined.",
      pt: "Celebração anual do Dia da FEUP. Data a definir.",
    },
    startDate: null,
    endDate: null,
    year: null,
  },
  {
    name: {
      en: "FEUP and Staff Mobil. Week",
      pt: "Semana de Mobilidade FEUP e Pessoal",
    },
    description: {
      en: "Mobility week for FEUP staff and students.",
      pt: "Semana de mobilidade para pessoal e estudantes FEUP.",
    },
    startDate: "2025-10-27T09:00:00Z",
    endDate: "2025-10-31T18:00:00Z",
    year: null,
  },
  {
    name: { en: "Christmas Holidays", pt: "Férias de Natal" },
    description: { en: "Christmas holiday break.", pt: "Férias de Natal." },
    startDate: "2025-12-22T00:00:00Z",
    endDate: "2026-01-02T23:59:59Z",
    year: null,
  },
  {
    name: {
      en: "End of classes 1st Year/Bachelor",
      pt: "Fim das aulas 1º ano/Licenciatura",
    },
    description: {
      en: "End of classes for 1st year Bachelor students.",
      pt: "Fim das aulas para estudantes de 1º ano de Licenciatura.",
    },
    startDate: "2026-01-09T18:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: { en: "End of classes, others", pt: "Fim das aulas, restantes" },
    description: {
      en: "End of classes for all other students.",
      pt: "Fim das aulas para todos os restantes estudantes.",
    },
    startDate: "2025-12-19T18:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: { en: "Exams, 1st Year/Bachelor", pt: "Exames 1º ano/Licenciatura" },
    description: {
      en: "Exam period for 1st year Bachelor students.",
      pt: "Período de exames para estudantes de 1º ano de Licenciatura.",
    },
    startDate: "2026-01-12T09:00:00Z",
    endDate: "2026-02-06T18:00:00Z",
    year: null,
  },
  {
    name: { en: "Exams, others", pt: "Exames, restantes" },
    description: {
      en: "Exam period for all other students.",
      pt: "Período de exames para todos os restantes estudantes.",
    },
    startDate: "2026-01-05T09:00:00Z",
    endDate: "2026-02-06T18:00:00Z",
    year: null,
  },
  {
    name: { en: "Publication marks", pt: "Publicação de notas" },
    description: {
      en: "Publication of marks for the semester.",
      pt: "Publicação de notas do semestre.",
    },
    startDate: "2026-02-20T10:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: {
      en: "Special examination period, completion of cycle of studies, 1st call",
      pt: "Época especial, conclusão de ciclo de estudos, 1ª chamada",
    },
    description: {
      en: "Special exam period for completion of studies (1st call).",
      pt: "Época especial de exames para conclusão de estudos (1ª chamada).",
    },
    startDate: "2026-03-02T09:00:00Z",
    endDate: "2026-03-13T18:00:00Z",
    year: null,
  },
  {
    name: {
      en: "Publication marks, special exam. completion of cycle of studies, 1st call",
      pt: "Publicação de notas, época especial conclusão de estudos, 1ª chamada",
    },
    description: {
      en: "Publication of marks for special exam (completion of studies, 1st call).",
      pt: "Publicação de notas da época especial (conclusão de estudos, 1ª chamada).",
    },
    startDate: "2026-03-20T10:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: {
      en: "Special examination period, legally applicable status, 1st semester",
      pt: "Época especial, situação legalmente prevista, 1º semestre",
    },
    description: {
      en: "Special exam period for legally applicable status, 1st semester (until deadline).",
      pt: "Época especial de exames para situação legalmente prevista, 1º semestre (até ao prazo).",
    },
    startDate: null,
    endDate: "2026-04-30T23:59:59Z",
    year: null,
  },
  {
    name: {
      en: "Publication marks, special exam. legally applicable status, 1st semester",
      pt: "Publicação de notas, época especial situação legalmente prevista, 1º semestre",
    },
    description: {
      en: "Publication of marks for special exam, legally applicable status, 1st semester.",
      pt: "Publicação de notas da época especial, situação legalmente prevista, 1º semestre.",
    },
    startDate: "2026-05-13T10:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: { en: "Start of classes", pt: "Início das aulas" },
    description: {
      en: "Start of classes for the 2nd semester.",
      pt: "Início das aulas do 2º semestre.",
    },
    startDate: "2026-02-18T09:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: { en: "Carnival Holidays", pt: "Férias de Carnaval" },
    description: { en: "Carnival holiday break.", pt: "Férias de Carnaval." },
    startDate: "2026-02-16T00:00:00Z",
    endDate: "2026-02-17T23:59:59Z",
    year: null,
  },
  {
    name: { en: "U.Porto Day", pt: "Dia da U.Porto" },
    description: {
      en: "U.Porto Day celebration. Date to be defined.",
      pt: "Celebração do Dia da U.Porto. Data a definir.",
    },
    startDate: null,
    endDate: null,
    year: null,
  },
  {
    name: { en: "Easter Holidays", pt: "Férias da Páscoa" },
    description: { en: "Easter holiday break.", pt: "Férias da Páscoa." },
    startDate: "2026-03-30T00:00:00Z",
    endDate: "2026-04-06T23:59:59Z",
    year: null,
  },
  {
    name: {
      en: "Academic and Staff mobil. week",
      pt: "Semana de mobilidade académica e de pessoal",
    },
    description: {
      en: "Academic and staff mobility week.",
      pt: "Semana de mobilidade académica e de pessoal.",
    },
    startDate: "2026-05-04T09:00:00Z",
    endDate: "2026-05-08T18:00:00Z",
    year: null,
  },
  {
    name: { en: "End of classes", pt: "Fim das aulas" },
    description: {
      en: "End of classes for the 2nd semester.",
      pt: "Fim das aulas do 2º semestre.",
    },
    startDate: "2026-06-05T18:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: { en: "Exams", pt: "Exames" },
    description: {
      en: "Exam period for the 2nd semester.",
      pt: "Período de exames do 2º semestre.",
    },
    startDate: "2026-06-08T09:00:00Z",
    endDate: "2026-07-14T18:00:00Z",
    year: null,
  },
  {
    name: { en: "Publication marks", pt: "Publicação de notas" },
    description: {
      en: "Publication of marks for the 2nd semester.",
      pt: "Publicação de notas do 2º semestre.",
    },
    startDate: "2026-07-21T10:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: {
      en: "Special examination period, completion of cycle of studies, 2nd call",
      pt: "Época especial, conclusão de ciclo de estudos, 2ª chamada",
    },
    description: {
      en: "Special exam period for completion of studies (2nd call).",
      pt: "Época especial de exames para conclusão de estudos (2ª chamada).",
    },
    startDate: "2026-09-01T09:00:00Z",
    endDate: "2026-09-11T18:00:00Z",
    year: null,
  },
  {
    name: {
      en: "Publication marks, special exam. completion of cycle of studies, 2nd semester call",
      pt: "Publicação de notas, época especial conclusão de estudos, 2ª chamada",
    },
    description: {
      en: "Publication of marks for special exam (completion of studies, 2nd semester call).",
      pt: "Publicação de notas da época especial (conclusão de estudos, 2ª chamada).",
    },
    startDate: "2026-09-18T10:00:00Z",
    endDate: null,
    year: null,
  },
  {
    name: {
      en: "Special examination period, legally applicable status, 2nd semester",
      pt: "Época especial, situação legalmente prevista, 2º semestre",
    },
    description: {
      en: "Special exam period for legally applicable status, 2nd semester (until deadline).",
      pt: "Época especial de exames para situação legalmente prevista, 2º semestre (até ao prazo).",
    },
    startDate: null,
    endDate: "2026-11-27T23:59:59Z",
    year: null,
  },
  {
    name: {
      en: "Publication of marks, special exam. legally applicable status, 2nd",
      pt: "Publicação de notas, época especial situação legalmente prevista, 2º semestre",
    },
    description: {
      en: "Publication of marks for special exam, legally applicable status, 2nd semester.",
      pt: "Publicação de notas da época especial, situação legalmente prevista, 2º semestre.",
    },
    startDate: "2026-12-11T10:00:00Z",
    endDate: null,
    year: null,
  },
];

export default setSeederFactory(Event, () => {
  const template = faker.helpers.arrayElement(eventTemplates);

  const event = new Event();
  event.defaultLanguage = "en";
  event.startDate = template.startDate ? new Date(template.startDate) : null;
  event.endDate = template.endDate ? new Date(template.endDate) : null;

  const enTranslation = new EventTranslation();
  enTranslation.languageCode = "en";
  enTranslation.name = template.name.en;
  enTranslation.description = template.description.en;

  const ptTranslation = new EventTranslation();
  ptTranslation.languageCode = "pt";
  ptTranslation.name = template.name.pt;
  ptTranslation.description = template.description.pt;

  event.translations = [enTranslation, ptTranslation];

  return event;
});
