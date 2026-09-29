import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js refuse par défaut les requêtes vers /_next/* venant d'une origine
  // différente du serveur de développement. Sans cette liste, la prévisualisation
  // servie derrière le proxy *.e2b.app n'arrive pas à charger ses ressources.
  // Sans effet en production.
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],

  experimental: {
    serverActions: {
      // Les envois d'images depuis /admin passent par une Server Action. La
      // limite par défaut (1 Mo) est en dessous de ce qu'une photo peut peser :
      // elle rejetait la requête avant même que notre contrôle ne s'exécute,
      // avec une erreur technique à la place du message expliquant la limite.
      //
      // 6 Mo correspond au plafond de Netlify pour une fonction synchrone. Ses
      // envois binaires étant encodés en base64 (+30 %), la limite réellement
      // atteignable tourne autour de 4,5 Mo : la limite métier est fixée à 4 Mo
      // dans src/lib/image-rules.ts pour que ce soit toujours notre message qui
      // s'affiche.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
