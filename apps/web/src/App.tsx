import { BrowserRouter, Link, Route, Routes } from "react-router";
import { Button } from "@/components/ui/button";
import { SidebarLayout } from "@/components/sidebar-layout";

function Home() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-medium text-lg">Home Page</h1>
      <p>Welcome to NIddle! You may now add components and start building.</p>
      <p>We&apos;ve already added the button component for you.</p>
      <div>
        <Button className="mt-2">
          <Link
            to="/dashboard"
            className="text-inherit no-underline flex items-center justify-center w-full h-full"
          >
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-medium text-lg">Dashboard</h1>
      <p>This is the protected dashboard view area.</p>
      <div>
        <Button className="mt-2" variant="outline">
          <Link
            to="/"
            className="text-inherit no-underline flex items-center justify-center w-full h-full"
          >
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col gap-4 text-center py-12">
      <h1 className="font-bold text-2xl">404</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <div>
        <Button className="mt-2">
          <Link
            to="/"
            className="text-inherit no-underline flex items-center justify-center w-full h-full"
          >
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
