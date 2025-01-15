const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const influencerRoutes = require('./routes/influencers');

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next();
});

// Routes
app.use('/api/influencers', influencerRoutes);

// Rutas de análisis
app.post('/api/analysis/claim', async (req, res) => {
    try {
        console.log('Recibida solicitud de análisis de claim:', req.body);
        const analysisController = require('./controllers/analysisController');
        await analysisController.analyzeClaim(req, res);
    } catch (error) {
        console.error('Error detallado en /api/analysis/claim:', error);
        console.error('Stack trace:', error.stack);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        res.status(500).json({ 
            error: 'Error al analizar claim',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            groqError: error.response ? error.response.data : undefined
        });
    }
});

app.post('/api/analysis/influencer', async (req, res) => {
    try {
        console.log('Recibida solicitud de análisis de influencer:', req.body);
        const analysisController = require('./controllers/analysisController');
        await analysisController.analyzeInfluencer(req, res);
    } catch (error) {
        console.error('Error detallado en /api/analysis/influencer:', error);
        console.error('Stack trace:', error.stack);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        res.status(500).json({ 
            error: 'Error al analizar influencer',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            groqError: error.response ? error.response.data : undefined
        });
    }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
    console.log('API Test - Variables de entorno:');
    console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Configurada' : 'No configurada');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Configurada' : 'No configurada');
    console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada');
    
    res.json({ 
        status: 'ok', 
        message: 'API funcionando correctamente',
        env: {
            groq: process.env.GROQ_API_KEY ? 'Configurada' : 'No configurada',
            supabase: process.env.SUPABASE_URL ? 'Configurada' : 'No configurada'
        }
    });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    console.error('Stack trace:', err.stack);
    if (err.response) {
        console.error('Error response:', err.response.data);
    }
    res.status(500).json({ 
        error: 'Error en el servidor',
        message: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        groqError: err.response ? err.response.data : undefined
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
    console.log('Variables de entorno cargadas:');
    console.log('- GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Configurada' : 'No configurada');
    console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'Configurada' : 'No configurada');
    console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada');
});
