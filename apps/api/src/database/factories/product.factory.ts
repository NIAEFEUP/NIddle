import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import {
  ProductLinkDto,
  ProductLinkTag,
} from "@/products/dto/product-link.dto";
import { Product } from "@/products/entities/product.entity";

const typescript: ProductLinkDto = {
  label: "TypeScript",
  url: "https://www.typescriptlang.org",
  iconPath: "/api_images/technologies/typescript.png",
  tag: ProductLinkTag.TECHNOLOGY,
};

const tailwind: ProductLinkDto = {
  label: "TailwindCSS",
  url: "https://tailwindcss.com",
  iconPath: "/api_images/technologies/tailwind.png",
  tag: ProductLinkTag.TECHNOLOGY,
};

const vite: ProductLinkDto = {
  label: "Vite",
  url: "https://vitejs.dev",
  iconPath: "/api_images/technologies/vite.png",
  tag: ProductLinkTag.TECHNOLOGY,
};

const products = [
  {
    title: "uni",
    description:
      "A uni é uma aplicação móvel criada pelo NIFEUP para ajudar os estudantes da Universidade do Porto a gerir a vida académica num só sítio. A app agrega dados da plataforma da faculdade e de outros serviços, disponibilizando informações como horários, exames, notas e recursos do campus. Requer autenticação com conta académica.",
    slogan: "A UP no teu bolso.",
    targetAudience: "Comunidade Académica da Universidade do Porto",
    image: "/api_images/projects/uni_logo.png",
    thumbnail: "/api_images/projects/uni_banner.png",
    links: [
      {
        label: "GitHub",
        url: "https://github.com/niaefeup/uni",
        tag: ProductLinkTag.SOCIAL,
      },
      {
        label: "Google Play",
        url: "https://play.google.com/store/apps/details?id=pt.up.fe.ni.uni",
        iconPath: "/api_images/projects/google_play.svg",
        tag: ProductLinkTag.SOCIAL,
      },
      {
        label: "App Store",
        url: "https://apps.apple.com/pt/app/uni/id1585951339",
        iconPath: "/api_images/projects/app_store.svg",
        tag: ProductLinkTag.SOCIAL,
      },
      {
        label: "Flutter",
        url: "https://flutter.dev",
        iconPath: "/api_images/technologies/flutter.png",
        tag: ProductLinkTag.TECHNOLOGY,
      },
    ],
  },
  {
    title: "TimeTable Selector",
    description:
      "O TimeTable Selector (TTS) é uma plataforma desenvolvida pelo NIFEUP onde os estudantes podem experimentar as possíveis combinações de horários que podem escolher no início de cada semestre. Com ele, podes explorar e planear o teu horário ideal antes de o oficializares.",
    slogan: "Planeia o teu semestre perfeito.",
    targetAudience: "Comunidade Académica da Universidade do Porto",
    image: "/api_images/projects/tts_logo.png",
    thumbnail: "/api_images/projects/tts_screenshot.png",
    links: [
      {
        label: "GitHub",
        url: "https://github.com/niaefeup/tts-fe",
        tag: ProductLinkTag.SOCIAL,
      },
      {
        label: "React",
        url: "https://react.dev",
        iconPath: "/api_images/technologies/react.png",
        tag: ProductLinkTag.TECHNOLOGY,
      },
      {
        label: "Django",
        url: "https://www.djangoproject.com",
        iconPath: "/api_images/technologies/django.png",
        tag: ProductLinkTag.TECHNOLOGY,
      },
      typescript,
      tailwind,
      vite,
    ],
  },
  {
    title: "Website NIFEUP",
    description:
      "O website do NIFEUP, desenvolvido pelo núcleo, apresenta a missão da associação, os seus membros, projetos, eventos, workshops e oportunidades.",
    slogan: "A nossa cara na web.",
    targetAudience: "Público em geral",
    image: "/api_images/projects/website_logo.png",
    thumbnail: "/api_images/projects/website_screenshot.png",
    links: [
      {
        label: "GitHub",
        url: "https://github.com/niaefeup/website-niaefeup-frontend",
        tag: ProductLinkTag.SOCIAL,
      },
      {
        label: "SvelteKit",
        url: "https://kit.svelte.dev",
        iconPath: "/api_images/technologies/svelte.png",
        tag: ProductLinkTag.TECHNOLOGY,
      },
      typescript,
      tailwind,
      vite,
    ],
  },
  {
    title: "NIployments",
    description:
      "A NIployments é a infraestrutura como código do cluster Kubernetes do NIFEUP. Configura os nós bare-metal, gere a rede e faz o deploy de todos os serviços do núcleo, garantindo que as aplicações do NIFEUP estão sempre disponíveis.",
    slogan: "A infraestrutura por detrás das aplicações do NIFEUP.",
    targetAudience: "Equipa de Infraestruturas do NIFEUP",
    image: "/api_images/technologies/kubernetes.png",
    thumbnail: "/api_images/projects/niployments_screenshot.png",
    links: [
      {
        label: "GitHub",
        url: "https://github.com/niaefeup/niployments",
        tag: ProductLinkTag.SOCIAL,
      },
      {
        label: "Kubernetes",
        url: "https://kubernetes.io",
        iconPath: "/api_images/technologies/kubernetes.png",
        tag: ProductLinkTag.TECHNOLOGY,
      },
      {
        label: "Ansible",
        url: "https://www.ansible.com",
        iconPath: "/api_images/technologies/ansible.png",
        tag: ProductLinkTag.TECHNOLOGY,
      },
    ],
  },
];

export default setSeederFactory(Product, () => {
  const data = faker.helpers.arrayElement(products);

  const product = new Product();
  product.title = data.title;
  product.description = data.description;
  product.slogan = data.slogan;
  product.targetAudience = data.targetAudience;
  product.image = data.image;
  product.thumbnail = data.thumbnail;
  product.links = data.links;
  product.isArchived = false;
  product.gallery = [];

  return product;
});
