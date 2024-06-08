import { RouterProvider } from "@tanstack/react-router";
import { NotFound } from "./components/common/not-found/NotFound";
import { router } from ".";

const App = () => {
  return (
    <>
      <RouterProvider
        defaultNotFoundComponent={() => <NotFound />}
        router={router}
      />
    </>
  );
};

export default App;
