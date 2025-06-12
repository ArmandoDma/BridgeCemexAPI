import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let datosGuardados = null;

app.post("/bridge", async (req, res) => {
  try {
    // Guardamos los datos para usarlos después con GET
    datosGuardados = req.body;

    console.log("Datos recibidos del flujo A y guardados:");
    console.log(datosGuardados);

    res.json({ mensaje: "Datos recibidos y almacenados correctamente" });
  } catch (error) {
    console.error("Error en POST /bridge:", error.message);
    res.status(500).json({ error: "Error al recibir los datos del flujo A" });
  }
});

app.get("/bridge", async (req, res) => {
  try {
    const { aprobado } = req.query;

    if (!aprobado) {
      return res.status(400).json({ error: "Falta el parámetro 'aprobado=true'" });
    }

    if (!datosGuardados) {
      return res.status(404).json({ error: "No hay datos guardados desde POST aún" });
    }

    // Clonamos los datos y le añadimos el aprobado
    const datosParaEnviar = {
      ...datosGuardados,
      aprobado: aprobado,
    };

    const urlFlujoB =
      "https://prod-166.westus.logic.azure.com:443/workflows/139e3ff9485244d68e40b4046d3a642f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RAPVgv5b9GUtyXmMHFEOM64dKvTBfK511nsjSpnrTtQ";

    const respuesta = await axios.post(urlFlujoB, datosParaEnviar, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Reenviado a flujo B desde GET:");
    console.log(respuesta.data);

    res.json({ mensaje: "Datos reenviados con éxito al flujo B desde GET" });
  } catch (error) {
    console.error("Error en GET /bridge:", error.message);
    res.status(500).json({ error: "Error al reenviar al flujo B desde GET" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
