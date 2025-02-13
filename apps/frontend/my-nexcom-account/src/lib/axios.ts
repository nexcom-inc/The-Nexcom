import axios, { AxiosError } from "axios";
import { clearObjectStore } from "./indexDb";

const Axiosinstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 🔥 Envoie automatiquement les cookies de session
});

// Intercepteur des requêtes
Axiosinstance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Intercepteur des réponses
Axiosinstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error: AxiosError<{ message: string }>) {
    const response_message = error.response?.data.message;

    if (response_message === "Session invalide" || response_message === "Non authentifié") {
      clearObjectStore("profile"); // ❌ Nettoie les données stockées
      if (typeof window !== "undefined") {
        window.location.reload(); // 🔄 Recharge la page pour forcer la reconnexion
      }
    }
    return Promise.reject(error);
  }
);

export default Axiosinstance;
