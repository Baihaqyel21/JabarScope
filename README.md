# 🏔️ JabarScope Dashboard

### *Analisis Strategis & Prediktif Pembangunan Jawa Barat*

![Project Showcase](file:///C:/Users/haqyb/.gemini/antigravity/brain/8aee0a07-f544-4cc7-abc7-7c71a489ca8b/jabarscope_final_showcase_1776175985834.webp)

**JabarScope** adalah platform dashboard analitik modern yang dirancang untuk memvisualisasikan, menganalisis, dan memproyeksikan indikator pembangunan di Provinsi Jawa Barat. Proyek ini mengintegrasikan data statistik makro dengan teknik *Machine Learning* untuk memberikan wawasan yang mendalam dan prediktif bagi pengambilan kebijakan.

---

## ✨ Fitur Utama

### 1. 📈 Proyeksi & Forecasting Prediktif
Menggunakan model **Regresi Linier (OLS)** untuk memprediksi tren indikator utama hingga tahun **2028**.
- **Transparency**: Menampilkan nilai $R^2$ (Koefisien Determinasi) untuk setiap model.
- **Smart Insights**: Interpretasi otomatis terhadap tren (Meningkat/Menurun).
- **Confidence**: Visualisasi *Confidence Interval* 95% untuk akurasi data.

### 2. 🧠 Intelligent Clustering (Analisis Klaster)
Segmentasi wilayah berdasarkan profil pembangunan menggunakan algoritma **K-Means**.
- **Silhouette Optimized**: Mencapai Silhouette Score **> 0.7** (Kategorisasi Sangat Baik).
- **PCA Visualization**: Reduksi dimensi data ke ruang 2D untuk visualisasi persebaran daerah.
- **Policy Recommendations**: Rekomendasi kebijakan spesifik untuk setiap karakteristik klaster.

### 3. 🗺️ Geospasial & Choropleth Mapping
Peta interaktif yang menunjukkan sebaran indikator seperti IPM, Kemiskinan, dan Infrastruktur di seluruh Kabupaten/Kota di Jawa Barat.

### 4. 💎 High-Aesthetic UI/UX
Antarmuka pengguna bertema gelap (*Dark Mode*) yang premium dengan efek *Glassmorphism*, didukung oleh sistem navigasi yang responsif.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Data Analysis**: Pandas, NumPy
- **Machine Learning**: Scikit-Learn (K-Means, PCA)
- **Statistics**: SciPy (Linear Regression)

---

## 🚀 Cara Instalasi

### 1. Kloning Repositori
```bash
git clone https://github.com/Baihaqyel21/JabarScope.git
cd JabarScope
```

### 2. Setup Backend
```bash
# Buat virtual environment
python -m venv venv
source venv/bin/activate  # atau `venv\Scripts\activate` di Windows

# Install dependensi
pip install -r backend/requirements.txt

# Jalankan server FastAPI
python -m uvicorn backend.main:app --reload
```
*Backend akan berjalan di `http://127.0.0.1:8000`*

### 3. Setup Frontend
```bash
cd frontend

# Install dependensi
npm install

# Jalankan Next.js dev server
npm run dev
```
*Frontend akan berjalan di `http://localhost:3000`*

---

## 🎥 Preview Dashboard

````carousel
![Landing Page](file:///C:/Users/haqyb/.gemini/antigravity/brain/8aee0a07-f544-4cc7-abc7-7c71a489ca8b/final_landing_perfect_v4_1776178795281.webp)
<!-- slide -->
![Forecasting Clarity](file:///C:/Users/haqyb/.gemini/antigravity/brain/8aee0a07-f544-4cc7-abc7-7c71a489ca8b/forecast_clarity_verify_1776179517639.webp)
<!-- slide -->
![Clustering Analysis](file:///C:/Users/haqyb/.gemini/antigravity/brain/8aee0a07-f544-4cc7-abc7-7c71a489ca8b/jabarscope_klaster_page_1776176912980.png)
````

---

## 🤝 Kontribusi
Kontribusi sangat terbuka! Silakan lakukan *Pull Request* atau laporkan *Issue* jika menemukan bug atau ingin menambahkan fitur baru.

**Author**: [Baihaqyel21](https://github.com/Baihaqyel21)

---
*© 2024 JabarScope Project - Untuk Kemajuan Jawa Barat.*
