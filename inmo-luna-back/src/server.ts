import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '../data/properties.json');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'luna2026';
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

interface Property {
    id: number;
    titulo: string;
    tipo: 'venta' | 'alquiler';
    precio: number;
    moneda: string;
    habitaciones: number;
    banos: number;
    m2: number;
    ubicacion: string;
    descripcion: string;
    fotos: string[];
}

function readProperties(): Property[] {
    const data = readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
}

function writeProperties(properties: Property[]): void {
    writeFileSync(DATA_FILE, JSON.stringify(properties, null, 4), 'utf-8');
}

// Middleware de autenticación
const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Token requerido' });
        return;
    }

    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) {
            res.status(403).json({ error: 'Token inválido o expirado' });
            return;
        }
        next();
    });
};

const app = express();
app.use(cors());
app.use(express.json());

// Login Admin
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token });
        return;
    }

    res.status(401).json({ error: 'Credenciales inválidas' });
});

// GET - Listar todas las propiedades
app.get('/api/properties', (_req, res) => {
    const properties = readProperties();
    res.json(properties);
});

// GET - Obtener una propiedad por ID
app.get('/api/properties/:id', (req, res) => {
    const properties = readProperties();
    const property = properties.find(p => p.id === parseInt(String(req.params.id)));

    if (!property) {
        res.status(404).json({ error: 'Propiedad no encontrada' });
        return;
    }

    res.json(property);
});

// POST - Crear nueva propiedad (Protegido)
app.post('/api/properties', verifyToken, (req, res) => {
    const properties = readProperties();

    const newProperty: Property = {
        id: properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1,
        titulo: req.body.titulo,
        tipo: req.body.tipo,
        precio: req.body.precio,
        moneda: req.body.moneda,
        habitaciones: req.body.habitaciones,
        banos: req.body.banos,
        m2: req.body.m2,
        ubicacion: req.body.ubicacion,
        descripcion: req.body.descripcion,
        fotos: req.body.fotos || []
    };

    properties.push(newProperty);
    writeProperties(properties);

    res.status(201).json(newProperty);
});

// PUT - Editar propiedad existente (Protegido)
app.put('/api/properties/:id', verifyToken, (req, res) => {
    const properties = readProperties();
    const index = properties.findIndex(p => p.id === parseInt(String(req.params.id)));

    if (index === -1) {
        res.status(404).json({ error: 'Propiedad no encontrada' });
        return;
    }

    properties[index] = {
        ...properties[index],
        titulo: req.body.titulo,
        tipo: req.body.tipo,
        precio: req.body.precio,
        moneda: req.body.moneda,
        habitaciones: req.body.habitaciones,
        banos: req.body.banos,
        m2: req.body.m2,
        ubicacion: req.body.ubicacion,
        descripcion: req.body.descripcion,
        fotos: req.body.fotos || []
    };

    writeProperties(properties);
    res.json(properties[index]);
});

// DELETE - Eliminar propiedad (Protegido)
app.delete('/api/properties/:id', verifyToken, (req, res) => {
    const properties = readProperties();
    const index = properties.findIndex(p => p.id === parseInt(String(req.params.id)));

    if (index === -1) {
        res.status(404).json({ error: 'Propiedad no encontrada' });
        return;
    }

    const deleted = properties.splice(index, 1);
    writeProperties(properties);

    res.json(deleted[0]);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});