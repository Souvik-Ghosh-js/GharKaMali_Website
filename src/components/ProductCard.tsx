import Link from "next/link";
import { useCart } from "@/store/cart";
import toast from "react-hot-toast";

const IcLeaf = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

interface ProductCardProps {
  product: any;
  index?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function ProductCard({ product: p, index = 0, style, className }: ProductCardProps) {
  const { items, addItem, updateQty, removeItem } = useCart();
  
  const qty = items.find((i) => i.id === p.id)?.qty ?? 0;
  const price = Number(p.price);
  const mrp = Number(p.mrp);
  const disc = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  const catName = typeof p.category === "string" ? p.category : p.category?.name || "General";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: p.id,
      name: p.name,
      price: price,
      mrp: mrp,
      gst_rate: Number(p.gst_rate) || 0,
      category: catName,
      icon: p.icon_key || "default",
    });
    toast.success(`${p.name} added!`, { duration: 1800 });
  };

  return (
    <div
      className={`product-tile ${className || ''}`}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 20,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid var(--border)",
        boxShadow: "var(--sh-sm)",
        animation: `fade-up 0.5s var(--ease) ${index * 40}ms both`,
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        ...style
      }}
    >
      <Link
        href={`/shop/${p.slug || p._id || p.id}`}
        style={{ textDecoration: "none", display: "flex", flexDirection: "column", flex: 1 }}
      >
        {/* Image Area */}
        <div
          className="product-img-area"
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            background: "#fff",
            position: "relative",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {p.images?.[0] || p.thumbnail ? (
            <img
              src={p.images?.[0] || p.thumbnail}
              alt={p.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                boxSizing: "border-box",
                display: "block",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div style={{ opacity: 0.18, color: "var(--forest)" }}>
              <IcLeaf />
            </div>
          )}
          {disc > 0 && (
            <div style={{
              position: "absolute", top: 10, left: 10,
              padding: "3px 10px",
              background: "var(--forest)", color: "#fff",
              borderRadius: 99, fontSize: "0.65rem", fontWeight: 900,
            }}>
              {disc}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "12px 14px 4px", borderTop: "1px solid var(--border)" }}>
          <span style={{
            fontSize: "0.62rem", color: "var(--earth)",
            fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            {catName}
          </span>
          <h3 style={{
            fontSize: "0.92rem", color: "var(--forest)", fontWeight: 700,
            margin: "4px 0 0", lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {p.name}
          </h3>
        </div>
      </Link>

      {/* Price + Add row */}
      <div style={{
        padding: "10px 14px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
      }}>
        <div>
          <div className="price-val" style={{
            fontWeight: 900, fontSize: "1.1rem",
            color: "var(--forest)", lineHeight: 1,
          }}>
            ₹{price.toLocaleString("en-IN")}
          </div>
          {mrp > price && (
            <div style={{
              fontSize: "0.68rem", color: "var(--text-faint)",
              textDecoration: "line-through", marginTop: 2,
            }}>
              ₹{mrp.toLocaleString("en-IN")}
            </div>
          )}
        </div>

        {qty > 0 ? (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--bg-elevated)", borderRadius: 10,
            padding: "3px 6px", border: "1.5px solid var(--border-mid)",
          }}>
            <button
              onClick={(e) => { e.preventDefault(); qty > 1 ? updateQty(p.id, qty - 1) : removeItem(p.id); }}
              style={{ width: 26, height: 26, borderRadius: 7, background: "#fff", border: "1px solid var(--border)", color: "var(--forest)", fontWeight: 900, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >−</button>
            <span style={{ fontWeight: 800, color: "var(--forest)", minWidth: 18, textAlign: "center", fontSize: "0.88rem" }}>{qty}</span>
            <button
              onClick={handleAdd}
              style={{ width: 26, height: 26, borderRadius: 7, background: "var(--forest)", border: "none", color: "#fff", fontWeight: 900, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >+</button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            style={{
              background: "var(--forest)", color: "#fff", border: "none",
              borderRadius: 10, padding: "8px 16px",
              fontWeight: 800, fontSize: "0.78rem", cursor: "pointer",
              fontFamily: "var(--font-body)", whiteSpace: "nowrap",
            }}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
