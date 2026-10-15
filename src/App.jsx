import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/medicines";

function App() {
  const [medicines, setMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Tablet",
    batch: "",
    stock: "",
    expiry: "",
    price: "",
  });

  const loadMedicines = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      setMedicines(
        data.map((m) => ({
          id: m.id,
          name: m.name,
          category: m.category,
          batch: m.batchNumber,
          stock: m.stock,
          expiry: m.expiryDate,
          price: m.price,
        }))
      );
    } catch (error) {
      console.error("Backend error:", error);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.batch ||
      !form.stock ||
      !form.expiry ||
      !form.price
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const medicine = {
      name: form.name,
      category: form.category,
      batchNumber: form.batch,
      expiryDate: form.expiry,
      price: Number(form.price),
      stock: Number(form.stock),
      supplier: "MediStock",
      genericName: null,
      manufacturer: null,
      purchasePrice: 0,
      reorderLevel: 10,
      sellingPrice: Number(form.price),
      stockQuantity: Number(form.stock),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicine),
      });

      if (!response.ok) {
        throw new Error("Failed to add medicine");
      }

      setForm({
        name: "",
        category: "Tablet",
        batch: "",
        stock: "",
        expiry: "",
        price: "",
      });

      setShowModal(false);
      await loadMedicines();

      alert("Medicine added successfully!");
    } catch (error) {
      console.error(error);
      alert("Could not add medicine. Make sure Spring Boot is running.");
    }
  };

  const deleteMedicine = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      loadMedicines();
    } catch (error) {
      console.error(error);
    }
  };

  const totalStock = medicines.reduce(
    (sum, medicine) => sum + Number(medicine.stock || 0),
    0
  );

  const lowStock = medicines.filter(
    (medicine) => Number(medicine.stock) <= 10
  ).length;

  const today = new Date();
  const ninetyDays = new Date();
  ninetyDays.setDate(today.getDate() + 90);

  const expiringSoon = medicines.filter((medicine) => {
    const expiry = new Date(medicine.expiry);
    return expiry >= today && expiry <= ninetyDays;
  }).length;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>MediStock</h1>
          <p style={styles.subtitle}>Smart Medicine Inventory</p>
        </div>

        <div style={styles.user}>
          <div style={styles.avatar}>JD</div>
          <div>
            <strong>J Deepak</strong>
            <small>Administrator</small>
          </div>
        </div>
      </header>

      <nav style={styles.nav}>
        <span style={styles.activeNav}>Dashboard</span>
        <span>Medicines</span>
        <span>Sales</span>
        <span>Reports</span>
      </nav>

      <main style={styles.main}>
        <div style={styles.top}>
          <div>
            <h2>Dashboard</h2>
            <p>Manage your medicine inventory, stock and expiry dates.</p>
          </div>

          <button
            style={styles.addButton}
            onClick={() => setShowModal(true)}
          >
            + Add Medicine
          </button>
        </div>

        <div style={styles.stats}>
          <div style={styles.card}>
            <small>TOTAL MEDICINES</small>
            <h2>{medicines.length}</h2>
            <p>Medicines in inventory</p>
          </div>

          <div style={styles.card}>
            <small>TOTAL STOCK</small>
            <h2>{totalStock}</h2>
            <p>Units available</p>
          </div>

          <div style={styles.card}>
            <small>LOW STOCK</small>
            <h2>{lowStock}</h2>
            <p>Need attention</p>
          </div>

          <div style={styles.card}>
            <small>EXPIRING SOON</small>
            <h2>{expiringSoon}</h2>
            <p>Within 90 days</p>
          </div>
        </div>

        <section style={styles.section}>
          <div style={styles.sectionTop}>
            <div>
              <h2>Recent Medicines</h2>
              <p>Medicines currently stored in your database.</p>
            </div>

            <button
              style={styles.outlineButton}
              onClick={() => setShowModal(true)}
            >
              + Add Medicine
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Batch</th>
                  <th>Stock</th>
                  <th>Expiry</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td><strong>{medicine.name}</strong></td>
                    <td>{medicine.category}</td>
                    <td>{medicine.batch}</td>
                    <td>{medicine.stock}</td>
                    <td>{medicine.expiry}</td>
                    <td>₹{Number(medicine.price).toFixed(2)}</td>
                    <td>
                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteMedicine(medicine.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalTop}>
              <div>
                <h2>Add Medicine</h2>
                <p>Enter medicine details below.</p>
              </div>

              <button
                style={styles.close}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddMedicine}>
              <div style={styles.formGrid}>
                <label>
                  Medicine Name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Example: Paracetamol"
                  />
                </label>

                <label>
                  Category *
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option>Tablet</option>
                    <option>Capsule</option>
                    <option>Syrup</option>
                    <option>Injection</option>
                    <option>Cream</option>
                    <option>Drops</option>
                  </select>
                </label>

                <label>
                  Batch Number *
                  <input
                    name="batch"
                    value={form.batch}
                    onChange={handleChange}
                    placeholder="B1001"
                  />
                </label>

                <label>
                  Stock Quantity *
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                  />
                </label>

                <label>
                  Expiry Date *
                  <input
                    type="date"
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Price *
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                  />
                </label>
              </div>

              <div style={styles.actions}>
                <button
                  type="button"
                  style={styles.cancel}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" style={styles.save}>
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily: "Arial, sans-serif",
    color: "#1f2937",
  },

  header: {
    background: "#ffffff",
    padding: "20px 50px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ddd",
  },

  logo: {
    margin: 0,
    color: "#2563eb",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
  },

  user: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  },

  nav: {
    background: "white",
    padding: "15px 50px",
    display: "flex",
    gap: "30px",
    borderBottom: "1px solid #ddd",
  },

  activeNav: {
    color: "#2563eb",
    fontWeight: "bold",
  },

  main: {
    maxWidth: "1400px",
    margin: "auto",
    padding: "35px 50px",
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  addButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "13px 20px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },

  card: {
    background: "white",
    padding: "22px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  section: {
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },

  sectionTop: {
    padding: "22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  outlineButton: {
    background: "white",
    color: "#2563eb",
    border: "1px solid #2563eb",
    padding: "10px 15px",
    borderRadius: "7px",
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  modal: {
    background: "white",
    width: "100%",
    maxWidth: "650px",
    borderRadius: "14px",
    padding: "28px",
  },

  modalTop: {
    display: "flex",
    justifyContent: "space-between",
  },

  close: {
    border: "none",
    background: "transparent",
    fontSize: "28px",
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "25px",
  },

  cancel: {
    padding: "11px 18px",
    border: "1px solid #ccc",
    background: "white",
    borderRadius: "7px",
    cursor: "pointer",
  },

  save: {
    padding: "11px 18px",
    border: "none",
    background: "#2563eb",
    color: "white",
    borderRadius: "7px",
    cursor: "pointer",
  },

  deleteButton: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    padding: "7px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default App;