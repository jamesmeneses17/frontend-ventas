import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "@/components/layout/Layout";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="grid grid-cols-4 gap-6 mt-6">
          {/* Aquí metes las cards de productos, ventas, etc. */}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
