"use client";

import { useState } from "react";
import { createProduct, updateProduct, toggleProduct, deleteProduct } from "@/app/actions/products";
import { ProductData } from "@/types";

interface ProductsClientProps {
  initialProducts: ProductData[];
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Inicial");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setName("");
    setLevel("Inicial");
    setPrice("");
    setIsAdding(false);
    setEditingId(null);
  }

  function handleEdit(p: ProductData) {
    setName(p.name);
    setLevel(p.level);
    setPrice(p.price.toString());
    setEditingId(p.id);
    setIsAdding(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice)) throw new Error("Precio inválido");

      if (editingId) {
        const updated = await updateProduct(editingId, { name, level, price: numericPrice });
        // update local state
        setProducts(products.map(p => (p.id === editingId ? { ...p, name, level, price: numericPrice } : p)));
      } else {
        const created = await createProduct({ name, level, price: numericPrice });
        setProducts([...products, created]);
      }
      resetForm();
    } catch (err) {
      alert("Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, active: boolean) {
    await toggleProduct(id, active);
    setProducts(products.map(p => (p.id === id ? { ...p, active } : p)));
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Productos Educativos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Gestiona los niveles escolares (Inicial, EGB, BGU) y sus valores para el cálculo del revenue.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn btn-primary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            + Añadir Producto
          </button>
        )}
      </div>

      {isAdding && (
        <div className="card card-elevated p-6 mb-8 border-l-4" style={{ borderLeftColor: 'var(--color-accent-500)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            {editingId ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium mb-1">Nombre (ej. Inicial 1)</label>
              <input 
                required 
                className="input text-sm" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Inicial 1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Nivel</label>
              <select 
                className="input text-sm" 
                value={level} 
                onChange={e => setLevel(e.target.value)}
              >
                <option value="Inicial">Inicial</option>
                <option value="EGB">EGB (Educación General Básica)</option>
                <option value="BGU">BGU (Bachillerato)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Precio (USD $)</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                className="input text-sm" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                placeholder="250.00"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? "..." : "Guardar"}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ background: 'var(--color-surface-secondary)', borderBottom: '1px solid var(--color-border-light)' }}>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Nivel</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Nombre</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Valor (USD)</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Estado</th>
                <th className="px-4 py-3 font-semibold text-right" style={{ color: 'var(--color-text-secondary)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                    No hay productos configurados. Añade uno para comenzar.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50" style={{ borderColor: 'var(--color-border-light)' }}>
                    <td className="px-4 py-3">
                      <span className="badge badge-gray">{p.level}</span>
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {p.name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleToggle(p.id, !p.active)}
                        className={`badge ${p.active ? 'badge-green' : 'badge-red'} cursor-pointer hover:opacity-80 transition-opacity`}
                      >
                        {p.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
