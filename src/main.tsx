import ReactDOM from "react-dom/client";
import "./assets/global.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import rootRoute from "./pages";
import { Web3Modal, ToastRoot } from "./hooks";
import { StoreProvider } from "@/store";

const router = createBrowserRouter(rootRoute, {
  basename: import.meta.env.BASE_URL,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StoreProvider>
    <Web3Modal>
      <ToastRoot />
      <RouterProvider router={router} />
    </Web3Modal>
  </StoreProvider>
);
