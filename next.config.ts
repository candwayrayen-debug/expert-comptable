import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js refuse par défaut les requêtes vers /_next/* venant d'une origine
  // différente du serveur de développement. Sans cette liste, la prévisualisation
  // servie derrière le proxy *.e2b.app n'arrive pas à charger ses ressources.
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],

  experimental: {
    serverActions: {
      // Les envois d'images depuis /admin passent par une Server Action. La
      // limite par défaut (1 Mo) est en dessous de ce qu'une photo prise au
      // téléphone peut peser : elle rejetait la requête avant même que notre
      // contrôle ne s'exécute, avec une erreur technique à la place du message
      // expliquant la limite de 5 Mo.
      //
      // La marge est volontairement large (12 Mo pour une limite métier de
      // 5 Mo) afin que ce soit toujours notre message qui s'affiche. Le
      // garde-fou du framework reste utile pour borner la taille d'un corps de
      // requête, l'action n'étant par ailleurs accessible qu'aux administrateurs.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
