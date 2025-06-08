const Mechanic = require('../models/Mechanic');
const jwt = require('jsonwebtoken');

// Registrar un nuevo mecánico
exports.registerMechanic = async (req, res) => {
  try {
    const { rut, pin, name, role } = req.body;

    // Verificar si el mecánico ya existe
    const existingMechanic = await Mechanic.findOne({ rut });
    if (existingMechanic) {
      return res.status(400).json({ message: 'El RUT ya está registrado' });
    }

    // Crear nuevo mecánico
    const mechanic = new Mechanic({
      rut,
      pin,
      name,
      role: role || 'mechanic'
    });

    await mechanic.save();

    res.status(201).json({
      message: 'Mecánico registrado exitosamente',
      mechanic: {
        rut: mechanic.rut,
        name: mechanic.name,
        role: mechanic.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar mecánico', error: error.message });
  }
};

// Iniciar sesión
exports.loginMechanic = async (req, res) => {
  try {
    const { rut, pin } = req.body;

    // Buscar mecánico por RUT
    const mechanic = await Mechanic.findOne({ rut });
    if (!mechanic) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar si el mecánico está activo
    if (!mechanic.active) {
      return res.status(401).json({ message: 'Cuenta desactivada' });
    }

    // Verificar PIN
    const isMatch = await mechanic.comparePin(pin);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: mechanic._id,
        rut: mechanic.rut,
        role: mechanic.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      mechanic: {
        rut: mechanic.rut,
        name: mechanic.name,
        role: mechanic.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

// Obtener información del mecánico actual
exports.getMechanicProfile = async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.mechanic.id).select('-pin');
    if (!mechanic) {
      return res.status(404).json({ message: 'Mecánico no encontrado' });
    }
    res.json(mechanic);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
}; 