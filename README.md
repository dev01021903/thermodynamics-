# Development of a Thermodynamic Framework to Evaluate Entropy Generation, Heat Transfer, and Thermophysical Properties of Biological Fluids Under Varying Temperature Conditions

An educational website and interactive simulation dashboard built for biotechnology students, educators, and seminar evaluators.

---

## 🔬 Project Overview & Purpose

This computational platform demonstrates how temperature-dependent thermophysical properties ($\rho, C_p, k, \mu$) affect sensible heat transfer and Second-Law entropy generation ($S_{\text{gen}}$) in biological fluids and bioprocess systems.

The framework combines rigorous mathematical formulations (Simpson's numerical quadrature, Kelvin thermodynamic integration, Second-Law direction validation) with interactive charts, CSV property data management, literature benchmarking (Papers 1–5), and print-ready academic dossier reports.

> **Data Provenance & Scope:** This is a computational/literature-driven platform. It does not perform wet-lab clinical sample collection or claim to measure properties experimentally. All built-in sample models are clearly labeled as literature references or illustrative demo datasets.

---

## 🎯 Course Outcomes (CO) Alignment

- **CO-2:** Evaluate energy changes, thermal properties, and heat transfer using thermodynamic and calorimetric principles ($Q = m \int C_p(T) dT$).
- **CO-3:** Evaluate heat transfer, entropy changes, and thermodynamic behaviour in biological systems ($\Delta S_{\text{fluid}}, \Delta S_{\text{reservoir}}, S_{\text{gen}} \ge 0$).
- **CO-4:** Evaluate thermophysical properties and behaviour of biological fluids in bioprocess systems ($\rho(T), C_p(T), k(T), \mu(T)$).

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup & Launch
1. Clone or navigate to the project directory:
   ```bash
   cd /Users/devvashisht/Desktop/python/website
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the local Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the displayed URL (typically **`http://localhost:3000`** or `http://localhost:5173`).

4. Run the automated thermodynamic test suite:
   ```bash
   npm test
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 📊 How to Replace Illustrative Data with Published Literature

1. Navigate to the **Property Data Manager** tab.
2. Click **"Download CSV Template"** to inspect the required columns:
   - `Temperature_C`: Temperature in Celsius (°C)
   - `Density_kg_m3`: Density $\rho$ in $\text{kg/m}^3$
   - `SpecificHeat_J_kgK`: Specific heat capacity $C_p$ in $\text{J}/(\text{kg}\cdot\text{K})$
   - `ThermalConductivity_W_mK`: Thermal conductivity $k$ in $\text{W}/(\text{m}\cdot\text{K})$
   - `DynamicViscosity_Pa_s`: Dynamic viscosity $\mu$ in $\text{Pa}\cdot\text{s}$ (Note: $1\text{ mPa}\cdot\text{s} = 0.001\text{ Pa}\cdot\text{s}$)
3. Click **"Import Dataset (CSV)"** to upload your CSV file or paste tabular data.
4. Fill in the metadata fields:
   - **Fluid Name** & **Composition**
   - **Source Citation** (e.g., Peer-reviewed journal article, NIST, or bioprocess handbook)
   - **DOI / URL**
   - **Measurement / Estimation Method** (e.g., DSC, rotational viscometry, or empirical correlation)
5. Save the dataset. The simulation dashboard and graphs will immediately update to reflect your custom literature dataset.

---

## 📐 Governing Equations & Sign Conventions

### 1. Sensible Heat Energy
$$Q = m \int_{T_1}^{T_2} C_p(T) \, dT$$
- **Heating ($T_2 > T_1$):** $Q > 0$ (Thermal energy absorbed by fluid).
- **Cooling ($T_2 < T_1$):** $Q < 0$ (Thermal energy released by fluid).
- **Isothermal ($T_1 = T_2$):** $Q = 0$.

### 2. Fluid Entropy Change
$$\Delta S_{\text{fluid}} = m \int_{T_1}^{T_2} \frac{C_p(T)}{T + 273.15} \, dT$$
- Computed strictly using absolute temperature $T$ in Kelvin.

### 3. External Thermal Reservoir Entropy Change
$$\Delta S_{\text{reservoir}} = -\frac{Q}{T_r + 273.15}$$
- Thermal reservoir at constant uniform temperature $T_r$ in Kelvin.

### 4. Second-Law Entropy Generation
$$S_{\text{gen}} = \Delta S_{\text{fluid}} + \Delta S_{\text{reservoir}} \ge 0$$
- **Passive Direction Safeguard:** In passive heat exchange, heat cannot spontaneously flow from cold to hot. The dashboard strictly flags invalid reservoir conditions (e.g. heating with $T_r < T_2$) rather than reporting a false negative entropy generation.

### 5. Heat Transfer & Entropy Generation Rates (When $\Delta t$ is provided)
$$\dot{q}_{\text{avg}} = \frac{Q}{\Delta t} \quad [\text{W}], \qquad \dot{S}_{\text{gen,avg}} = \frac{S_{\text{gen}}}{\Delta t} \quad [\text{W/K}]$$

### 6. Newton's Instantaneous Rate Estimate (Optional $h, A$)
$$\dot{q}_{\text{inst}} = h A (T_r - T_{\text{fluid}}) \quad [\text{W}]$$
- Separately identified as an instantaneous condition estimate; distinct from the integrated average rate $\dot{q}_{\text{avg}}$.

---

## 🧪 Automated Testing Suite

The project includes deterministic unit tests verifying:
- Constant-$C_p$ heating analytical agreement.
- Constant-$C_p$ cooling analytical agreement.
- Isothermal boundary conditions ($T_1 = T_2$).
- Temperature conversion to Kelvin ($T_K = T_C + 273.15$).
- Passive heat transfer Second Law violation alerts.
- Out-of-bounds temperature prevention (no silent extrapolation).
- Average rate and Newton rate calculations.
